import { Button } from "../../components/Button";
import { useCreateChainStore, useToolboxStore } from "../toolboxStore";
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Input } from "../../components/Input";
import { useWalletStore } from "../../lib/walletStore";
import { queryChainInfo, ChainInfoResult } from "../../coreViem/utils/chainInfo";

export default function SelectChain({ children }: { children: React.ReactNode }) {
    const { chains, activeChainId, setActiveChain } = useToolboxStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get the chains as an array
    const chainList = Object.entries(chains).map(([id, data]) => ({
        id,
        name: data.first,
        rpcUrl: data.second,
        chainId: data.third
    }));

    const activeChain = activeChainId ?
        chains[activeChainId]?.first || "Select chain" :
        "Select chain";

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        isOpen && document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen]);

    return <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    {activeChain}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 border rounded-md shadow-lg bg-white dark:bg-gray-800 z-10">
                        {chainList.length > 0 ? (
                            <ul className="py-2">
                                {chainList.map(chain => (
                                    <li key={chain.id}>
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                                                ${chain.id === activeChainId ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : ''}`}
                                            onClick={() => {
                                                setActiveChain(chain.id);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {chain.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                No chains added yet
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <Button className="gap-1 w-fit" icon={<Plus className="w-4 h-4" />}>
                        Add chain
                    </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50"
                        onClick={() => setIsOpen(false)}
                    />
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xl w-full z-50">
                        <div className="flex justify-between items-center mb-4">
                            <Dialog.Title className="text-lg font-medium">Add New Chain</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        </div>
                        <AddChain />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
        <div className={!activeChainId ? "opacity-50 pointer-events-none" : ""}>
            {children}
        </div>
    </div>;
}

function AddChain() {
    // const { addChain, setActiveChain } = useToolboxStore();
    const [rpcUrl, setRpcUrl] = useState('');
    const [formError, setFormError] = useState('');
    const { walletChainId, isTestnet } = useWalletStore()
    const createChainStore = useCreateChainStore();
    const [chainId, setChainId] = useState(createChainStore.chainID);

    const [chainInfo, setChainInfo] = useState<ChainInfoResult | null>(null);


    const handleSubmit = () => {

    };

    const loadRPCFromWallet = () => {

    }

    useEffect(() => {
        setChainInfo(null);
        queryChainInfo(chainId, isTestnet!).then(setChainInfo);
    }, [chainId]);

    return <div>
        <div className="space-y-4">
            {formError && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
                    {formError}
                </div>
            )}
            <Input label="Avalanche Chain ID" value={chainId} onChange={setChainId} />
            <Input label="RPC URL" value={rpcUrl} onChange={setRpcUrl} />

            {chainInfo && (
                <>
                    <Input label="EVM Chain ID" value={chainInfo.evmChainID} disabled />
                    <Input label="Subnet ID" value={chainInfo.subnetId} disabled />
                    <Input label="Name" value={chainInfo.name} disabled />
                </>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <Dialog.Close asChild>
                    <Button variant="secondary">Cancel</Button>
                </Dialog.Close>
                <Button onClick={handleSubmit}>Add Chain</Button>
            </div>
        </div>
    </div>;
}
