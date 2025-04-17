"use client";

import { Textarea } from "../../components/TextArea";
import { Button } from "../../components/Button";
import { Select } from "../components/Select";
import { useState, useEffect, useRef } from "react";
import { createPublicClient, http, webSocket } from 'viem';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BlockWatcher, BlockInfo } from "./BlockWatcher"; // Assuming BlockWatcher is in the same directory or path adjusted

// Define a type for the bucketed data
interface BucketedData {
    transactions: number;
    gasUsed: bigint;
    blockCount: number;
}

// Define the structure for chart data points, accommodating multiple chains
interface ChartDataPoint {
    time: string;
    timestamp: number;
    [key: string]: number | string; // Index signature for chain-specific data (e.g., 'rpc1_tx', 'rpc2_gas')
}

// Define a color palette for charts
const CHAIN_COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088aa",
    "#d0ed57", "#a4de6c", "#8dd1e1", "#83a6ed", "#f4a582",
];

export default function CrosschainMonitoring() {
    // State for RPC URLs input (textarea) and parsed list
    const [rpcUrlsInput, setRpcUrlsInput] = useState('');
    const [rpcUrls, setRpcUrls] = useState<string[]>([]);

    // Monitoring state
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Configuration state
    const [timeRange, setTimeRange] = useState("60"); // in seconds
    const [blockHistory, setBlockHistory] = useState("100"); // number of blocks

    // Data state: Map<RPC_URL, Map<Timestamp, BucketedData>>
    const [dataMap, setDataMap] = useState<Map<string, Map<number, BucketedData>>>(new Map());

    // Chart data state
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

    // Refs for block watchers and update timer
    const blockWatchersRef = useRef<Map<string, BlockWatcher>>(new Map());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Effect to parse RPC URLs from the textarea input
    useEffect(() => {
        const urls = rpcUrlsInput
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ws://') || url.startsWith('wss://')));
        setRpcUrls(urls);
    }, [rpcUrlsInput]);

    // --- Time Bucketing Logic (copied from PerformanceMonitor) ---
    const getBucketResolution = (): { seconds: number, label: string } => {
        switch (timeRange) {
            case "60": case "300": return { seconds: 1, label: "second" };
            case "900": case "1800": case "3600": case "10800": return { seconds: 60, label: "minute" };
            case "86400": case "345600": return { seconds: 3600, label: "hour" };
            default: return { seconds: 1, label: "second" };
        }
    };
    const getBucketTimestamp = (timestamp: number): number => {
        const { seconds } = getBucketResolution();
        return Math.floor(timestamp / seconds) * seconds;
    };
    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        const { label } = getBucketResolution();
        if (label === "hour" || label === "minute") {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    };
    // --- End Time Bucketing Logic ---

    // Effect to update chart data based on dataMap and timeRange
    useEffect(() => {
        if (!isMonitoring || rpcUrls.length === 0) {
            setChartData([]); // Clear chart if not monitoring or no URLs
            return;
        }

        const updateChartData = () => {
            const now = Math.floor(Date.now() / 1000);
            const timeRangeSeconds = Number(timeRange);
            const { seconds: bucketResolution } = getBucketResolution();
            const endTime = getBucketTimestamp(now - 5); // Hide last few seconds
            const numBuckets = Math.floor(timeRangeSeconds / bucketResolution);
            const timelineStart = endTime - (numBuckets - 1) * bucketResolution;

            const completeTimeline: number[] = Array.from(
                { length: numBuckets },
                (_, i) => timelineStart + i * bucketResolution
            );

            const newChartData = completeTimeline.map(timestamp => {
                const point: ChartDataPoint = {
                    time: formatTimestamp(timestamp),
                    timestamp: timestamp,
                };

                let totalTx = 0;
                let totalGas = 0;
                let totalBlocks = 0;

                rpcUrls.forEach(url => {
                    const chainDataMap = dataMap.get(url);
                    const bucketData = chainDataMap?.get(timestamp) || {
                        transactions: 0,
                        gasUsed: BigInt(0),
                        blockCount: 0
                    };

                    const secondsInBucket = bucketResolution;
                    const txPerSecond = bucketData.transactions / secondsInBucket;
                    const gasPerSecond = Number(bucketData.gasUsed) / secondsInBucket;
                    const blocksPerSecond = bucketData.blockCount / secondsInBucket;

                    // Add data for this specific chain to the point
                    point[`${url}_tx`] = txPerSecond;
                    point[`${url}_gas`] = gasPerSecond;
                    point[`${url}_blocks`] = blocksPerSecond;

                    // Accumulate totals (optional, could be used for average lines etc.)
                    totalTx += txPerSecond;
                    totalGas += gasPerSecond;
                    totalBlocks += blocksPerSecond;
                });

                // Add total values if needed for reference lines or separate charts
                // point['total_tx'] = totalTx;
                // point['total_gas'] = totalGas;
                // point['total_blocks'] = totalBlocks;


                return point;
            });

            setChartData(newChartData);
        };

        updateChartData(); // Initial update
        const updateInterval = Math.max(getBucketResolution().seconds * 1000 / 2, 500); // Update frequently but not excessively
        timerRef.current = setInterval(updateChartData, updateInterval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isMonitoring, dataMap, timeRange, rpcUrls]); // Rerun when URLs change too

    // Cleanup effect for stopping watchers on unmount
    useEffect(() => {
        return () => {
            stopMonitoring(); // Ensure watchers are stopped
        };
    }, []);

    // Function to start monitoring all configured chains
    async function startMonitoring() {
        setError(null);
        stopMonitoring(); // Stop any existing monitoring first
        setDataMap(new Map()); // Reset data
        setChartData([]);

        if (rpcUrls.length === 0) {
            setError("Please provide at least one valid RPC URL.");
            return;
        }

        setIsMonitoring(true);
        const blockHistoryNum = parseInt(blockHistory);
        const newWatchers = new Map<string, BlockWatcher>();

        // Use Promise.allSettled to handle potential errors for individual chains
        const results = await Promise.allSettled(rpcUrls.map(async (url) => {
            try {
                const transport = url.startsWith('http') ? http(url) : webSocket(url);
                const publicClient = createPublicClient({ transport });

                // Initialize the data map for this URL
                setDataMap(prev => new Map(prev).set(url, new Map()));

                const lastBlock = Number(await publicClient.getBlockNumber());
                const startFromBlock = Math.max(lastBlock - 10, 1); // Start slightly behind

                const blockWatcher = new BlockWatcher(publicClient, (blockInfo: BlockInfo) => {
                    const bucketTime = getBucketTimestamp(blockInfo.timestamp);

                    setDataMap(prevMap => {
                        const newMap = new Map(prevMap);
                        const chainMap = new Map(newMap.get(url) || []); // Get or create map for this chain

                        const existingData = chainMap.get(bucketTime) || {
                            transactions: 0,
                            gasUsed: BigInt(0),
                            blockCount: 0
                        };

                        chainMap.set(bucketTime, {
                            transactions: existingData.transactions + blockInfo.transactionCount,
                            gasUsed: existingData.gasUsed + blockInfo.gasUsed,
                            blockCount: existingData.blockCount + 1
                        });

                        newMap.set(url, chainMap); // Update the main map
                        return newMap;
                    });
                });

                newWatchers.set(url, blockWatcher); // Store watcher before starting
                blockWatcher.start(startFromBlock, blockHistoryNum);
                console.log(`Started monitoring ${url}`);

            } catch (err) {
                console.error(`Failed to start monitoring ${url}:`, err);
                // Propagate the error to be shown in the UI
                throw new Error(`Failed for ${url}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }));

        // Update the ref with successfully created watchers
        blockWatchersRef.current = newWatchers;

        // Collect and display errors from chains that failed to start
        const failedChains = results
            .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
            .map(result => result.reason.message)
            .join('; ');

        if (failedChains) {
            setError(`Monitoring started, but failed for some chains: ${failedChains}`);
        }
        // If all chains failed, stop monitoring entirely
        if (newWatchers.size === 0 && rpcUrls.length > 0) {
            setError(`Failed to start monitoring any chain. Errors: ${failedChains}`);
            setIsMonitoring(false);
        }

    }

    // Function to stop monitoring all chains
    function stopMonitoring() {
        blockWatchersRef.current.forEach((watcher, url) => {
            try {
                watcher.stop();
                console.log(`Stopped monitoring ${url}`);
            } catch (e) {
                console.error(`Error stopping watcher for ${url}:`, e);
            }
        });
        blockWatchersRef.current.clear(); // Clear the map of watchers

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsMonitoring(false); // Set state after cleanup
    }

    // Helper to shorten RPC URLs for display in Legend/Tooltip
    const shortenUrl = (url: string): string => {
        try {
            const parsedUrl = new URL(url);
            // Attempt to get a meaningful part, fallback to hostname
            const pathParts = parsedUrl.pathname.split('/').filter(p => p && !['ext', 'bc', 'rpc', 'ws', 'http', 'https', 'wss', 'jsonrpc'].includes(p.toLowerCase()));
            if (pathParts.length > 0 && pathParts[pathParts.length - 1].length > 3) { // Avoid short IDs if possible
                return `${parsedUrl.hostname}/${pathParts[pathParts.length - 1]}`;
            }
            return parsedUrl.hostname;
        } catch {
            // Fallback for invalid URLs (though validation should prevent this)
            return url.length > 30 ? url.substring(0, 27) + '...' : url;
        }
    }


    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Cross-Chain Performance Monitor</h3>
            <div className="mb-6">
                <p className="mb-2">This tool monitors performance metrics across multiple EVM chains in real-time. Enter RPC URLs (one per line) to track aggregated transactions, gas usage, and block production. Data is bucketed by time and normalized to per-second values.</p>
            </div>

            <div className="flex flex-col gap-4 mb-4">
                {/* Input Section */}
                <Textarea
                    label="EVM Chain RPC URLs (one per line)"
                    value={rpcUrlsInput}
                    onChange={setRpcUrlsInput}
                    placeholder="https://api.mainnet.network/ext/bc/C/rpc\nhttps://api.testnet.network/ext/bc/C/rpc\n..."
                    rows={4}
                    disabled={isMonitoring}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Time Range Selector */}
                    <Select
                        options={[
                            { value: "60", label: "1 minute (1s buckets)" },
                            { value: "300", label: "5 minutes (1s buckets)" },
                            { value: "900", label: "15 minutes (1m buckets)" },
                            { value: "1800", label: "30 minutes (1m buckets)" },
                            { value: "3600", label: "1 hour (1m buckets)" },
                            { value: "10800", label: "3 hours (1m buckets)" },
                            { value: "86400", label: "24 hours (1h buckets)" },
                            { value: "345600", label: "96 hours (1h buckets)" }
                        ]}
                        value={timeRange}
                        onChange={(value) => setTimeRange(String(value))}
                        label="Time Range"
                        disabled={isMonitoring}
                    />
                    {/* Block History Selector */}
                    <Select
                        options={[
                            { value: "100", label: "100 blocks" },
                            { value: "250", label: "250 blocks" },
                            { value: "1000", label: "1,000 blocks" },
                            // Add more options if needed, same as PerformanceMonitor
                            { value: "2500", label: "2,500 blocks" },
                            { value: "5000", label: "5,000 blocks" },
                            { value: "10000", label: "10,000 blocks" },
                            { value: "25000", label: "25,000 blocks" },
                            { value: "50000", label: "50,000 blocks" },
                            { value: "100000", label: "100,000 blocks" },
                            { value: "250000", label: "250,000 blocks" },
                            { value: "500000", label: "500,000 blocks" },
                            { value: "1000000", label: "1,000,000 blocks" }
                        ]}
                        value={blockHistory}
                        onChange={(value) => setBlockHistory(String(value))}
                        label="Historical Blocks per Chain"
                        disabled={isMonitoring}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mb-6">
                <Button
                    onClick={startMonitoring}
                    variant="primary"
                    disabled={rpcUrls.length === 0 || isMonitoring}
                >
                    Start Monitoring
                </Button>
                <Button
                    onClick={stopMonitoring}
                    disabled={!isMonitoring}
                >
                    Stop Monitoring
                </Button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded whitespace-pre-wrap">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Charts Section */}
            {isMonitoring && chartData.length > 0 && (
                <div className="flex flex-col gap-6">
                    {/* Transactions Chart */}
                    <div>
                        <h4 className="font-medium mb-2">Transactions per Second (Stacked)</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis tickFormatter={(value: number) => value.toFixed(1)} />
                                <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)} tx/s`, shortenUrl(name.replace('_tx', ''))]} />
                                <Legend formatter={(value) => shortenUrl(value.replace('_tx', ''))} />
                                {rpcUrls.map((url, index) => (
                                    <Area
                                        key={url}
                                        type="monotone"
                                        dataKey={`${url}_tx`}
                                        stackId="tx" // Group transactions together
                                        name={url} // Use full URL for potential tooltip identification if needed
                                        stroke={CHAIN_COLORS[index % CHAIN_COLORS.length]}
                                        fill={CHAIN_COLORS[index % CHAIN_COLORS.length]}
                                        animationDuration={200} // Faster animation for real-time feel
                                        connectNulls // Connect lines across missing data points
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gas Usage Chart */}
                    <div>
                        <h4 className="font-medium mb-2">Gas Used per Second (Stacked, Millions)</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis tickFormatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M`} />
                                <Tooltip formatter={(value: number, name: string) => [`${(Number(value) / 1_000_000).toFixed(1)}M gas/s`, shortenUrl(name.replace('_gas', ''))]} />
                                <Legend formatter={(value) => shortenUrl(value.replace('_gas', ''))} />
                                {rpcUrls.map((url, index) => (
                                    <Area
                                        key={url}
                                        type="monotone"
                                        dataKey={`${url}_gas`}
                                        stackId="gas" // Group gas usage together
                                        name={url}
                                        stroke={CHAIN_COLORS[index % CHAIN_COLORS.length]}
                                        fill={CHAIN_COLORS[index % CHAIN_COLORS.length]}
                                        animationDuration={200}
                                        connectNulls
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>


                    {/* Blocks Chart */}
                    <div>
                        <h4 className="font-medium mb-2">Blocks per Second (Stacked)</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis tickFormatter={(value: number) => value.toFixed(1)} />
                                <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)} blocks/s`, shortenUrl(name.replace('_blocks', ''))]} />
                                <Legend formatter={(value) => shortenUrl(value.replace('_blocks', ''))} />
                                {rpcUrls.map((url, index) => (
                                    <Area
                                        key={url}
                                        type="monotone"
                                        dataKey={`${url}_blocks`}
                                        stackId="blocks" // Group blocks together
                                        name={url}
                                        stroke={CHAIN_COLORS[index % CHAIN_COLORS.length]}
                                        fill={CHAIN_COLORS[index % CHAIN_COLORS.length]}
                                        animationDuration={200}
                                        connectNulls
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
            {isMonitoring && chartData.length === 0 && (
                <div className="mt-4 text-center text-gray-500">Waiting for data...</div>
            )}
            {!isMonitoring && rpcUrls.length > 0 && (
                <div className="mt-4 text-center text-gray-500">Press "Start Monitoring" to begin.</div>
            )}
        </div>
    );
}
