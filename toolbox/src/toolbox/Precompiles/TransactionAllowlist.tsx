"use client";

import { useState, useEffect } from "react";
import { AllowlistComponent } from "../components/AllowListComponents";
import { useViemChainStore } from "../toolboxStore";
import { getActiveRulesAt } from "../../coreViem/methods/getActiveRulesAt";

// Default Transaction AllowList address
const DEFAULT_TRANSACTION_ALLOWLIST_ADDRESS =
  "0x0200000000000000000000000000000000000002";

export default function TransactionAllowlist() {
  const viemChain = useViemChainStore();
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

        const data = await getActiveRulesAt(rpcUrl);
        setIsPrecompileActive(data?.result?.precompiles?.txAllowListConfig?.timestamp !== undefined);
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
