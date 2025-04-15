"use client";

import { useToolboxStore } from "../toolboxStore";
import { useWalletStore } from "../../lib/walletStore";
import { Select } from "../components/Select";
import { useState, useEffect } from "react";
import { networkIDs } from "@avalabs/avalanchejs";
import versions from "../../versions.json";
import { CodeHighlighter } from "../../components/CodeHighlighter";
import { Container } from "../components/Container";
import { Input } from "../../components/Input";
import { Tabs } from "../../components/Tabs";

// Node type descriptions
const NODE_TYPE_INFO = {
    "Validator Node": "Participates in consensus and validates transactions. Sufficient for basic validation tasks when you don't need to expose APIs to external services.",
    "RPC Node": "Exposes APIs for applications to interact with the blockchain. Necessary when building dApps or services that need to query or submit transactions to the network."
};

const generateDockerCommand = (subnets: string[], isRPC: boolean, networkID: number) => {
    const httpPort = isRPC ? "8080" : "9650";
    const stakingPort = isRPC ? "9653" : "9651";

    const env: Record<string, string> = {
        AVAGO_PARTIAL_SYNC_PRIMARY_NETWORK: "true",
        AVAGO_PUBLIC_IP_RESOLUTION_SERVICE: "opendns",
        AVAGO_HTTP_HOST: "0.0.0.0",
    };

    subnets = subnets.filter(subnet => subnet !== "");
    if (subnets.length !== 0) {
        env.AVAGO_TRACK_SUBNETS = subnets.join(",");
    }

    if (httpPort !== "9650") {
        env.AVAGO_HTTP_PORT = httpPort;
    }

    if (stakingPort !== "9651") {
        env.AVAGO_STAKING_PORT = stakingPort;
    }

    if (networkID === networkIDs.FujiID) {
        env.AVAGO_NETWORK_ID = "fuji";
    } else if (networkID === networkIDs.MainnetID) {
        delete env.AVAGO_NETWORK_ID; //default is mainnet
    } else {
        throw new Error(`This tool only supports Fuji (${networkIDs.FujiID}) and Mainnet (${networkIDs.MainnetID}). Network ID ${networkID} is not supported.`);
    }

    if (isRPC) {
        env.AVAGO_HTTP_ALLOWED_HOSTS = "\"*\"";
    }

    const localFolder = isRPC ? "~/.avalanchego_rpc" : "~/.avalanchego";
    const containerName = isRPC ? "rpc" : "avago";
    const chunks = [
        "docker run -it -d",
        `--name ${containerName}`,
        `-p ${isRPC ? "0.0.0.0" : "127.0.0.1"}:${httpPort}:${httpPort} -p ${stakingPort}:${stakingPort}`,
        `-v ${localFolder}:/root/.avalanchego`,
        ...Object.entries(env).map(([key, value]) => `-e ${key}=${value}`),
        `avaplatform/subnet-evm:${versions['avaplatform/subnet-evm']}`
    ];
    return chunks.map(chunk => `    ${chunk}`).join(" \\\n").trim();
}

const nipify = (domain: string) => {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(domain)) {
        domain = `${domain}.nip.io`;
    }
    return domain;
}

const reverseProxyCommand = (domain: string) => {
    domain = nipify(domain);

    return `docker run -d \\
  --name caddy \\
  --network host \\
  -v caddy_data:/data \\
  caddy:2.8-alpine \\
  caddy reverse-proxy --from ${domain} --to localhost:8080`
}

const enableDebugNTraceCommand = (chainId: string) => `sudo mkdir -p $HOME/.avalanchego_rpc/configs/chains/${chainId}; 
sudo chown -R $USER:$USER $HOME/.avalanchego_rpc/configs/chains/;

sudo echo '{
  "log-level": "debug",
  "warp-api-enabled": true,
  "eth-apis": [
    "eth",
    "eth-filter",
    "net",
    "admin",
    "web3",
    "internal-eth",
    "internal-blockchain",
    "internal-transaction",
    "internal-debug",
    "internal-account",
    "internal-personal",
    "debug",
    "debug-tracer",
    "debug-file-tracer",
    "debug-handler"
  ]
}' > $HOME/.avalanchego_rpc/configs/chains/${chainId}/config.json`

