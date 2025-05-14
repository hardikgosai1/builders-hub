import * as Dialog from "@radix-ui/react-dialog"
import { CodeHighlighter } from "../CodeHighlighter"
import { Button } from "../Button"

const knownExplorerUrls: Record<number, string> = {
    43114: "https://subnets.avax.network/c-chain",
    43113: "https://subnets-test.avax.network/c-chain",
    173750: "https://subnets-test.avax.network/echo",
    779672: "https://subnets-test.avax.network/dispatch"
}

export const ExplorerButton = ({ rpcUrl, evmChainId }: { rpcUrl: string, evmChainId: number }) => {
    const handleExplorerClick = () => {
        const url = knownExplorerUrls[evmChainId];
        window.open(url, "_blank");
    };

    if (knownExplorerUrls[evmChainId]) {
        return (
            <button
                onClick={handleExplorerClick}
                className="ml-2 px-2 py-1 text-xs font-medium bg-zinc-600 hover:bg-zinc-700 text-white rounded transition-colors"
                title="Open explorer"
            >
                Explorer
            </button>
        );
    }

    if (!rpcUrl) {
        return;
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button
                    className="ml-2 px-2 py-1 text-xs font-medium bg-zinc-600 hover:bg-zinc-700 text-white rounded transition-colors"
                    title="Open explorer"
                >
                    Explorer
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl z-50 max-w-3xl w-full">
                    <Dialog.Title className="text-xl font-bold mb-4">Custom Chain Explorer</Dialog.Title>
                    <div className="mb-4">
                        <p className="mb-3">Use Routescan to explore this chain by adding your RPC URL:</p>
                        <CodeHighlighter lang="sh" code={rpcUrl} />
                        <a
                            href="https://devnet.routescan.io/"
                            target="_blank"
                        >
                            <Button>Open Routescan Explorer</Button>
                        </a>
                    </div>
                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700">✕</button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
