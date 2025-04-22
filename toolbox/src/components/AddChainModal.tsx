import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';
import { createPublicClient, http } from 'viem';
import { useWalletStore } from '../lib/walletStore';
import { utils } from "@avalabs/avalanchejs";
import { Tabs } from './Tabs';
import { Input } from './Input';
import { Select } from '../toolbox/components/Select';
import { getBlockchainInfo } from '../coreViem/utils/glacier';
import * as Dialog from "@radix-ui/react-dialog";

interface AddChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChain: (chain: { 
      id: string; 
      name: string; 
      rpcUrl: string; 
      evmChainId: number; 
      coinName: string; 
      isTestnet: boolean; 
      subnetId: string; 
  }) => void;
}

export const AddChainModal: React.FC<AddChainModalProps> = ({
  isOpen,
  onClose,
  onAddChain,
}) => {
  const [rpcUrl, setRpcUrl] = useState('');
  const [name, setName] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [isAddingChain, setIsAddingChain] = useState(false);
  const [addChainError, setAddChainError] = useState<string | null>(null);
  const [chainId, setChainId] = useState("");
  const [evmChainId, setEvmChainId] = useState(0);
  const [coinName, setCoinName] = useState("COIN");
  const [activeTab, setActiveTab] = useState<"RPC_URL" | "CORE_WALLET">("RPC_URL");
  const [subnetId, setSubnetId] = useState("");
  
  // For Core Wallet tab
  const [anyChainId, setAnyChainId] = useState("");
  const [localError, setLocalError] = useState("");
  const { walletChainId, coreWalletClient } = useWalletStore();

  const FROM_RPC = "Enter RPC URL";
  const FROM_CORE_WALLET = "Load from Core Wallet";

  // Clear form when closed
  useEffect(() => {
    if (!isOpen) {
      setRpcUrl('');
      setName('');
      setIsTestnet(false);
      setAddChainError(null);
      setChainId("");
      setEvmChainId(0);
      setCoinName("COIN");
      setAnyChainId("");
      setLocalError("");
      setActiveTab("RPC_URL");
    }
  }, [isOpen]);

  // Fetch chain data when RPC URL changes
  useEffect(() => {
    async function fetchChainData() {
      setAddChainError(null);
      setEvmChainId(0);
      setChainId("");
      setName("");

      if (!rpcUrl) {
        return;
      }

      if (!rpcUrl.startsWith("https://")) {
        setAddChainError("The RPC URL must start with https://");
        return;
      }

      try {
        const { ethereumChainId, avalancheChainId } = await fetchChainId(rpcUrl);
        setEvmChainId(ethereumChainId);
        setChainId(avalancheChainId);
        
        try {
          const blockchainInfo = await getBlockchainInfo(avalancheChainId);
          setSubnetId(blockchainInfo.subnetId);
          setName(blockchainInfo.blockchainName || "");
        } catch (infoError) {
          console.warn("Could not fetch blockchain info:", infoError);
          // Non-fatal error, continue with what we have
        }
      } catch (error) {
        setAddChainError((error as Error)?.message || String(error));
      }
    }

    if (activeTab === "RPC_URL") {
      fetchChainData();
    }
  }, [rpcUrl, activeTab]);

  // For Core Wallet tab: try to extract EVM Chain ID from any Chain ID
  useEffect(() => {
    (async function () {
      setLocalError("");
      setEvmChainId(-1);
      if (!anyChainId) return;

      try {
        const parsed = parseInt(anyChainId, 10);
        if (!isNaN(parsed)) {
          setEvmChainId(parsed);
          return;
        }
      } catch (e) {
        console.log('error parsing as number:', e);
      }

      try {
        utils.base58check.decode(anyChainId); // Validate Avalanche Chain ID format
        const chain = await getBlockchainInfo(anyChainId);
        setEvmChainId(chain.evmChainId);
        setChainId(anyChainId);
        setSubnetId(chain.subnetId);
        setName(chain.blockchainName || "");
      } catch (error) {
        console.error("Failed to fetch chain info:", error);
        setLocalError("Invalid chain ID. Please enter either a valid EVM chain ID number or an Avalanche blockchain ID in base58 format.");
      }
    })();
  }, [anyChainId]);

  // Switch to chain in Core Wallet
  async function switchToChain(targetEvmChainId: number) {
    try {
      setLocalError("");

      if (!window.avalanche || !window.avalanche.request) {
        throw new Error("Core Wallet extension not found or request method missing.");
      }

      const chainIdHex = `0x${parseInt(targetEvmChainId.toString()).toString(16)}`;

      await window.avalanche.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      console.error("Failed to switch to chain:", error);
      setLocalError(`Failed to switch to chain. Do you have chain ${targetEvmChainId} added in your wallet? Original error: ${(error as Error)?.message || String(error)}`);
    }
  }

  // Fetch current chain info from Core Wallet
  async function fetchFromWallet() {
    try {
      setLocalError("");
      
      if (!coreWalletClient) {
        throw new Error("Core Wallet client not found.");
      }
      
      const evmInfo = await coreWalletClient.getEthereumChain();
      setRpcUrl(evmInfo.rpcUrls[0]);
      setCoinName(evmInfo.nativeCurrency.name);
      setIsTestnet(evmInfo.isTestnet);
      setEvmChainId(evmInfo.id);
      
      // We need to get the Avalanche chain ID if possible
      try {
        const publicClient = createPublicClient({
          transport: http(evmInfo.rpcUrls[0])
        });
        const { avalancheChainId } = await fetchChainId(evmInfo.rpcUrls[0]);
        setChainId(avalancheChainId);
      } catch (chainIdError) {
        console.warn("Could not fetch Avalanche Chain ID:", chainIdError);
        // This is not fatal
      }
    } catch (error) {
      console.error("Failed to fetch from wallet:", error);
      setLocalError(`Failed to fetch from wallet: ${(error as Error)?.message || String(error)}`);
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setAddChainError(null);
    setIsAddingChain(true);
    
    (async () => {
      try {
        if (!window.avalanche || !window.avalanche.request) {
          throw new Error("Core Wallet extension not found or request method missing.");
        }

        // Use existing data if available, otherwise fetch if necessary
        let finalEvmChainId = evmChainId;
        let finalAvalancheChainId = chainId;
        let finalRpcUrl = rpcUrl;
        let finalSubnetId = subnetId;
        let finalName = name;
        let finalCoinName = coinName;
        let finalIsTestnet = isTestnet;

        if (activeTab === "RPC_URL") {
          if (!finalEvmChainId || !finalAvalancheChainId) {
            const { ethereumChainId, avalancheChainId } = await fetchChainId(finalRpcUrl);
            finalEvmChainId = ethereumChainId;
            finalAvalancheChainId = avalancheChainId;
          }
          if (!finalSubnetId || !finalName) {
             try {
                const blockchainInfo = await getBlockchainInfo(finalAvalancheChainId);
                finalSubnetId = blockchainInfo.subnetId;
                // Prioritize user input name if available
                finalName = finalName || blockchainInfo.blockchainName || "";
             } catch (infoError) {
                 console.warn("Could not fetch blockchain info during submit:", infoError);
             }
          }
        } else { // CORE_WALLET tab
            // Ensure data fetched from wallet is used if available and submit is triggered
            if (!finalRpcUrl || !finalCoinName) {
                // Attempt to fetch again if needed, though ideally fetchFromWallet was called
                 try {
                    const evmInfo = await coreWalletClient!.getEthereumChain();
                    finalRpcUrl = evmInfo.rpcUrls[0];
                    finalCoinName = evmInfo.nativeCurrency.name;
                    finalIsTestnet = evmInfo.isTestnet;
                    finalEvmChainId = evmInfo.id;
                    // Re-fetch Avalanche Chain ID if missing
                    if (!finalAvalancheChainId) {
                         const { avalancheChainId: fetchedAvaxId } = await fetchChainId(finalRpcUrl);
                         finalAvalancheChainId = fetchedAvaxId;
                    }
                    // Re-fetch Subnet ID and Name if missing
                    if (!finalSubnetId || !finalName) {
                        const blockchainInfo = await getBlockchainInfo(finalAvalancheChainId);
                        finalSubnetId = blockchainInfo.subnetId;
                         // Prioritize user input name if available
                        finalName = finalName || blockchainInfo.blockchainName || "";
                    }
                 } catch (fetchErr) {
                    throw new Error(`Failed to fetch necessary chain info from wallet: ${fetchErr}`);
                 }
            }
        }

        console.log("handleSubmit: finalEvmChainId =", finalEvmChainId);
        console.log("handleSubmit: finalAvalancheChainId =", finalAvalancheChainId);
        console.log("handleSubmit: finalRpcUrl =", finalRpcUrl);

        if (!finalEvmChainId || !finalAvalancheChainId) {
          throw new Error("Could not determine necessary Chain IDs. Please ensure RPC URL is correct or Core Wallet is connected properly.");
        }
        
        if (!finalRpcUrl) {
            throw new Error("RPC URL is missing.");
        }

        // Check if chain already exists in wallet extension
        let chainExistsInExtension = false;
        try {
          // Attempt to switch - will error if chain doesn't exist
          await window.avalanche.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${finalEvmChainId.toString(16)}` }],
          });
          chainExistsInExtension = true;
        } catch (switchError: any) {
          if (switchError.code !== 4902) { // 4902: Unrecognized chain ID
            console.warn("Error checking chain existence:", switchError);
            // Don't throw, just assume it doesn't exist if code isn't 4902
          }
        }

        // Add chain to wallet extension if it doesn't exist
        if (!chainExistsInExtension) {
          const formattedChainName = `${finalName || finalCoinName}${finalIsTestnet ? ' Testnet' : ''}`;
          await window.avalanche.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${finalEvmChainId.toString(16)}`,
              chainName: formattedChainName,
              nativeCurrency: {
                name: finalName || finalCoinName,
                symbol: (finalCoinName).toUpperCase(),
                decimals: 18,
              },
              rpcUrls: [finalRpcUrl],
            }],
          });
        }

        // Call onAddChain with the complete chain object
        const chainToAdd = {
            id: finalAvalancheChainId, // Avalanche Blockchain ID is the primary ID
            name: finalName || `Chain ${finalEvmChainId}`, // Use fetched/entered name or fallback
            rpcUrl: finalRpcUrl,
            evmChainId: finalEvmChainId,
            coinName: finalCoinName.toUpperCase(), // Ensure symbol is uppercase
            isTestnet: finalIsTestnet,
            subnetId: finalSubnetId || "", // Ensure subnetId is provided, fallback to empty string
        };
        
        onAddChain(chainToAdd);
        
        // Reset form
        onClose();
        
      } catch (err) {
        console.error("Error adding chain:", err);
        setAddChainError(err instanceof Error ? err.message : 'Failed to add or switch chain.');
      } finally {
        setIsAddingChain(false);
      }
    })();
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg focus:outline-none w-[90vw] max-w-md">
          <Dialog.Title className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">
            Add Custom EVM Chain
          </Dialog.Title>
          
          <Tabs
            tabs={[FROM_RPC, FROM_CORE_WALLET]}
            activeTab={activeTab === "RPC_URL" ? FROM_RPC : FROM_CORE_WALLET}
            setActiveTab={(tab) => setActiveTab(tab === FROM_RPC ? "RPC_URL" : "CORE_WALLET")}
          >
            {activeTab === "RPC_URL" ? (
              // RPC URL tab content
              <div className="space-y-4">
                <Input
                  id="rpcUrl"
                  label="RPC URL"
                  value={rpcUrl}
                  onChange={setRpcUrl}
                  placeholder="https://api.mychain.com"
                  error={addChainError || ""}
                />
                
                <Input
                  id="chainId"
                  label="EVM Chain ID"
                  value={evmChainId || ""}
                  disabled={true}
                  placeholder="Detected EVM chain ID"
                />
                
                {chainId && (
                  <Input
                    id="avalancheChainId"
                    label="Avalanche Chain ID (base58)"
                    value={chainId}
                    disabled={true}
                  />
                )}
                
                <Input
                  id="name"
                  label="Coin Name (Symbol)"
                  value={name}
                  onChange={setName}
                  placeholder="MYC"
                />
                
                <Select
                  label="Is Testnet"
                  value={isTestnet ? "Yes" : "No"}
                  onChange={(value) => setIsTestnet(value === "Yes")}
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>
            ) : (
              // Core Wallet tab content
              <div className="space-y-4">
                <Input
                  id="anyChainId"
                  label="Chain ID (EVM number or Avalanche base58 format)"
                  value={anyChainId}
                  onChange={setAnyChainId}
                  placeholder="e.g. 43114 or 2q9e4r6Mu3U68nU1fYjgbR6JvwrRx36CohpAX5UQxse55x1Q5"
                  error={localError}
                />
                
                {evmChainId > 0 && (
                  <>
                    {walletChainId === evmChainId ? (
                      <Button onClick={fetchFromWallet}>
                        Fetch from wallet
                      </Button>
                    ) : (
                      <Button onClick={() => switchToChain(evmChainId)}>
                        Switch to chain {evmChainId}
                      </Button>
                    )}

                    <Input
                      id="cw-coinName"
                      label="Coin Name"
                      value={coinName}
                      onChange={setCoinName}
                    />
                    
                    <Select
                      label="Is Testnet"
                      value={isTestnet ? "Yes" : "No"}
                      onChange={(value) => setIsTestnet(value === "Yes")}
                      options={[
                        { label: "Yes", value: "Yes" },
                        { label: "No", value: "No" },
                      ]}
                    />
                  </>
                )}
              </div>
            )}
          </Tabs>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              className="bg-black hover:bg-zinc-800 text-white"
              disabled={isAddingChain || (activeTab === "CORE_WALLET" && evmChainId <= 0)}
            >
              {isAddingChain ? 'Adding...' : 'Add Chain'}
            </Button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 text-zinc-500 hover:text-black dark:hover:text-white p-1 rounded-full"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Helper function to fetch both EVM and Avalanche Chain IDs from an RPC URL
async function fetchChainId(rpcUrl: string): Promise<{ ethereumChainId: number, avalancheChainId: string }> {
  try {
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });
    const WARP_PRECOMPILE_ADDRESS = "0x0200000000000000000000000000000000000005";

    // Get the Ethereum chain ID first
    const ethereumChainId = await publicClient.getChainId();

    // Create an interface for the Warp precompile
    const warpAbi = [
      {
        name: "getBlockchainID",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "blockchainID", type: "bytes32" }]
      }
    ] as const;

    // Call the getBlockchainID function
    const blockchainIDHex = await publicClient.readContract({
      address: WARP_PRECOMPILE_ADDRESS,
      abi: warpAbi,
      functionName: "getBlockchainID",
    });

    const chainIdBytes = utils.hexToBuffer(blockchainIDHex);
    const avalancheChainId = utils.base58check.encode(chainIdBytes);

    return { ethereumChainId, avalancheChainId };
  } catch (error) {
    console.error("Failed to fetch chain ID:", error);
    throw error;
  }
} 