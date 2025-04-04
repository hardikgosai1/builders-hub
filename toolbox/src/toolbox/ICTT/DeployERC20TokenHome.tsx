"use client";

import ERC20TokenHome from "../../../contracts/icm-contracts/compiled/ERC20TokenHome.json";
import { useToolboxStore, useViemChainStore } from "../toolboxStore";
import { useWalletStore } from "../../lib/walletStore";
import { useErrorBoundary } from "react-error-boundary";
import { useState, useEffect } from "react";
import { Button } from "../../components/Button";
import { Success } from "../../components/Success";
import { RequireChainToolboxL1 } from "../components/RequireChainToolboxL1";
import { Input } from "../../components/Input";
import ExampleERC20 from "../../../contracts/icm-contracts/compiled/ExampleERC20.json"

export default function DeployERC20TokenHome() {
    const { showBoundary } = useErrorBoundary();
    const {
        teleporterRegistryAddress,
        exampleErc20Address,
        setErc20TokenHomeAddress,
        erc20TokenHomeAddress
    } = useToolboxStore();
    const { coreWalletClient, publicClient, walletChainId, walletEVMAddress } = useWalletStore();
    const viemChain = useViemChainStore();
    const [isDeploying, setIsDeploying] = useState(false);
    const [teleporterManager, setTeleporterManager] = useState("");
    const [minTeleporterVersion, setMinTeleporterVersion] = useState("1");
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenDecimals, setTokenDecimals] = useState("0");
    const [localError, setLocalError] = useState("");

    // Initialize token address with exampleErc20Address when it becomes available
    useEffect(() => {
        if (exampleErc20Address && !tokenAddress) {
            setTokenAddress(exampleErc20Address);
        }
    }, [exampleErc20Address, tokenAddress]);

    useEffect(() => {
        if (!teleporterManager && walletEVMAddress) {
            setTeleporterManager(walletEVMAddress);
        }
    }, [walletEVMAddress]);

    useEffect(() => {
        if (!tokenAddress) return;
        setLocalError("");
        publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ExampleERC20.abi,
            functionName: "decimals"
        }).then((res) => {
            console.log("Token decimals: " + res);
            setTokenDecimals((res as bigint).toString());
        }).catch((error) => {
            setLocalError("Failed to fetch token decimals: " + error);
        });
    }, [tokenAddress]);

    async function handleDeploy() {
        if (!teleporterRegistryAddress) {
            alert("Teleporter Registry address is required. Please deploy it first.");
            return;
        }

        if (!tokenAddress) {
            alert("Token address is required. Please deploy an ERC20 token first.");
            return;
        }

        setIsDeploying(true);
        try {
            const hash = await coreWalletClient.deployContract({
                abi: ERC20TokenHome.abi,
                bytecode: ERC20TokenHome.bytecode.object as `0x${string}`,
                args: [
                    teleporterRegistryAddress as `0x${string}`,
                    teleporterManager || coreWalletClient.account.address,
                    BigInt(minTeleporterVersion),
                    tokenAddress as `0x${string}`,
                    parseInt(tokenDecimals)
                ],
                chain: viemChain
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt');
            }

            setErc20TokenHomeAddress(receipt.contractAddress);
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsDeploying(false);
        }
    }

    return (
        <RequireChainToolboxL1>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Deploy ERC20 Token Home Contract</h2>
                <div className="space-y-4">
                    <div className="">
                        This will deploy an ERC20TokenHome contract to your connected network (Chain ID: <code>{walletChainId}</code>).
                        This contract serves as the home chain endpoint for cross-chain token transfers.
                    </div>

                    {localError && <div className="text-red-500">{localError}</div>}

                    <Input
                        label="Teleporter Registry Address"
                        value={teleporterRegistryAddress}
                        disabled
                    />

                    <Input
                        label="Teleporter Manager Address"
                        value={teleporterManager}
                        onChange={setTeleporterManager}
                        placeholder={coreWalletClient?.account?.address}
                        helperText="default: your address"
                    />

                    <Input
                        label="Min Teleporter Version"
                        value={minTeleporterVersion}
                        onChange={setMinTeleporterVersion}
                        type="number"
                        required
                    />

                    <Input
                        label="Token Address"
                        value={tokenAddress}
                        onChange={setTokenAddress}
                        placeholder={exampleErc20Address}
                        required
                        error={!tokenAddress ? "Required. Deploy an ERC20 token first." : undefined}
                    />

                    <Input
                        label="Token Decimals"
                        value={tokenDecimals}
                        onChange={setTokenDecimals}
                        type="number"
                        disabled
                        helperText="This is automatically fetched from the token contract."
                    />

                    <Success
                        label="ERC20 Token Home Address"
                        value={erc20TokenHomeAddress}
                    />

                    <Button
                        variant={erc20TokenHomeAddress ? "secondary" : "primary"}
                        onClick={handleDeploy}
                        loading={isDeploying}
                        disabled={!teleporterRegistryAddress || !tokenAddress || tokenDecimals === "0"}
                    >
                        {erc20TokenHomeAddress ? "Re-Deploy ERC20 Token Home" : "Deploy ERC20 Token Home"}
                    </Button>


                </div>
            </div>
        </RequireChainToolboxL1>
    );
} 
