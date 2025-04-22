import { ConnectWallet } from "../../components/ConnectWallet";
import { useL1ListStore, useViemChainStore } from "../toolboxStore";
import { Button } from "../../components/Button";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../components/Input";
import { createPublicClient, http } from "viem";
import { utils } from "@avalabs/avalanchejs";
import { useWalletStore } from "../../lib/walletStore";
import { Tabs } from "../../components/Tabs";

export const ConnectWalletToolbox = ({ children, required, chainRequired }: { children: React.ReactNode, required: boolean, chainRequired: boolean }) => {
    const viemChain = useViemChainStore();

    return (
        <ConnectWallet required={required} extraElements={chainRequired ? <ChainSelector /> : null} >
            {(chainRequired && !viemChain) ?
                <div className="opacity-50 pointer-events-none">{children}</div>
                : children
            }
        </ConnectWallet>
    );
};

const ChainSelector = () => {
    const { l1List, lastSelectedL1, setLastSelectedL1 } = useL1ListStore();

    return (
        <>
            <div className="flex items-center ">
                {l1List.map(l1 => (
                    <div key={l1.id} className={`cursor-pointer mr-4 mb-4 p-2 border rounded mb-1 ${lastSelectedL1 === l1.id ? "border-blue-500 border-2 font-bold" : "border-gray-300"}`} onClick={() => setLastSelectedL1(l1.id)}>
                        <span>{l1.name || `Chain ${l1.id}`}</span>
                    </div>
                ))}


            </div>
            <NewChainDialog />
        </>
    );
}

import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { getBlockchainInfo } from "../../coreViem/utils/glacier";
import { Select } from "./Select";

