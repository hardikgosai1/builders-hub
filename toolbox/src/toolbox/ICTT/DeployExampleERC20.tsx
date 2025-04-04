"use client";

import ExampleERC20 from "../../../contracts/icm-contracts/compiled/ExampleERC20.json"
import { useToolboxStore, useViemChainStore } from "../toolboxStore";
import { useWalletStore } from "../../lib/walletStore";
import { useErrorBoundary } from "react-error-boundary";
import { useState } from "react";
import { Button } from "../../components/Button";
import { Success } from "../../components/Success";
import { RequireChainToolboxL1 } from "../components/RequireChainToolboxL1";

export default function DeployExampleERC20() {
    const { showBoundary } = useErrorBoundary();
    const { exampleErc20Address, setExampleErc20Address } = useToolboxStore();
    const { coreWalletClient, publicClient, walletChainId } = useWalletStore();
    const viemChain = useViemChainStore();
    const [isDeploying, setIsDeploying] = useState(false);

    async function handleDeploy() {
        setIsDeploying(true);
        setExampleErc20Address("");
        try {
            const hash = await coreWalletClient.deployContract({
                abi: ExampleERC20.abi,
                bytecode: ExampleERC20.bytecode.object as `0x${string}`,
                args: [],
                chain: viemChain
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (!receipt.contractAddress) {
                throw new Error('No contract address in receipt');
            }

            setExampleErc20Address(receipt.contractAddress);
        } catch (error) {
            showBoundary(error);
        } finally {
            setIsDeploying(false);
        }
    }

    return (
        <RequireChainToolboxL1>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Deploy ERC20 Token</h2>
                <div className="space-y-4">
                    <div className="">
                        This will deploy an ERC20 token contract to your connected network (Chain ID: <code>{walletChainId}</code>).
                        You can use this token for testing token transfers and other ERC20 interactions. <a href="https://github.com/ava-labs/icm-contracts/blob/51dd21550444e7141d938fd721d994e29a58f7af/contracts/mocks/ExampleERC20.sol" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View the contract source code</a>.
                    </div>

                    <Button
                        variant={exampleErc20Address ? "secondary" : "primary"}
                        onClick={handleDeploy}
                        loading={isDeploying}
                        disabled={isDeploying}
                    >
                        {exampleErc20Address ? "Re-Deploy ERC20 Token" : "Deploy ERC20 Token"}
                    </Button>

                    <Success
                        label="ERC20 Token Address"
                        value={exampleErc20Address}
                    />
                </div>
            </div>
        </RequireChainToolboxL1>
    );
}
