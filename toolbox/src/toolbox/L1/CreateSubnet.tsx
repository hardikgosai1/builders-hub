"use client";

import { useWalletStore } from "../../stores/walletStore";
import { useCreateChainStore } from "../../stores/createChainStore";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useState } from "react";
import { ResultField } from "../../components/ResultField";
import { Container } from "../../components/Container";

export default function CreateSubnet() {
  const [criticalError, setCriticalError] = useState<Error | null>(null);
  const { setSubnetID, subnetId } = useCreateChainStore()();
  const { coreWalletClient, pChainAddress } = useWalletStore();
  const [isCreating, setIsCreating] = useState(false);

  // Throw critical errors during render
  if (criticalError) {
    throw criticalError;
  }

  async function handleCreateSubnet() {
    setSubnetID("");
    setIsCreating(true);
    try {
      const txID = await coreWalletClient.createSubnet({
        subnetOwners: [pChainAddress]
      });

      setSubnetID(txID);
    } catch (error) {
      setCriticalError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Container
      title="Create Subnet"
      description="This will create a new subnet on the P-Chain."
    >
      <div className="space-y-4">
        <Input
          label="Your P-Chain Address"
          value={pChainAddress}
          disabled={true}
          type="text"
        />
        <Button
          onClick={handleCreateSubnet}
          loading={isCreating}
          variant="primary"
        >
          Create Subnet
        </Button>
      </div>
      {subnetId && (
        <ResultField
          label="Subnet ID"
          value={subnetId}
          showCheck={!!subnetId}
        />
      )}
    </Container>
  );
};
