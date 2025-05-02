"use client";

import { formatEther, parseEther, createPublicClient, http } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { L1ListItem, useL1ListStore, useSelectedL1, useViemChainStore } from '../toolboxStore';
import { useWalletStore } from '../../lib/walletStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { CodeHighlighter } from '../../components/CodeHighlighter';
import { useState, useEffect, useMemo } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { avalancheFuji } from 'viem/chains';
import { AlertTriangle } from 'lucide-react';
import WssEndpointInput from '../../components/WssEndpointInput';

const MINIMUM_BALANCE = parseEther('100')
const MINIMUM_BALANCE_CCHAIN = parseEther('1')
const FUJI_ID = "yH8D7ThNJkxmtkuv2jgBa4P1Rn3Qpr4pPr7QYNfcdoS6k6HWp";

export default function ICMRelayer() {
    const { coreWalletClient } = useWalletStore();
    const selectedL1 = useSelectedL1()();
    const [balanceL1, setBalanceL1] = useState<bigint>(BigInt(0));
    const [balanceCChain, setBalanceCChain] = useState<bigint>(BigInt(0));
    const [isCheckingBalanceL1, setIsCheckingBalanceL1] = useState(true);
    const [isCheckingBalanceCChain, setIsCheckingBalanceCChain] = useState(true);
    const [isSendingL1, setIsSendingL1] = useState(false);
    const [isSendingCChain, setIsSendingCChain] = useState(false);
    const { showBoundary } = useErrorBoundary();
    const viemChain = useViemChainStore();
    const { l1List } = useL1ListStore()();
    const [wsEndpoints, setWsEndpoints] = useState<Map<string, string>>(new Map());

    const getInitialSelectedIds = (currentL1Id?: string): Set<string> => {
        const initialSet = new Set<string>();
        initialSet.add(FUJI_ID);
        if (currentL1Id) {
            initialSet.add(currentL1Id);
        }
        return initialSet;
    };

    const [selectedSourceChainIds, setSelectedSourceChainIds] = useState<Set<string>>(() => getInitialSelectedIds(selectedL1?.id));
    const [selectedDestinationChainIds, setSelectedDestinationChainIds] = useState<Set<string>>(() => getInitialSelectedIds(selectedL1?.id));

    const availableChains: L1ListItem[] = useMemo(() => {
        //FIXME: add mainnet support
        const cChain: L1ListItem = {
            id: "yH8D7ThNJkxmtkuv2jgBa4P1Rn3Qpr4pPr7QYNfcdoS6k6HWp",
            name: "Avalanche Fuji",
            rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
            evmChainId: 43113,
            coinName: "AVAX",
            isTestnet: true,
            subnetId: "11111111111111111111111111111111LpoYY",
            validatorManagerAddress: "0x0000000000000000000000000000000000000000"
        }
        return [...l1List, cChain].filter(chain => chain.id && chain.name); // Ensure chains have id and name
    }, [l1List]);

    // Derive WebSocket URL from HTTP/HTTPS RPC URL
    const deriveWsUrl = (httpUrl: string): string => {
        if (!httpUrl) return '';
        try {
            const url = new URL(httpUrl);
            url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            // Common replacements - adjust if needed for specific node providers
            if (url.pathname.endsWith('/rpc')) {
                url.pathname = url.pathname.replace(/\/rpc$/, '/ws');
            } else if (url.pathname.includes('/ext/bc/C')) { // Specific Avalanche C-Chain path
                url.pathname = url.pathname.replace(/\/ext\/bc\/C$/, '/ext/bc/C/ws');
            }
            else if (!url.pathname.endsWith('/ws')) {
                // Append /ws if not present and likely not a special path
                url.pathname = url.pathname.replace(/\/$/, '') + '/ws';
            }
            return url.toString();
        } catch (e) {
            console.error("Error deriving WebSocket URL:", e);
            return ''; // Return empty string on error
        }
    };

    // Use sessionStorage for private key to persist across refreshes
    const [privateKey] = useState(() => {
        const storedKey = sessionStorage.getItem('icm-relayer-private-key');
        if (storedKey) return storedKey as `0x${string}`;

        const newKey = generatePrivateKey();
        sessionStorage.setItem('icm-relayer-private-key', newKey);
        return newKey;
    });

    const relayerAddress = privateKeyToAccount(privateKey).address;

    // Create separate clients for L1 and C-Chain
    const l1Client = viemChain ? createPublicClient({
        transport: http(selectedL1?.rpcUrl),
        chain: viemChain,
    }) : null;

    const cChainClient = createPublicClient({
        transport: http(avalancheFuji.rpcUrls.default.http[0]),
        chain: avalancheFuji,
    });

    const checkBalanceL1 = async () => {
        if (!selectedL1?.rpcUrl || !l1Client || !viemChain) {
            setIsCheckingBalanceL1(false);
            return;
        }

        setIsCheckingBalanceL1(true);
        try {
            const balance = await l1Client.getBalance({
                address: relayerAddress
            });

            setBalanceL1(balance);
        } catch (error) {
            console.error("Failed to check L1 balance:", error);
        } finally {
            setIsCheckingBalanceL1(false);
        }
    };

    const checkBalanceCChain = async () => {
        setIsCheckingBalanceCChain(true);
        try {
            const balance = await cChainClient.getBalance({
                address: relayerAddress
            });

            setBalanceCChain(balance);
        } catch (error) {
            console.error("Failed to check C-Chain balance:", error);
        } finally {
            setIsCheckingBalanceCChain(false);
        }
    };

    useEffect(() => {
        if (viemChain && selectedL1?.rpcUrl) {
            checkBalanceL1();
        }
    }, [selectedL1?.rpcUrl, viemChain?.id]);

    useEffect(() => {
        checkBalanceCChain();
    }, []);

    // Effect to handle subsequent changes to selectedL1 after initial load
    useEffect(() => {
        if (selectedL1?.id) {
            // Add the newly selected L1 if it's not already present.
            // This won't prevent deselection of Fuji or previous L1s.
            setSelectedSourceChainIds(prev => {
                if (!prev.has(selectedL1.id!)) {
                    const newSet = new Set(prev);
                    newSet.add(selectedL1.id!);
                    return newSet;
                }
                return prev; // No change needed if already present
            });
            setSelectedDestinationChainIds(prev => {
                if (!prev.has(selectedL1.id!)) {
                    const newSet = new Set(prev);
                    newSet.add(selectedL1.id!);
                    return newSet;
                }
                return prev; // No change needed if already present
            });
        }
        // Only react to changes in the selected L1 ID itself
    }, [selectedL1?.id]);

    const handleFundL1 = async () => {
        if (!viemChain) {
            showBoundary(new Error("Invalid L1 chain configuration"));
            return;
        }

        setIsSendingL1(true);
        try {
            // Then proceed with transaction
            const hash = await coreWalletClient.sendTransaction({
                to: relayerAddress,
                value: MINIMUM_BALANCE - balanceL1,
                chain: viemChain
            });

            await l1Client?.waitForTransactionReceipt({ hash });
            await checkBalanceL1();
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsSendingL1(false);
        }
    };

    const handleFundCChain = async () => {
        setIsSendingCChain(true);
        try {
            // Then proceed with transaction
            const hash = await coreWalletClient.sendTransaction({
                to: relayerAddress,
                value: MINIMUM_BALANCE_CCHAIN - balanceCChain,
                chain: avalancheFuji
            });

            await cChainClient.waitForTransactionReceipt({ hash });
            await checkBalanceCChain();
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsSendingCChain(false);
        }
    };

    const handleSourceChainToggle = (chainId: string) => {
        const chain = availableChains.find(c => c.id === chainId); // Find chain details
        if (!chain) return; // Should not happen

        setSelectedSourceChainIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chainId)) {
                newSet.delete(chainId);
                // Remove from wsEndpoints when deselecting
                setWsEndpoints(currentEndpoints => {
                    const newEndpoints = new Map(currentEndpoints);
                    newEndpoints.delete(chainId);
                    return newEndpoints;
                });
            } else {
                newSet.add(chainId);
                // Add derived URL to wsEndpoints when selecting
                setWsEndpoints(currentEndpoints => {
                    const newEndpoints = new Map(currentEndpoints);
                    // Derive and set the WS endpoint
                    newEndpoints.set(chainId, deriveWsUrl(chain.rpcUrl));
                    return newEndpoints;
                });
            }
            return newSet;
        });
    };

    const handleDestinationChainToggle = (chainId: string) => {
        setSelectedDestinationChainIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chainId)) {
                newSet.delete(chainId);
            } else {
                newSet.add(chainId);
            }
            return newSet;
        });
    };

    const handleWsEndpointChange = (chainId: string, value: string) => {
        setWsEndpoints(prev => new Map(prev).set(chainId, value));
    };

    const hasEnoughBalanceL1 = balanceL1 >= MINIMUM_BALANCE;
    const hasEnoughBalanceCChain = balanceCChain >= MINIMUM_BALANCE_CCHAIN;
    const hasEnoughBalance = hasEnoughBalanceL1 && hasEnoughBalanceCChain;

    return (
        <div className="space-y-4">


            <div className="text-lg font-bold">Relayer Configuration</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Chains Section */}
                <div className="space-y-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/20">
                    <h3 className="font-semibold text-lg mb-2">Select Source Chains</h3>
                    {availableChains.map((chain) => (
                        <div key={chain.id} className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/30">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`source-${chain.id}`}
                                    checked={selectedSourceChainIds.has(chain.id)}
                                    onChange={() => handleSourceChainToggle(chain.id)}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <label htmlFor={`source-${chain.id}`} className="cursor-pointer flex-grow space-y-1">
                                    <div className="font-medium">{chain.name} ({chain.isTestnet ? 'Testnet' : 'Mainnet'}) - {chain.coinName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {chain.id}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">EVM Chain ID: {chain.evmChainId}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">RPC: {chain.rpcUrl}</div>
                                </label>
                            </div>
                            {selectedSourceChainIds.has(chain.id) && (
                                <div className="mt-2 pl-7"> {/* Indent slightly */}
                                    <WssEndpointInput
                                        label="WebSocket Endpoint (ws:// or wss://)"
                                        value={wsEndpoints.get(chain.id) || ''}
                                        onChange={value => handleWsEndpointChange(chain.id, value)}
                                        placeholder="wss://..."
                                        chainId={chain.id}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Destination Chains Section */}
                <div className="space-y-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/20">
                    <h3 className="font-semibold text-lg mb-2">Select Destination Chains</h3>
                    {availableChains.map((chain) => (
                        <div key={chain.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/30">
                            <input
                                type="checkbox"
                                id={`dest-${chain.id}`}
                                checked={selectedDestinationChainIds.has(chain.id)}
                                onChange={() => handleDestinationChainToggle(chain.id)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor={`dest-${chain.id}`} className="cursor-pointer flex-grow space-y-1">
                                <div className="font-medium">{chain.name} ({chain.isTestnet ? 'Testnet' : 'Mainnet'}) - {chain.coinName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">ID: {chain.id}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">EVM Chain ID: {chain.evmChainId}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">RPC: {chain.rpcUrl}</div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* L1 Balance Section */}
                <div className="space-y-3 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/20">
                    <div>
                        <p className="font-semibold">Subnet (L1) Balance:</p>
                        {isCheckingBalanceL1 ? (
                            <p>Checking balance...</p>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p>{formatEther(balanceL1)} coins {hasEnoughBalanceL1 ? '✅' : '❌'}</p>
                                <span
                                    onClick={checkBalanceL1}
                                    className="text-blue-500 hover:underline cursor-pointer"
                                >
                                    Recheck
                                </span>
                            </div>
                        )}
                        <div className="pb-2 text-xs">
                            Should be at least {formatEther(MINIMUM_BALANCE)} native coins
                        </div>
                        {!hasEnoughBalanceL1 && (
                            <>
                                <Button
                                    variant="primary"
                                    onClick={handleFundL1}
                                    loading={isSendingL1}
                                    disabled={isSendingL1 || !viemChain}
                                >
                                    Fund Relayer on L1
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* C-Chain Balance Section */}
                <div className="space-y-3 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/20">
                    <div>
                        <p className="font-semibold">C-Chain (Fuji) Balance:</p>
                        {isCheckingBalanceCChain ? (
                            <p>Checking balance...</p>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p>{formatEther(balanceCChain)} AVAX {hasEnoughBalanceCChain ? '✅' : '❌'}</p>
                                <span
                                    onClick={checkBalanceCChain}
                                    className="text-blue-500 hover:underline cursor-pointer"
                                >
                                    Recheck
                                </span>
                            </div>
                        )}
                        <div className="pb-2 text-xs">
                            Should be at least {formatEther(MINIMUM_BALANCE_CCHAIN)} AVAX
                        </div>
                        {!hasEnoughBalanceCChain && (
                            <>
                                <Button
                                    variant="primary"
                                    onClick={handleFundCChain}
                                    loading={isSendingCChain}
                                    disabled={isSendingCChain}
                                >
                                    Fund Relayer on C-Chain
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <>
                <div className="text-sm">
                    ⚠️ The private key is stored in your browser session storage and will persist until you close the browser.
                    Please save the address above as you will need to fund it later.
                </div>
                <div className="text-lg font-bold">Write the relayer config file</div>
                <CodeHighlighter
                    code={genConfigCommand(
                        availableChains,
                        selectedSourceChainIds,
                        selectedDestinationChainIds,
                        wsEndpoints,
                        privateKey
                    )}
                    lang="sh"
                />
                <div className="text-lg font-bold">Run the relayer</div>
                <CodeHighlighter
                    code={relayerDockerCommand()}
                    lang="sh"
                />
            </>

            {!hasEnoughBalance && (
                <>
                    <div className="text-lg font-bold">
                        You need to fund the relayer with at least {formatEther(MINIMUM_BALANCE)} coins on L1 and {formatEther(MINIMUM_BALANCE_CCHAIN)} AVAX on C-Chain to start relaying messages.
                    </div>
                </>
            )}
        </div>
    );
}

const genConfigCommand = (
    allChains: L1ListItem[],
    sourceChainIds: Set<string>,
    destinationChainIds: Set<string>,
    wsEndpoints: Map<string, string>,
    privateKeyhex: string
) => {

    const selectedSourceChains = allChains.filter(chain => sourceChainIds.has(chain.id));
    const selectedDestinationChains = allChains.filter(chain => destinationChainIds.has(chain.id));

    const config = {
        "info-api": {
            "base-url": "https://api.avax-test.network"
        },
        "p-chain-api": {
            "base-url": "https://api.avax-test.network"
        },
        "source-blockchains": [
            ...selectedSourceChains.map(chain => ({
                "subnet-id": chain.subnetId,
                "blockchain-id": chain.id,
                "vm": "evm", // Assuming EVM for now
                "rpc-endpoint": {
                    "base-url": chain.rpcUrl,
                },
                "ws-endpoint": {
                    // Use the value from state, fallback to empty string if somehow missing
                    "base-url": wsEndpoints.get(chain.id) || '',
                },
                "message-contracts": {
                    // TODO: Make this configurable if needed
                    "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf": {
                        "message-format": "teleporter",
                        "settings": {
                            "reward-address": "0x0000000000000000000000000000000000000000" // TODO: Make configurable?
                        }
                    }
                }
            })),
        ],
        "destination-blockchains": [
            ...selectedDestinationChains.map(chain => ({
                "subnet-id": chain.subnetId,
                "blockchain-id": chain.id,
                "vm": "evm", // Assuming EVM
                "rpc-endpoint": {
                    "base-url": chain.rpcUrl
                },
                "account-private-key": privateKeyhex
            })),
        ]
    }
    const configStr = JSON.stringify(config, null, 4);
    return `mkdir -p ~/.icm-relayer && echo '${configStr}' > ~/.icm-relayer/config.json`
}

import versions from '../../versions.json';
const relayerDockerCommand = () => {
    return `docker run --name relayer -d \\
    --restart on-failure  \\
    --user=root \\
    -v ~/.icm-relayer/:/icm-relayer/ \\
    avaplatform/icm-relayer:${versions['avaplatform/icm-relayer']} \\
    --config-file /icm-relayer/config.json`
}
