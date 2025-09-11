"use client";

import { Suspense } from "react";
import StepFlow, { type StepDefinition } from "@/components/console/step-flow";
import CreateChain from "@/components/toolbox/console/layer-1/create/CreateChain";
import AvalancheGoDockerL1 from "@/components/toolbox/console/layer-1/AvalancheGoDockerL1";
import ConvertToL1 from "@/components/toolbox/console/layer-1/create/ConvertToL1";
import ManagedTestnetNodes from "@/components/toolbox/console/testnet-infra/ManagedTestnetNodes";

function CreateLayer1Flow() {
  const steps: StepDefinition[] = [
    {
      type: "single",
      key: "create-chain",
      title: "Create Chain",
      description: "Create a Subnet and add a blockchain with custom parameters.",
      component: CreateChain,
    },
    {
      type: "branch",
      key: "node-setup",
      title: "Set Up a Node",
      description: "Choose how you want to run your node.",
      options: [
        { key: "l1-node-setup", label: "L1 Node Setup with Docker", component: AvalancheGoDockerL1 },
        { key: "managed-testnet-l1-nodes", label: "Managed Testnet L1 Nodes", component: ManagedTestnetNodes },
      ],
    },
    {
      type: "single",
      key: "convert-to-l1",
      title: "Convert to L1",
      description: "Convert your Subnet to an L1.",
      component: ConvertToL1,
    },
  ];

  return (
    <StepFlow steps={steps} />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateLayer1Flow />
    </Suspense>
  );
}
