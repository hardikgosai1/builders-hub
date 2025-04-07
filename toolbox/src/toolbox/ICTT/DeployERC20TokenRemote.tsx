"use client";

import ERC20TokenRemote from "../../../contracts/icm-contracts/compiled/ERC20TokenRemote.json";
import { useToolboxStore, useViemChainStore, type DeployOn } from "../toolboxStore";
import { useWalletStore } from "../../lib/walletStore";
import { useErrorBoundary } from "react-error-boundary";
import { useState, useEffect, useMemo } from "react";
import { Button } from "../../components/Button";
import { Success } from "../../components/Success";
import { Input } from "../../components/Input";
import { avalancheFuji } from "viem/chains";
import { RequireChain } from "../../components/RequireChain";
import { RadioGroup } from "../../components/RadioGroup";
import { createPublicClient, http } from "viem";
import { RequireChainToolbox } from "../components/RequireChainToolboxL1";
import { Note } from "../../components/Note";
import { utils } from "@avalabs/avalanchejs";
import ERC20TokenHomeABI from "../../../contracts/icm-contracts/compiled/ERC20TokenHome.json";
import ExampleERC20 from "../../../contracts/icm-contracts/compiled/ExampleERC20.json";

const C_CHAIN_TELEPORTER_REGISTRY_ADDRESS = "0xF86Cb19Ad8405AEFa7d09C778215D2Cb6eBfB228";
const FUJI_C_BLOCKCHAIN_ID = "yH8D7ThNJkxmtkuv2jgBa4P1Rn3Qpr4pPr7QYNfcdoS6k6HWp";

export default function DeployERC20TokenRemote() {
    const { showBoundary } = useErrorBoundary();
    const {
        teleporterRegistryAddress,
        erc20TokenHomeAddress,
        erc20TokenRemoteAddress,
        setErc20TokenRemoteAddress,
        L1ID,
        setErc20TokenHomeAddress,
        setTeleporterRegistryAddress,
        chainID,
        setChainID
    } = useToolboxStore();
    const { coreWalletClient, walletEVMAddress } = useWalletStore();
    const viemChain = useViemChainStore();
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployOn, setDeployOn] = useState<DeployOn>("L1");
    const [teleporterManager, setTeleporterManager] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenDecimals, setTokenDecimals] = useState("0");
    const [minTeleporterVersion, setMinTeleporterVersion] = useState("1");
    const [tokenHomeDecimals, setTokenHomeDecimals] = useState("0");
    const [fetchingDecimalsError, setFetchingDecimalsError] = useState("");
    const [deployError, setDeployError] = useState("");
    const [chainIDError, setChainIDError] = useState<string | undefined>();

    const deployOnOptions = [
        { label: "L1", value: "L1" },
        { label: "C-Chain", value: "C-Chain" }
    ];

    const sourceChainIDHex = useMemo(() => {
        let chainIDBase58 = deployOn === "L1" ? FUJI_C_BLOCKCHAIN_ID : chainID;
        return utils.bufferToHex(utils.base58check.decode(chainIDBase58));
    }, [deployOn, chainID]);


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
            <RequireChainToolbox requireChain={deployOn}>
                <div className="space-y-4 mt-4">
                    <div className="">
                        This deploys an `ERC20TokenRemote` contract to the selected network. This contract acts as the bridge endpoint on the destination chain for your ERC20 token.
                    </div>


                    {deployOn === "L1" && <><Input
                        label="Teleporter Registry Address"
                        value={teleporterRegistryAddress}
                        onChange={setTeleporterRegistryAddress}
                    />

                        {!teleporterRegistryAddress && <Note variant="warning">
                            <p>
                                Please <a href="#teleporterRegistry" className="text-blue-500">deploy the Teleporter Registry contract first</a>.
                            </p>
                        </Note>}

                    </>}

                    {deployOn === "C-Chain" && <Input
                        label="C-Chain Teleporter Registry Address"
                        value={C_CHAIN_TELEPORTER_REGISTRY_ADDRESS}
                        disabled
                    />}

                    {/* Source ChainID */}
                    {deployOn === "C-Chain" && <Input
                        label="L1 Chain ID (source chain)"
                        value={chainID}
                        onChange={setChainID}
                    />}

                    {deployOn === "L1" && <Input
                        label="C-Chain Chain ID (source chain)"
                        value={FUJI_C_BLOCKCHAIN_ID}
                        disabled
                    />}

                    {<Input
                        label="Source Chain ID (hex)"
                        value={sourceChainIDHex}
                        disabled
                    />}


                </div>
            </RequireChainToolbox >
        </div >
    );
} 