const checkNodeCommand = (chainID: string, domain: string, isDebugTrace: boolean) => {
    domain = nipify(domain);
    if (domain.startsWith("127.0.0.1")) {
        domain = "http://" + domain;
    } else {
        domain = "https://" + domain;
    }

    if (!isDebugTrace) {
        return `curl -X POST --data '{ 
  "jsonrpc":"2.0", "method":"eth_chainId", "params":[], "id":1 
}' -H 'content-type:application/json;' \\
${domain}/ext/bc/${chainID}/rpc`
    } else {
        return `curl -X POST --data '{ 
  "jsonrpc":"2.0", "method":"debug_traceBlockByNumber", "params":["latest", {}], "id":1 
}' -H 'content-type:application/json;' \\
${domain}/ext/bc/${chainID}/rpc`
    }
}

const dockerInstallInstructions: Record<string, string> = {
    'Ubuntu/Debian': `sudo apt-get update && \\
    sudo apt-get install -y docker.io && \\
    sudo usermod -aG docker $USER && \\
    newgrp docker

# Test docker installation
docker run -it --rm hello-world
`,
    'Amazon Linux 2023+': `sudo yum update -y && \\
    sudo yum install -y docker && \\
    sudo service docker start && \\
    sudo usermod -a -G docker $USER && \\
    newgrp docker

# Test docker installation
docker run -it --rm hello-world
`,
    'Fedora': `sudo dnf update -y && \\
    sudo dnf -y install docker && \\
    sudo systemctl start docker && \\
    sudo usermod -a -G docker $USER && \\
    newgrp docker

# Test docker installation
docker run -it --rm hello-world
`,
} as const;

type OS = keyof typeof dockerInstallInstructions;

