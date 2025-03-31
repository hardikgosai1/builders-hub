"use client";

import ToolHeader from "../components/ToolHeader";


export default function L1Launcher() {
    return <>
        <div className="container mx-auto max-w-6xl p-8 ">
            <ToolHeader
                title="L1 Launcher"
                duration="30 min"
                description="Launch your self-hosted Testnet or Mainnet L1 on your own infrastructure"
                githubDir="L1Launcher"
                issuePath="/tools/l1-launcher"
                issueTitle="Update L1 Launcher Tool Information"
            />
            <h1>L1 Launcher</h1>
        </div>
    </>
}
