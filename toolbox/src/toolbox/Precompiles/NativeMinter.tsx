"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "../../lib/walletStore";
import { useViemChainStore } from "../toolboxStore";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Container } from "../components/Container";
import { ResultField } from "../components/ResultField";
import { EVMAddressInput } from "../components/EVMAddressInput";
import nativeMinterAbi from "../../../contracts/precompiles/NativeMinter.json";
import { AllowlistComponent } from "../components/AllowListComponents";

// Default Native Minter address
const DEFAULT_NATIVE_MINTER_ADDRESS =
  "0x0200000000000000000000000000000000000001";

interface ActiveRulesResponse {
  result?: {
    precompiles?: {
      contractNativeMinterConfig?: {
        timestamp: number;
      };
    };
  };
}

export default function NativeMinter() {
  const { coreWalletClient, publicClient, walletEVMAddress } = useWalletStore();
  const viemChain = useViemChainStore();
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isPrecompileActive, setIsPrecompileActive] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked || isChecking || !viemChain?.rpcUrls?.default?.http?.[0]) {
      return;
    }

    async function checkPrecompileStatus() {
      try {
        setIsChecking(true);
        if (!viemChain) {
          throw new Error('Chain not available');
        }
        const rpcUrl = viemChain.rpcUrls.default.http[0];

        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getActiveRulesAt",
            params: [],
            id: 1
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as ActiveRulesResponse;
        setIsPrecompileActive(data?.result?.precompiles?.contractNativeMinterConfig?.timestamp !== undefined);
      } catch (error) {
        setIsPrecompileActive(false);
      } finally {
        setIsChecking(false);
        setHasChecked(true);
      }
    }

    checkPrecompileStatus();
  }, [viemChain, hasChecked, isChecking]);

  if (isChecking) {
    return <div>Checking precompile availability...</div>;
  }

  if (!isPrecompileActive) {
    return <div>The Native Minter precompile is not available on this chain.</div>;
  }

  const handleMint = async () => {
    if (!coreWalletClient) throw new Error("Wallet client not found");

    setIsMinting(true);

    try {
      // Convert amount to Wei
      const amountInWei = BigInt(amount) * BigInt(10 ** 18);

      // Call the mintNativeCoin function using the contract ABI
      const hash = await coreWalletClient.writeContract({
        address: DEFAULT_NATIVE_MINTER_ADDRESS as `0x${string}`,
        abi: nativeMinterAbi.abi,
        functionName: "mintNativeCoin",
        args: [recipient, amountInWei],
        account: walletEVMAddress as `0x${string}`,
        chain: viemChain,
        gas: BigInt(1_000_000),
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        setTxHash(hash);
      } else {
        throw new Error("Transaction failed");
      }
    } finally {
      setIsMinting(false);
    }
  };

  const isValidAmount = amount && Number(amount) > 0;
  const canMint = Boolean(recipient && isValidAmount && walletEVMAddress && coreWalletClient && !isMinting);

  return (
    <div className="space-y-6">
      <Container
        title="Mint Native Tokens"
        description="This will mint native tokens to the specified address."
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <EVMAddressInput
              label="Recipient Address"
              value={recipient}
              onChange={setRecipient}
              disabled={isMinting}
            />
            <Input
              label="Amount"
              value={amount}
              onChange={(value) => setAmount(value)}
              type="number"
              min="0"
              step="0.000000000000000001"
              disabled={isMinting}
            />
          </div>

          {txHash && (
            <ResultField
              label="Transaction Successful"
              value={txHash}
              showCheck={true}
            />
          )}

          <Button
            variant="primary"
            onClick={handleMint}
            loading={isMinting}
            disabled={!canMint}
          >
            {!walletEVMAddress
              ? "Connect Wallet to Mint"
              : "Mint Native Tokens"}
          </Button>
        </div>
      </Container>

      <div className="w-full">
        <AllowlistComponent
          precompileAddress={DEFAULT_NATIVE_MINTER_ADDRESS}
          precompileType="Minter"
        />
      </div>
    </div>
  );
}
