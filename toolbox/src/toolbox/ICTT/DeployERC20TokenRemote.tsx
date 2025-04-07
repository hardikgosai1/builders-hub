"use client";

import ERC20TokenRemote from "../../../contracts/icm-contracts/compiled/ERC20TokenRemote.json";
import { useToolboxStore, useViemChainStore, type DeployOn } from "../toolboxStore";
import { useWalletStore } from "../../lib/walletStore";
import { useErrorBoundary } from "react-error-boundary";
import { useState, useEffect } from "react";
import { Button } from "../../components/Button";
import { Success } from "../../components/Success";
import { Input } from "../../components/Input";
import { avalancheFuji } from "viem/chains";
import { RequireChain } from "../../components/RequireChain";
import { RadioGroup } from "../../components/RadioGroup";
import { createPublicClient, http } from "viem";

export default function DeployERC20TokenRemote() {
    const { showBoundary } = useErrorBoundary();
    const {
        teleporterRegistryAddress,
        erc20TokenHomeAddress,
        erc20TokenRemoteAddress,
        setErc20TokenRemoteAddress,
        L1ID
    } = useToolboxStore();
    const { coreWalletClient, walletEVMAddress } = useWalletStore();
    const viemChain = useViemChainStore();
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployOn, setDeployOn] = useState<DeployOn>("L1");
    const [teleporterManager, setTeleporterManager] = useState("");
    const [tokenName, setTokenName] = useState("My Token");
    const [tokenSymbol, setTokenSymbol] = useState("MYT");
    const [tokenDecimals, setTokenDecimals] = useState("18");
    const [sourceBlockchainID, setSourceBlockchainID] = useState("");

    const deployOnOptions = [
        { label: "L1", value: "L1" },
        { label: "C-Chain", value: "C-Chain" }
    ];

    useEffect(() => {
        if (!teleporterManager && walletEVMAddress) {
            setTeleporterManager(walletEVMAddress);
        }
    }, [walletEVMAddress]);

    // Set source blockchain ID based on where we are *not* deploying
    useEffect(() => {
        if (deployOn === "L1" && avalancheFuji?.id) {
            setSourceBlockchainID("0x" + avalancheFuji.id.toString(16)); // Example: Set C-Chain ID if deploying on L1
        } else if (deployOn === "C-Chain" && L1ID) {
            setSourceBlockchainID(L1ID); // Set L1 ID if deploying on C-Chain
        }
    }, [deployOn, L1ID]);


    const requiredChain = deployOn === "L1" ? viemChain : avalancheFuji;
    if (!requiredChain) return <div>Loading chains...</div>;

    const homeAddressForDeployment = erc20TokenHomeAddress?.[deployOn === "L1" ? "C-Chain" : "L1"]; // Get home address from the *other* chain

    async function handleDeploy() {
        if (!teleporterRegistryAddress) {
            alert("Teleporter Registry address is required. Please deploy it first.");
            return;
        }
        if (!homeAddressForDeployment) {
            alert(`ERC20 Token Home address for the ${deployOn === "L1" ? "C-Chain" : "L1"} is required. Please deploy it first.`);
            return;
        }
        if (!sourceBlockchainID) {
            alert("Source Blockchain ID is required.");
            return;
        }
        if (!requiredChain) {
            throw new Error("Failed to fetch chain. Please try again.");
        }

        setIsDeploying(true);
        try {
            const publicClient = createPublicClient({
                chain: requiredChain,
                transport: http(requiredChain.rpcUrls.default.http[0])
            });

            const hash = await coreWalletClient.deployContract({
                abi: ERC20TokenRemote.abi,
                bytecode: ERC20TokenRemote.bytecode.object as `0x${string}`,
                args: [
                    teleporterRegistryAddress as `0x${string}`,
                    teleporterManager || coreWalletClient.account.address,
                    sourceBlockchainID as `0x${string}`, // Source Blockchain ID (e.g., L1 if deploying on C-Chain)
                    homeAddressForDeployment as `0x${string}`, // Token Home address on the *other* chain
                    tokenName,
                    tokenSymbol,
                    parseInt(tokenDecimals)
                ],
                chain: requiredChain
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (!receipt.contractAddress) {
                throw new Error("No contract address in receipt");
            }

            setErc20TokenRemoteAddress(receipt.contractAddress, deployOn);
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsDeploying(false);
        }
    }

    return (
        <div className="">
            <h2 className="text-lg font-semibold mb-4">Deploy ERC20 Token Remote Contract</h2>

            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
                <RadioGroup
                    value={deployOn}
                    onChange={(value) => setDeployOn(value as DeployOn)}
                    items={deployOnOptions}
                    idPrefix="deploy-remote-on-"
                />
            </div>
            <RequireChain chain={requiredChain}>
                <div className="space-y-4 mt-4">
                    <div className="">
                        This deploys an `ERC20TokenRemote` contract to the selected network. This contract acts as the bridge endpoint on the destination chain for your ERC20 token.
                    </div>

                    <Input
                        label="Teleporter Registry Address (on selected chain)"
                        value={teleporterRegistryAddress}
                        disabled
                        helperText="This should be the registry address on the network you are deploying to."
                    />

                    <Input
                        label="Teleporter Manager Address"
                        value={teleporterManager}
                        onChange={setTeleporterManager}
                        placeholder={coreWalletClient?.account?.address}
                        helperText="default: your address"
                    />

                    <Input
                        label="Source Blockchain ID (Hex)"
                        value={sourceBlockchainID}
                        onChange={setSourceBlockchainID}
                        required
                        helperText={`The Blockchain ID of the chain where the 'Home' contract is deployed (e.g., ${deployOn === 'L1' ? 'C-Chain ID' : 'L1 ID'}). Automatically populated based on selection.`}
                        error={!sourceBlockchainID ? "Required." : undefined}
                    />

                    <Input
                        label={`Token Home Address (on ${deployOn === 'L1' ? 'C-Chain' : 'L1'})`}
                        value={homeAddressForDeployment || ""}
                        disabled
                        required
                        helperText={`The address of the ERC20TokenHome contract deployed on the *other* chain (${deployOn === 'L1' ? 'C-Chain' : 'L1'}). This should be deployed first.`}
                        error={!homeAddressForDeployment ? "Required. Deploy the Home contract on the other chain first." : undefined}
                    />

                    <Input
                        label="Token Name"
                        value={tokenName}
                        onChange={setTokenName}
                        required
                    />

                    <Input
                        label="Token Symbol"
                        value={tokenSymbol}
                        onChange={setTokenSymbol}
                        required
                    />

                    <Input
                        label="Token Decimals"
                        value={tokenDecimals}
                        onChange={setTokenDecimals}
                        type="number"
                        required
                    />


                    <Success
                        label={`ERC20 Token Remote Address (on ${deployOn})`}
                        value={erc20TokenRemoteAddress?.[deployOn] || ""}
                    />

                    <Button
                        variant={erc20TokenRemoteAddress?.[deployOn] ? "secondary" : "primary"}
                        onClick={handleDeploy}
                        loading={isDeploying}
                        disabled={!teleporterRegistryAddress || !homeAddressForDeployment || !sourceBlockchainID || isDeploying}
                    >
                        {erc20TokenRemoteAddress?.[deployOn] ? "Re-Deploy ERC20 Token Remote" : "Deploy ERC20 Token Remote"}
                    </Button>
                </div>
            </RequireChain>
        </div>
    );
} 
