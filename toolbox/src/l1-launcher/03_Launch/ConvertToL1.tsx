import { useEffect, useState } from 'react';
import { useL1LauncherStore } from '../L1LauncherStore';
import { useWalletStore } from '../../lib/walletStore';
import NextPrev from "../components/NextPrev";
import { CodeHighlighter } from '../../components/CodeHighlighter';
import { Note } from '../../components/Note';
import { Textarea } from "../../components/TextArea";
import { PROXY_ADDRESS } from '../../components/genesis/genGenesis';
import { useErrorBoundary } from 'react-error-boundary';
import { ConvertToL1Params, ConvertToL1Validator } from '../../coreViem/methods/convertToL1';
const INITIAL_VALIDATOR_WEIGHT = 100;

const popRequest = `curl -X POST --data '{ 
    "jsonrpc":"2.0", 
    "id"     :1, 
    "method" :"info.getNodeID" 
}' -H 'content-type:application/json;' 127.0.0.1:9650/ext/info`;

const validateNodePop = (json: string): boolean => {
    try {
        const parsed = JSON.parse(json);
        if (!parsed.result?.nodeID || !parsed.result?.nodePOP?.publicKey || !parsed.result?.nodePOP?.proofOfPossession) {
            return false;
        }

        // Validate nodeID is base58
        const base58Regex = /^NodeID-[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
        if (!base58Regex.test(parsed.result.nodeID)) {
            return false;
        }

        // Validate publicKey and proofOfPossession are hex strings
        const hexRegex = /^0x[0-9a-fA-F]+$/;
        if (!hexRegex.test(parsed.result.nodePOP.publicKey) || !hexRegex.test(parsed.result.nodePOP.proofOfPossession)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

export default function ConvertToL1() {
    const {
        subnetId,
        chainId,
        nodesCount,
        setConversionId,
        conversionId
    } = useL1LauncherStore();
    const [nodePopJsons, setNodePopJsons] = useState<string[]>(Array(nodesCount).fill(''));
    const { coreWalletClient, pChainAddress } = useWalletStore();

    const [isConverting, setIsConverting] = useState(false);
    const [errors, setErrors] = useState<string[]>(Array(nodesCount).fill(''));
    const { showBoundary } = useErrorBoundary()

    useEffect(() => {
        const newErrors = nodePopJsons.map(json => {
            if (!json) return '';
            return validateNodePop(json) ? '' : 'Invalid JSON format. Must contain nodeID and nodePOP fields';
        });
        setErrors(newErrors);
    }, [nodePopJsons]);


    const handleConvertToL1 = async () => {
        setIsConverting(true);
        setConversionId('');

        try {
            const validators: ConvertToL1Validator[] = [];

            // Parse node credentials from JSON responses
            for (let i = 0; i < nodesCount; i++) {
                if (!nodePopJsons[i]) {
                    throw new Error(`Node credentials for node ${i + 1} are missing`);
                }

                const { nodeID, nodePOP } = JSON.parse(nodePopJsons[i]).result;
                validators.push({
                    nodeID,
                    validatorWeight: BigInt(INITIAL_VALIDATOR_WEIGHT),
                    validatorBalance: 0n,
                    remainingBalanceOwner: {
                        addresses: [pChainAddress],
                        threshold: 1
                    },
                    deactivationOwner: {
                        addresses: [pChainAddress],
                        threshold: 1
                    },
                    nodePOP: {
                        publicKey: nodePOP.publicKey,
                        proofOfPossession: nodePOP.proofOfPossession
                    }
                });
            }

            const params: ConvertToL1Params = {
                subnetId: subnetId,
                chainId: chainId,
                validators,
                managerAddress: PROXY_ADDRESS,
                subnetAuth: [0]
            }

            // Use the core wallet client to convert to L1
            const txID = await coreWalletClient.convertToL1(params);

            // Wait for transaction to be processed
            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
            setConversionId(txID || '');

        } catch (error: any) {
            console.error('Failed to convert to L1', error);
            showBoundary(error);
        } finally {
            setIsConverting(false);
        }
    };

    const isFormValid = () => {
        return nodePopJsons.slice(0, nodesCount).every(json => json && validateNodePop(json));
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-medium mb-4">Convert to L1</h1>
                <p>
                    The final step is to convert your subnet to an L1. This requires collecting node credentials and setting up the initial validators.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-medium">Node Credentials</h2>
                <p>
                    For each validator node, run this command to get the node credentials:
                </p>
                <CodeHighlighter lang="bash" code={popRequest} />

                <div className="space-y-6">
                    {Array.from({ length: nodesCount }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Textarea
                                label={`Node ${index + 1} Credentials`}
                                error={errors[index]}
                                rows={4}
                                value={nodePopJsons[index] || ''}
                                onChange={(val: string) => setNodePopJsons(prev => {
                                    const newJsons = [...prev];
                                    newJsons[index] = val;
                                    return newJsons;
                                })}
                                placeholder={`{"jsonrpc":"2.0","result":{"nodeID":"NodeID-....","nodePOP":{"publicKey":"0x...","proofOfPossession":"0x..."}},"id":1}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-medium">Convert to L1</h2>

                {conversionId ? (
                    <div>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
                            </svg>
                            <span>L1 created successfully</span>
                        </div>
                        <div className="mt-2 flex items-center">
                            <span className="font-medium">L1 Transaction ID:</span>
                            <a
                                href={`https://subnets-test.avax.network/p-chain/tx/${conversionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-mono"
                            >
                                {conversionId}
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        <p>
                            Convert your subnet to an L1 with the specified validators. All validators will have a weight of {INITIAL_VALIDATOR_WEIGHT}. The manager address will be set to {PROXY_ADDRESS}.
                        </p>

                        <button
                            onClick={handleConvertToL1}
                            disabled={isConverting || !isFormValid()}
                            className={`px-6 py-2 rounded-md ${isConverting || !isFormValid()
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                                }`}
                        >
                            {isConverting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Converting to L1...
                                </span>
                            ) : 'Convert to L1'}
                        </button>
                    </>
                )}
            </div>

            <NextPrev
                nextEnabled={!!conversionId}
            />
        </div >
    );
}
