import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, webSocket, PublicClient, WatchBlocksReturnType } from 'viem';
import { Input } from './Input'; // Assuming Input is in the same directory or adjust path
import { Loader2 } from 'lucide-react'; // For loading indicator

interface WssEndpointInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    chainId: string; // Pass chainId for potential caching/tracking if needed
}

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
        return new Promise(resolve => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                resolve(func(...args));
            }, waitFor);
        });
    };
}


export default function WssEndpointInput({
    value,
    onChange,
    label = "WebSocket Endpoint",
    placeholder = "wss://...",
    chainId
}: WssEndpointInputProps) {
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | undefined>(undefined);
    const [validationSuccess, setValidationSuccess] = useState<string | undefined>(undefined);

    const validateEndpoint = useCallback(async (endpoint: string) => {
        setValidationError(undefined);
        setValidationSuccess(undefined);

        if (!endpoint) return;

        if (!endpoint.startsWith('ws://') && !endpoint.startsWith('wss://')) {
            setValidationError("URL must start with ws:// or wss://");
            return;
        }

        setIsValidating(true);
        let client: PublicClient | undefined;
        let unwatch: WatchBlocksReturnType | undefined;

        try {
            client = createPublicClient({
                transport: webSocket(endpoint, {
                    timeout: 5000, // Connection attempt timeout
                    key: `wss-validate-${chainId}-${Date.now()}`,
                    name: `wss-validator-${chainId}`,
                    // Retry might cause delays/issues for simple validation
                    retryCount: 0,
                }),
            });

            // 1. Try setting up the watcher. We don't need the callbacks here.
            unwatch = client.watchBlocks({
                onBlock: () => { /* No-op */ },
                onError: () => { /* No-op */ }
                // emitOnBegin: false // Not strictly needed for this test
            });

            // 2. If setup succeeded, immediately try to unwatch.
            if (unwatch) {
                await unwatch();
            }

            // 3. If both setup and unwatch completed without error: SUCCESS
            setValidationSuccess("WebSocket connection appears active (watch/unwatch successful).");

        } catch (error: any) {
            // Catch errors from either createPublicClient, watchBlocks, or unwatch
            console.error(`Simple watchBlocks validation failed for ${endpoint}:`, error);
            if (error.message?.includes('timed out')) {
                setValidationError("Validation failed: Connection timed out.");
            } else if (error.message?.includes('WebSocket connection failed')) {
                setValidationError("Validation failed: Could not connect to endpoint.");
            } else if (error.message?.includes('requested too many resources')) {
                setValidationError("Validation failed: Endpoint may be rate-limiting connections.");
            } else {
                // Include method name if available in error (like eth_getBlockByNumber error)
                setValidationError(`Validation failed: ${error.shortMessage || error.message || 'Unknown error'}`);
            }
            // Ensure unwatch is called if it exists, even if subsequent unwatch call failed
            if (unwatch) {
                try { await unwatch(); } catch { /* Ignore nested error */ }
            }
        } finally {
            setIsValidating(false);
            // Attempt to disconnect the client regardless of success/failure
            try {
                await client?.transport.webSocket?.disconnect?.();
            } catch (disconnectError) {
                console.warn("Error disconnecting validation WebSocket:", disconnectError);
            }
        }
    }, [chainId]);

    // Debounced validation function
    const debouncedValidate = useCallback(debounce(validateEndpoint, 600), [validateEndpoint]);

    useEffect(() => {
        // Trigger debounced validation when value changes
        debouncedValidate(value);
        // Cleanup function to potentially cancel ongoing validation if component unmounts or value changes quickly
        return () => {
            // Currently debounce handles timeout clearing, but add explicit cancellation if needed later
        };
    }, [value, debouncedValidate]);

    return (
        <Input
            label={label}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            error={validationError}
            helperText={
                isValidating ? (
                    <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Validating...</span>
                    </span>
                ) : validationSuccess ? (
                    <span className="text-green-600 dark:text-green-500">{validationSuccess}</span>
                ) : undefined
            }
            button={undefined}
        />
    );
}
