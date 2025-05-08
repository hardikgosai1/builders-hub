"use client";

import { useState, useEffect } from "react";
import { AllowlistComponent } from "../components/AllowListComponents";
import { useViemChainStore } from "../toolboxStore";

// Default Deployer AllowList address
const DEFAULT_DEPLOYER_ALLOWLIST_ADDRESS =
  "0x0200000000000000000000000000000000000000";

interface ActiveRulesResponse {
  result?: {
    precompiles?: {
      contractDeployerAllowListConfig?: {
        timestamp: number;
      };
    };
  };
}

export default function DeployerAllowlist() {
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
        setIsPrecompileActive(data?.result?.precompiles?.contractDeployerAllowListConfig?.timestamp !== undefined);
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
    return <div>The Deployer Allowlist precompile is not available on this chain.</div>;
  }

  return (
    <div className="space-y-6">
      {isPrecompileActive && (
        <div className="w-full">
          <AllowlistComponent
            precompileAddress={DEFAULT_DEPLOYER_ALLOWLIST_ADDRESS}
            precompileType="Deployer"
          />
        </div>
      )}
    </div>
  );
}
