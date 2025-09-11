"use client";

import { Suspense } from "react";
import StepFlow, { type StepDefinition } from "../../../../components/console/step-flow";

import DeployICMDemo from "../../../../components/toolbox/console/icm/test-connection/DeployICMDemo";
import SendICMMessage from "../../../../components/toolbox/console/icm/test-connection/SendICMMessage";

function ICMTestConnectionFlow() {
  const steps: StepDefinition[] = [
    {
      type: "single",
      key: "deploy-icm-demo",
      title: "Deploy ICM Demo",
      component: DeployICMDemo,
    },
    {
      type: "single",
      key: "send-icm-message",
      title: "Send ICM Message",
      component: SendICMMessage,
    },
  ];

  return (
    <StepFlow steps={steps} />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ICMTestConnectionFlow />
    </Suspense>
  );
}


