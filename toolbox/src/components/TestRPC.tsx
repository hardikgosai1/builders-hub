import { Input } from "./Input";
import { Button } from "./Button";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { http } from "viem";
import { createPublicClient } from "viem";
import { useEffect, useState } from "react";


export const TestRPC = ({ rpcUrl }: { rpcUrl: string }) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [evmChainId, setEvmChainId] = useState<number | null>(null);

    async function testRPC() {
        setSuccess(false);
        setError(null);
        setLoading(true);
        try {
            const publicClient = createPublicClient({
                transport: http(rpcUrl),
            });
            const chainId = await publicClient.getChainId();
            setEvmChainId(chainId);
            setSuccess(true);
        } catch (error) {
            setError(`RPC is not working: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        testRPC();
    }, [rpcUrl]);
    return (
        <>
            <div className="space-y-2">
                <Input
                    readOnly
                    label="Your RPC URL"
                    value={rpcUrl}
                    helperText={rpcUrl.indexOf('127.0.0.1') !== -1 ? "This is a localhost URL and is not accessible from the internet. Use port forwarding if needed." : ""}
                    button={<Button stickLeft icon={<ArrowRight className="text-white" />} onClick={testRPC} disabled={loading}>{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Test RPC"}</Button>}
                />
                {success && <div className="flex items-center gap-2"><Check className="h-5 w-5" /> RPC is working and returns chainId {evmChainId}</div>}
                {error && <div className="text-red-500">Failed to test RPC from your browser: {error}</div>}
            </div>
        </>
    );
};
