"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useErrorBoundary } from "react-error-boundary"
import { Copy, CheckCircle2 } from "lucide-react"
import { createCoreWalletClient } from "../coreViem"
import { networkIDs } from "@avalabs/avalanchejs"
import { useWalletStore } from "../lib/walletStore"
import { useL1ListStore } from "../toolbox/toolboxStore"
import { AddChainModal } from "./AddChainModal"
import { WalletRequiredPrompt } from "./WalletRequiredPrompt"
import { ConnectWalletPrompt } from "./ConnectWalletPrompt"
import { RefreshOnMainnetTestnetChange } from "./RefreshOnMainnetTestnetChange"
import { ChainTile } from "./ChainTile"
import { createPublicClient, http } from "viem"

export const ConnectWallet = ({ children, required, extraElements }: { children: React.ReactNode; required: boolean; extraElements: React.ReactNode }) => {
    const setWalletChainId = useWalletStore(state => state.setWalletChainId);
    const walletEVMAddress = useWalletStore(state => state.walletEVMAddress);
    const setWalletEVMAddress = useWalletStore(state => state.setWalletEVMAddress);
    const setCoreWalletClient = useWalletStore(state => state.setCoreWalletClient);
    const coreWalletClient = useWalletStore(state => state.coreWalletClient);
    const setAvalancheNetworkID = useWalletStore(state => state.setAvalancheNetworkID);
    const setPChainAddress = useWalletStore(state => state.setPChainAddress);
    const pChainAddress = useWalletStore(state => state.pChainAddress);
    const walletChainId = useWalletStore(state => state.walletChainId);
    const avalancheNetworkID = useWalletStore(state => state.avalancheNetworkID);
    const setIsTestnet = useWalletStore(state => state.setIsTestnet);

    const { l1List, addL1 } = useL1ListStore();
    const [hasWallet, setHasWallet] = useState<boolean>(false)
    const [isBrowser, setIsBrowser] = useState<boolean>(false)
    const [selectedL1Balance, setSelectedL1Balance] = useState<string>("0")
    const [pChainBalance, setPChainBalance] = useState<string>("0")
    const [isAddChainModalOpen, setIsAddChainModalOpen] = useState(false)
    const { showBoundary } = useErrorBoundary()

    // Get selected L1 details
    const selectedL1 = l1List.find(l1 => l1.evmChainId === walletChainId);

    // Fetch balances
    useEffect(() => {
        if (!walletEVMAddress || !coreWalletClient) return;

        const fetchBalances = async () => {
            try {
                // If an L1 is selected, fetch its balance
                if (selectedL1 && selectedL1.rpcUrl) {
                    try {
                        const tempPublicClient = createPublicClient({
                            transport: http(selectedL1.rpcUrl),
                            // Potentially add chain definition if needed by viem
                            // chain: { id: selectedL1.evmChainId, name: selectedL1.name, nativeCurrency: { name: selectedL1.coinName, symbol: selectedL1.coinName, decimals: 18 } }
                        });
                        const l1Balance = await tempPublicClient.getBalance({
                            address: walletEVMAddress as `0x${string}`,
                        });
                        setSelectedL1Balance((Number(l1Balance) / 1e18).toFixed(2));
                    } catch (l1Error) {
                        console.error(`Error fetching balance for ${selectedL1.name}:`, l1Error);
                        setSelectedL1Balance("Error"); // Indicate error fetching balance
                    }
                } else {
                    // Optionally clear L1 balance or set to 0 if none selected
                    setSelectedL1Balance("0");
                }

                // Get P-Chain balance
                if (pChainAddress) {
                    const pBalance = await coreWalletClient.getPChainBalance();
                    setPChainBalance((Number(pBalance) / 1e9).toFixed(2));
                }
            } catch (error) {
                console.error("Error fetching balances:", error);
            }
        };

        fetchBalances();
        // Set up polling for balance updates
        const interval = setInterval(fetchBalances, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [walletEVMAddress, pChainAddress, coreWalletClient, selectedL1]);

    useEffect(() => {
        setIsBrowser(true)

        async function init() {
            try {
                // Check if window.avalanche exists and is an object
                if (typeof window.avalanche !== 'undefined' && window.avalanche !== null) {
                    setHasWallet(true)
                } else {
                    setHasWallet(false)
                    return
                }

                // Safely add event listeners
                if (window.avalanche?.on) {
                    window.avalanche.on("accountsChanged", handleAccountsChanged)
                    window.avalanche.on("chainChanged", onChainChanged)
                }

                try {
                    // Check if request method exists before calling it
                    if (window.avalanche?.request) {
                        const accounts = await window.avalanche.request<string[]>({ method: "eth_accounts" })
                        if (accounts) {
                            handleAccountsChanged(accounts)
                        }
                    }
                } catch (error) {
                    // Ignore error, it's expected if the user has not connected their wallet yet
                    console.debug("No accounts found:", error)
                }
            } catch (error) {
                console.error("Error initializing wallet:", error)
                setHasWallet(false)
                showBoundary(error)
            }
        }

        if (isBrowser) {
            init()
        }

        // Clean up event listeners
        return () => {
            if (isBrowser && window.avalanche?.removeListener) {
                try {
                    window.avalanche.removeListener("accountsChanged", () => { })
                    window.avalanche.removeListener("chainChanged", () => { })
                } catch (e) {
                    console.warn("Failed to remove event listeners:", e)
                }
            }
        }
    }, [isBrowser])

    const onChainChanged = (chainId: string | number) => {
        if (typeof chainId === "string") {
            chainId = Number.parseInt(chainId, 16)
        }

        setWalletChainId(chainId)
        coreWalletClient.getPChainAddress().then(setPChainAddress).catch(showBoundary)

        coreWalletClient
            .isTestnet()
            .then((isTestnet: boolean) => {
                setAvalancheNetworkID(isTestnet ? networkIDs.FujiID : networkIDs.MainnetID)
                setIsTestnet(isTestnet)
            })
            .catch(showBoundary)
    }

    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            setWalletEVMAddress("")
            return
        } else if (accounts.length > 1) {
            showBoundary(new Error("Multiple accounts found, we don't support that yet"))
            return
        }

        //re-create wallet with new account
        const newWalletClient = createCoreWalletClient(accounts[0] as `0x${string}`)
        if (!newWalletClient) {
            setHasWallet(false)
            return
        }

        setCoreWalletClient(newWalletClient)
        setWalletEVMAddress(accounts[0] as `0x${string}`)

        coreWalletClient.getPChainAddress().then(setPChainAddress).catch(showBoundary)

        if (walletChainId === 0) {
            coreWalletClient.getChainId().then(onChainChanged).catch(showBoundary)
        }
    }

    async function connectWallet() {
        if (!isBrowser) return

        console.log("Connecting wallet")
        try {
            if (!window.avalanche?.request) {
                setHasWallet(false)
                return
            }

            const accounts = await window.avalanche.request<string[]>({ method: "eth_requestAccounts" })

            if (!accounts) {
                throw new Error("No accounts returned from wallet")
            }

            // Use the same handler function as defined in useEffect
            if (accounts.length === 0) {
                setWalletEVMAddress("")
                return
            } else if (accounts.length > 1) {
                showBoundary(new Error("Multiple accounts found, we don't support that yet"))
                return
            }

            //re-create wallet with new account
            const newWalletClient = createCoreWalletClient(accounts[0] as `0x${string}`)
            if (!newWalletClient) {
                setHasWallet(false)
                return
            }

            setCoreWalletClient(newWalletClient)
            setWalletEVMAddress(accounts[0] as `0x${string}`)

            coreWalletClient.getPChainAddress().then(setPChainAddress).catch(showBoundary)

            if (walletChainId === 0) {
                coreWalletClient.getChainId().then(onChainChanged).catch(showBoundary)
            }
        } catch (error) {
            console.error("Error connecting wallet:", error)
            showBoundary(error)
        }
    }

    const copyToClipboard = (text: string) => {
        if (isBrowser) {
            navigator.clipboard.writeText(text)
        }
    }

    // Updated handleAddChain to accept the full chain object matching the store's addL1 action
    const handleAddChain = (chain: {
        id: string;
        name: string;
        rpcUrl: string;
        evmChainId: number;
        coinName: string;
        isTestnet: boolean;
        subnetId: string;
        validatorManagerAddress: string;
    }) => {
        // Add the chain to l1List store using the provided object
        addL1(chain);
    };

    // Function to switch chains in the wallet extension
    const switchChain = async (chainId: number) => {
        if (!window.avalanche?.request) {
            console.error("Wallet extension not available");
            return;
        }

        try {
            // Request wallet to switch to the selected chain
            await window.avalanche.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
        } catch (error: any) {
            // If the chain is not added to the wallet, we might need to add it first
            if (error.code === 4902) { // Chain not added error code
                console.error("Chain not found in wallet. Please add it first.");
                // You could implement wallet_addEthereumChain here if needed
            } else {
                console.error("Error switching chain:", error);
                showBoundary(error);
            }
        }
    };

    // Handle chain selection with wallet switching
    const handleChainSelect = async (chainId: string) => {
        // Then find the chain details and request the wallet to switch
        const selectedChain = l1List.find(chain => chain.id === chainId);
        if (!selectedChain) throw new Error("Chain not found");
        await switchChain(selectedChain.evmChainId);
    };

    // Get network badge based on network ID
    const renderNetworkBadge = () => {
        if (avalancheNetworkID === networkIDs.FujiID || walletChainId === 5) {
            return (
                <div className="inline-flex items-center">
                    <div className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full inline-flex items-center text-xs tracking-tighter">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mr-1 flex-shrink-0"></span>
                        <span className="flex-shrink-0">Testnet</span>
                    </div>
                </div>
            );
        } else if (avalancheNetworkID === networkIDs.MainnetID || walletChainId === 1) {
            return (
                <div className="inline-flex items-center">
                    <div className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full inline-flex items-center text-xs tracking-tighter">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                        <span className="flex-shrink-0">Mainnet</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Server-side rendering fallback
    if (!isBrowser) {
        return (
            <div className="space-y-4 transition-all duration-300">
                <div className="transition-all duration-300">{children}</div>
            </div>
        )
    }

    if (required && !hasWallet) {
        return <WalletRequiredPrompt />
    }

    if (required && !walletEVMAddress) {
        return <ConnectWalletPrompt onConnect={connectWallet} />
    }

    return (
        <div className="space-y-4 transition-all duration-300">
            {walletEVMAddress && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md rounded-xl p-4 relative overflow-hidden">
                    {/* Core Wallet header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <img src="/core.png" alt="Core Logo" className="h-10 w-10" />
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Core Wallet</h3>
                                {renderNetworkBadge()}
                            </div>
                        </div>
                    </div>

                    {/* Chain cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Selected L1 Chain or Default C-Chain */}
                        {selectedL1 ? (
                            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-blue-500 dark:border-blue-700 ring-1 ring-blue-500 dark:ring-blue-700">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">
                                        {selectedL1.name}
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">Selected</span>
                                </div>
                                <div className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">{selectedL1Balance} {selectedL1.coinName}</div>
                                {/* EVM Address inside the card */}
                                <div className="flex items-center justify-between">
                                    <div className="font-mono text-xs text-zinc-700 dark:text-black bg-zinc-100 dark:bg-zinc-300 px-3 py-1.5 rounded-md overflow-x-auto shadow-sm border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors flex-1 mr-2">
                                        {walletEVMAddress}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(walletEVMAddress)}
                                        className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-600 shadow-sm"
                                        title="Copy address"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-black" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Fallback: Show a placeholder or default C-Chain info if no L1 is selected
                            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 opacity-70">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-zinc-500 dark:text-zinc-500 text-sm font-medium">
                                        No L1 Selected
                                    </span>
                                </div>
                                <div className="text-2xl font-semibold text-zinc-500 dark:text-zinc-500 mb-2">-- AVAX</div>
                                {/* EVM Address inside the fallback card */}
                                <div className="flex items-center justify-between mt-2"> {/* Added mt-2 for spacing */}
                                    <div className="font-mono text-xs text-zinc-700 dark:text-black bg-zinc-100 dark:bg-zinc-300 px-3 py-1.5 rounded-md overflow-x-auto shadow-sm border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors flex-1 mr-2">
                                        {walletEVMAddress}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(walletEVMAddress)}
                                        className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-600 shadow-sm"
                                        title="Copy address"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-black" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* P-Chain */}
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">P-Chain</span>
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">Always Connected</span>
                            </div>
                            <div className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">{pChainBalance} AVAX</div>
                            <div className="flex items-center justify-between">
                                <div className="font-mono text-xs text-zinc-700 dark:text-black bg-zinc-100 dark:bg-zinc-300 px-3 py-1.5 rounded-md overflow-x-auto shadow-sm border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors flex-1 mr-2">
                                    {pChainAddress ? pChainAddress : "Loading..."}
                                </div>
                                {pChainAddress && (
                                    <button
                                        onClick={() => copyToClipboard(pChainAddress)}
                                        className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-600 shadow-sm"
                                        title="Copy address"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-black" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Network section - Always displayed */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Your Networks</h4>

                        {l1List.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {l1List.map((chain) => (
                                    <ChainTile
                                        key={chain.id}
                                        chain={chain}
                                        isActive={walletChainId === chain.evmChainId}
                                        onClick={() => handleChainSelect(chain.id)}
                                    />
                                ))}
                                <ChainTile
                                    isAddTile
                                    onClick={() => setIsAddChainModalOpen(true)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                <ChainTile
                                    isAddTile
                                    onClick={() => setIsAddChainModalOpen(true)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Add Chain Modal */}
                    <AddChainModal
                        isOpen={isAddChainModalOpen}
                        onClose={() => setIsAddChainModalOpen(false)}
                        onAddChain={handleAddChain}
                    />

                    {extraElements}
                </div>
            )}

            {/* Children content */}
            <RefreshOnMainnetTestnetChange>
                <div className="transition-all duration-300">{children}</div>
            </RefreshOnMainnetTestnetChange>
        </div>
    )
}
