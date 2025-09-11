"use client";

import { Suspense } from "react";
import StepFlow, { type StepDefinition } from "../../../../components/console/step-flow";
import ToolboxConsoleWrapper from "../../../../components/toolbox/components/ToolboxConsoleWrapper";

import AddCollateral from "../../../../components/toolbox/console/ictt/setup/AddCollateral";
import TestSend from "../../../../components/toolbox/console/ictt/token-transfer/TestSend";

function TokenTransferFlow() {
  const steps: StepDefinition[] = [
    { type: "single", key: "add-collateral", title: "Add Collateral", component: AddCollateral },
    { type: "single", key: "test-send", title: "Test Send", component: TestSend },
  ];

  return (
    <ToolboxConsoleWrapper>
      <StepFlow steps={steps} />
    </ToolboxConsoleWrapper>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TokenTransferFlow />
    </Suspense>
  );
}


