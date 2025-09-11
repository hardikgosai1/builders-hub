"use client";

import StepFlow, { type StepDefinition } from "../../../../components/console/step-flow";

import TeleporterMessenger from "../../../../components/console/tools/icm/setup/TeleporterMessenger";
import TeleporterRegistry from "../../../../components/console/tools/icm/setup/TeleporterRegistry";
import ICMRelayer from "../../../../components/console/tools/icm/setup/ICMRelayer";

export default function Page() {
  const steps: StepDefinition[] = [
    {
      type: "single",
      key: "icm-messenger-deployment",
      title: "Deploy ICM Messenger",
      component: TeleporterMessenger,
    },
    {
      type: "single",
      key: "icm-registry-deployment",
      title: "Deploy ICM Registry",
      component: TeleporterRegistry,
    },
    {
      type: "single",
      key: "icm-relayer",
      title: "Setup ICM Relayer",
      component: ICMRelayer,
    },
  ];

  return (
    <StepFlow steps={steps} />
  );
}


