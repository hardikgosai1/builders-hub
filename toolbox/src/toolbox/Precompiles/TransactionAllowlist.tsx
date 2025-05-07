"use client";

import { useState, useEffect } from "react";
import { AllowlistComponent } from "../components/AllowListComponents";
import { useWalletStore } from "../../lib/walletStore";

// Default Transaction AllowList address
const DEFAULT_TRANSACTION_ALLOWLIST_ADDRESS =
  "0x0200000000000000000000000000000000000002";

interface ActiveRulesResponse {
  result?: {
    precompiles?: {
      txAllowListConfig?: {
        timestamp: number;
      };
    };
  };
}

export default function TransactionAllowlist() {
  const { publicClient } = useWalletStore();
  const [isPrecompileActive, setIsPrecompileActive] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkPrecompileStatus() {
      try {
        setIsChecking(true);
        const response = await publicClient.request({
          method: 'eth_getActiveRulesAt',
          params: [],
        }) as ActiveRulesResponse;

        // Check if the transaction allowlist precompile exists in the response
        const isActive = response?.result?.precompiles?.txAllowListConfig?.timestamp !== undefined;
        setIsPrecompileActive(isActive);
      } catch (error) {
        console.error('Failed to check precompile status:', error);
        setIsPrecompileActive(false);
      } finally {
        setIsChecking(false);
      }
    }

    if (publicClient) {
      checkPrecompileStatus();
    }
  }, [publicClient]);

  if (isChecking) {
    return <div>Checking precompile availability...</div>;
  }

  if (!isPrecompileActive) {
    return <div>The Transaction Allowlist precompile is not available on this chain.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="w-full">
        <AllowlistComponent
          precompileAddress={DEFAULT_TRANSACTION_ALLOWLIST_ADDRESS}
          precompileType="Transaction"
        />
      </div>
    </div>
  );
}