function NewChainDialog() {
    const { setLastSelectedL1, addL1 } = useL1ListStore();

    const [open, setOpen] = useState(false);
    const { chainId, evmChainId, rpcUrl, setChainId, setEvmChainId, coinName, setCoinName, isTestnet, setIsTestnet } = useAddChainTempStore();
    const [rpcUrlError, setRpcUrlError] = useState("");
    const [name, setName] = useState("");


    const FROM_RPC = "Enter RPC URL";
    const FROM_CORE_WALLET = "Load RPC URL from Core Wallet";

    const [activeTab, setActiveTab] = useState<typeof FROM_RPC | typeof FROM_CORE_WALLET>(FROM_RPC);


    useEffect(() => {
        async function fetchChainData() {
            setRpcUrlError("");
            setEvmChainId(0);
            setChainId("");
            setName("");

            if (!rpcUrl) {
                return;
            }

            if (!rpcUrl.startsWith("https://")) {
                setRpcUrlError("The RPC URL must start with https://");
                return;
            }

            try {
                const { ethereumChainId, avalancheChainId } = await fetchChainId(rpcUrl);
                const name = (await getBlockchainInfo(avalancheChainId)).blockchainName
                setEvmChainId(ethereumChainId);
                setChainId(avalancheChainId);
                setName(name);
            } catch (error) {
                setRpcUrlError((error as Error)?.message || String(error));
            }
        }

        fetchChainData();
    }, [rpcUrl]);

    function addChain() {
        addL1({ id: chainId, name: name || `Chain ${evmChainId}`, rpcUrl: rpcUrl, evmChainId: evmChainId, coinName: coinName, isTestnet: isTestnet });
        setLastSelectedL1(chainId);
        setOpen(false);
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button onClick={() => { }}>Add Chain</Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg focus:outline-none w-[90vw] max-w-md">
                    <Dialog.Title className="text-lg font-medium text-zinc-900 mb-4">
                        Add New Chain
                    </Dialog.Title>

                    <div className="space-y-4">
                        <Tabs
                            tabs={[FROM_RPC, FROM_CORE_WALLET]}
                            activeTab={activeTab}
                            setActiveTab={(tab) => setActiveTab(tab as typeof FROM_RPC | typeof FROM_CORE_WALLET)}
                            children={(activeTab) => {
                                return <>
                                    {activeTab === FROM_RPC ? <ManualRPC /> : <ChainFromWallet />}
                                </>
                            }}
                        />
                        {rpcUrlError && <p className="text-red-500">{rpcUrlError}</p>}

                        <Input
                            id="chainId"
                            label="Chain ID"
                            value={chainId}
                            disabled
                        />

                        <Input
                            id="evmChainId"
                            label="EVM Chain ID"
                            value={evmChainId}
                            disabled
                        />

                        <Input
                            id="name"
                            label="Chain Name"
                            value={name}
                            onChange={setName}
                        />

                        <Input
                            id="coinName"
                            label="Coin Name"
                            value={coinName}
                            onChange={setCoinName}
                        />

                        <Select
                            label="Is Testnet"
                            value={isTestnet ? "Yes" : "No"}
                            onChange={(value) => setIsTestnet(value === "Yes")}
                            options={[
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                            ]}
                        />



                        <Button onClick={() => addChain()}>Add Chain</Button>
                    </div>

                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full w-6 h-6 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

const useAddChainTempStore = create(
    combine({
        rpcUrl: "",
        chainId: "",
        evmChainId: 0,
        coinName: "COIN",
        isTestnet: true,
    }, (set) => ({
        setRpcUrl: (rpcUrl: string) => set({ rpcUrl }),
        setChainId: (chainId: string) => set({ chainId }),
        setEvmChainId: (evmChainId: number) => set({ evmChainId }),
        setCoinName: (coinName: string) => set({ coinName }),
        setIsTestnet: (isTestnet: boolean) => set({ isTestnet }),
    })),
)


function ManualRPC() {
    const { rpcUrl, setRpcUrl } = useAddChainTempStore();

    return (
        <Input
            id="rpcUrl"
            label="RPC Server URL"
            placeholder="https://..."
            value={rpcUrl}
            onChange={setRpcUrl}
        />
    )
}


function ChainFromWallet() {
    const [anyChainId, setAnyChainId] = useState("");
    const [evmChainId, setEvmChainId] = useState(-1);
    const [localError, setLocalError] = useState("");
    const { walletChainId, coreWalletClient } = useWalletStore();
    const { rpcUrl, setRpcUrl, setCoinName, setIsTestnet } = useAddChainTempStore();

    //tries to extract evmChainId from anyChainId
    useEffect(() => {
        (async function () {
            setLocalError("");
            setEvmChainId(-1);
            if (!anyChainId) return

            console.log('anyChainId', anyChainId);

            try {
                const parsed = parseInt(anyChainId, 10);
                if (!isNaN(parsed)) {
                    setEvmChainId(parsed);
                    return
                }
            } catch (e) {
                console.log('error', e);
            }

            console.log('anyChainId', anyChainId);

            try {
                utils.base58check.decode(anyChainId);//cause faulure before sending request
                const chain = await getBlockchainInfo(anyChainId);
                setEvmChainId(chain.evmChainId);
                console.log('chain', chain);
            } catch (error) {
                console.error("Failed to fetch chain info:", error);
                setLocalError("The Chain ID doesn't seem to be an EVM Chain ID or Avalanche Chain ID")
            }
        })();
    }, [anyChainId]);

    async function switchToChain(evmChainId: number) {
        try {
            setLocalError("");

            const chainIdHex = `0x${parseInt(evmChainId.toString()).toString(16)}`;

            await window.avalanche!.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainIdHex }],
            });
        } catch (error) {
            console.error("Failed to switch to chain:", error);
            setLocalError(`Failed to switch to chain, do you have chain ${evmChainId} added in your wallet? Original error: ${(error as Error)?.message || String(error)}`);
        }
    }

    async function fetchFromWallet() {
        try {
            setLocalError("");
            const evmInfo = await coreWalletClient.getEthereumChain()
            setRpcUrl(evmInfo.rpcUrls[0]);
            setCoinName(evmInfo.nativeCurrency.name);
            setIsTestnet(evmInfo.isTestnet);
        } catch (error) {
            console.error("Failed to fetch from wallet:", error);
            setLocalError("Failed to fetch from wallet, do you have chain ${evmChainId} added in your wallet?");
        }
    }

    return (
        <div className="space-y-4">
            <Input
                id="chainId"
                label="Any Chain ID - Avalanche or EVM"
                value={anyChainId}
                onChange={setAnyChainId}
                error={localError}
            />


            {(walletChainId === evmChainId) && <Button onClick={fetchFromWallet} disabled={evmChainId === -1}>Fetch from wallet</Button>}
            {(walletChainId !== evmChainId) && <Button onClick={() => { switchToChain(evmChainId) }} disabled={evmChainId === -1}>Switch to chain {evmChainId}</Button>}

            {localError && <p className="text-red-500">{localError}</p>}

            <Input
                id="rpcUrl"
                label="RPC Server URL"
                placeholder="https://..."
                value={rpcUrl}
                disabled
            />
        </div >
    )
}


async function fetchChainId(rpcUrl: string): Promise<{ ethereumChainId: number, avalancheChainId: string }> {
    try {
        const publicClient = createPublicClient({
            transport: http(rpcUrl),
        });
        const WARP_PRECOMPILE_ADDRESS = "0x0200000000000000000000000000000000000005";

        // Get the Ethereum chain ID first
        const ethereumChainId = await publicClient.getChainId();

        // Create an interface for the Warp precompile
        const warpAbi = [
            {
                name: "getBlockchainID",
                type: "function",
                stateMutability: "view",
                inputs: [],
                outputs: [{ name: "blockchainID", type: "bytes32" }]
            }
        ] as const;

        // Call the getBlockchainID function
        const blockchainIDHex = await publicClient.readContract({
            address: WARP_PRECOMPILE_ADDRESS,
            abi: warpAbi,
            functionName: "getBlockchainID",
        });

        console.log('blockchainID', blockchainIDHex);
        const chainIdBytes = utils.hexToBuffer(blockchainIDHex);
        const avalancheChainId = utils.base58check.encode(chainIdBytes);


        return { ethereumChainId, avalancheChainId };
    } catch (error) {
        console.error("Failed to fetch chain ID:", error);
        throw error;
    }
}