export default function AvalanchegoDocker() {
    const { subnetId, setSubnetID, chainID, setChainID, setEvmChainRpcUrl } = useToolboxStore();
    const { avalancheNetworkID } = useWalletStore();

    const [isRPC, setIsRPC] = useState<"true" | "false">("false");
    const [rpcCommand, setRpcCommand] = useState("");
    const [domain, setDomain] = useState("");
    const [enableDebugTrace, setEnableDebugTrace] = useState<"true" | "false">("false");
    const [activeOS, setActiveOS] = useState<OS>("Ubuntu/Debian");

    useEffect(() => {
        try {
            setRpcCommand(generateDockerCommand([subnetId], isRPC === "true", avalancheNetworkID));
        } catch (error) {
            setRpcCommand((error as Error).message);
        }
    }, [subnetId, isRPC, avalancheNetworkID]);


    useEffect(() => {
        if (domain && chainID && isRPC === "true") {
            setEvmChainRpcUrl("https://" + nipify(domain) + "/ext/bc/" + chainID + "/rpc");
        }
    }, [domain, chainID, isRPC]);

    useEffect(() => {
        if (isRPC === "false") {
            setDomain("");
        }
    }, [isRPC]);

    return (
        <Container
            title="Node Setup with Docker"
            description="This will start a Docker container running an RPC or validator node that tracks your subnet."
        >
            <div className="space-y-4">
                <div className="mb-4">
                    This command will start a Docker container running an RPC or validator node that tracks your subnet.
                </div>

                <Input
                    label="Subnet ID"
                    value={subnetId}
                    onChange={setSubnetID}
                    placeholder="Create a subnet to generate a subnet ID"
                />

                <div className="relative">
                    <div className="flex items-center">
                        <Tabs
                            tabs={["Validator Node", "RPC Node"]}
                            activeTab={isRPC === "false" ? "Validator Node" : "RPC Node"}
                            setActiveTab={(tab) => setIsRPC(tab === "Validator Node" ? "false" : "true")}
                        />
                        <div 
                            className="ml-2 text-gray-500 cursor-help"
                            onMouseEnter={() => {
                                const tooltip = document.getElementById('node-type-tooltip');
                                if (tooltip) tooltip.style.display = 'block';
                            }}
                            onMouseLeave={() => {
                                const tooltip = document.getElementById('node-type-tooltip');
                                if (tooltip) tooltip.style.display = 'none';
                            }}
                        >
                            ⓘ
                            <div 
                                id="node-type-tooltip"
                                className="hidden absolute z-50 w-64 p-2 bg-white dark:bg-gray-800 rounded shadow-lg text-sm border border-gray-300 dark:border-gray-700 left-0 mt-1"
                            >
                                <p className="mb-2"><strong>Validator Node:</strong> {NODE_TYPE_INFO["Validator Node"]}</p>
                                <p><strong>RPC Node:</strong> {NODE_TYPE_INFO["RPC Node"]}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {isRPC === "true" && (
                    <>
                        <Select
                            label="Enable Debug & Trace"
                            value={enableDebugTrace}
                            onChange={(value) => setEnableDebugTrace(value as "true" | "false")}
                            options={[
                                { value: "false", label: "Disabled" },
                                { value: "true", label: "Enabled" },
                            ]}
                        />

                        {enableDebugTrace === "true" && (
                            <Input
                                label="Chain ID"
                                value={chainID}
                                onChange={setChainID}
                                placeholder="Enter Chain ID"
                            />
                        )}
                    </>
                )}

                {isRPC === "true" && (
                    <Input
                        label="Domain or IPv4 address for reverse proxy (optional)"
                        value={domain}
                        onChange={setDomain}
                        placeholder="example.com  or 1.2.3.4"
                        helperText="`curl checkip.amazonaws.com` to get your public IP address. Make sure 443 is open on your firewall."
                    />
                )}
                {chainID && enableDebugTrace === "true" && isRPC === "true" && (
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Debug & Trace Setup Command:</h3>
                        <p className="text-sm mb-2">Note: Run this before starting the node.</p>
                        <CodeHighlighter
                            code={enableDebugNTraceCommand(chainID)}
                            lang="bash"
                        />
                    </div>
                )}

                <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Docker Installation Command:</h3>
                    <p className="mb-4">
                        We will retrieve the binary images of{" "}
                        <a
                            href="https://github.com/ava-labs/avalanchego"
                            target="_blank"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            rel="noreferrer"
                        >
                            AvalancheGo
                        </a>{" "}
                        from the Docker Hub. Make sure you have Docker installed on your system.
                    </p>

                    <Tabs
                        tabs={Object.keys(dockerInstallInstructions)}
                        activeTab={activeOS}
                        setActiveTab={setActiveOS}
                        children={(activeTab) => {
                            return <CodeHighlighter lang="bash" code={dockerInstallInstructions[activeTab]} />
                        }}
                    />

                    <p className="mt-4">
                        If you do not want to use Docker, you can follow the instructions{" "}
                        <a
                            href="https://github.com/ava-labs/avalanchego?tab=readme-ov-file#installation"
                            target="_blank"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            rel="noreferrer"
                        >
                            here
                        </a>
                        .
                    </p>
                </div>

                <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Node Setup Command:</h3>
                    <CodeHighlighter
                        code={rpcCommand}
                        lang="bash"
                    />
                </div>

                {domain && isRPC === "true" && (
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Reverse Proxy Command:</h3>
                        <CodeHighlighter
                            code={reverseProxyCommand(domain)}
                            lang="bash"
                        />
                    </div>
                )}

                {chainID && (
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Check Node Command:</h3>
                        <CodeHighlighter
                            code={checkNodeCommand(chainID, domain || ("127.0.0.1:" + (isRPC === "true" ? "8080" : "9650")), false)}
                            lang="bash"
                        />
                    </div>
                )}

                {isRPC === "false" && (
                    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <h3 className="text-md font-medium mb-2">Running Multiple Validator Nodes:</h3>
                        <p>To run multiple validator nodes on the same machine, ensure each node has:</p>
                        <ul className="list-disc pl-5 mt-1">
                            <li>Unique container name (change <code>--name</code> parameter)</li>
                            <li>Different ports (modify <code>AVAGO_HTTP_PORT</code> and <code>AVAGO_STAKING_PORT</code>)</li>
                            <li>Separate data directories (change the local volume path <code>~/.avalanchego</code> to a unique directory)</li>
                        </ul>
                        <p className="mt-1">Example for second node: Use ports 9652/9653 (HTTP/staking), container name "avago2", and data directory "~/.avalanchego2"</p>
                    </div>
                )}

                {chainID && isRPC === "true" && enableDebugTrace === "true" && (
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Check that debug & trace is working:</h3>
                        <CodeHighlighter
                            code={checkNodeCommand(chainID, domain || ("127.0.0.1:" + (isRPC === "true" ? "8080" : "9650")), true)}
                            lang="bash"
                        />
                    </div>
                )}
            </div>
        </Container>
    );
};
