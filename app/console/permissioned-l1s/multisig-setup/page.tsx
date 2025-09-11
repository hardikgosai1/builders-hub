"use client";

import { Suspense } from "react";
import StepFlow, { type StepDefinition } from "../../../../components/console/step-flow";

import DeployPoAManager from "../../../../components/toolbox/console/permissioned-l1s/multisig-setup/DeployPoAManager";
import TransferOwnership from "../../../../components/toolbox/console/permissioned-l1s/multisig-setup/TransferOwnership";

import ReadContract from "../../../../components/toolbox/console/permissioned-l1s/validator-manager-setup/ReadContract";

function MultisigSetupFlow() {
  const steps: StepDefinition[] = [
    { type: "single", key: "deploy-poa", title: "Deploy POA Manager", component: DeployPoAManager },
    { type: "single", key: "transfer-ownership", title: "Transfer Ownership", component: TransferOwnership },
    { type: "single", key: "read-contract", title: "Read Contract", component: ReadContract },
  ];

  return (
    <StepFlow steps={steps} />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MultisigSetupFlow />
    </Suspense>
  );
}

