import { BookOpen, Terminal, Flag, Settings, Server } from 'lucide-react'
import { StepGroupListType, StepListType } from './components/Steps'
import { lazy } from 'react'


export const stepGroups: StepGroupListType = {
    "welcome": {
        title: "Welcome",
        icon: BookOpen
    },
    "configure": {
        title: "Configure",
        icon: Settings
    },
    "launch-l1": {
        title: "Launch your L1",
        icon: Server
    },
    "initialize": {
        title: "Initialize",
        icon: Terminal
    },
    "whats-next": {
        title: "What's next?",
        icon: Flag
    },
}

const LazyWelcome = lazy(() => import('./01_Welcome/Welcome'))

export const stepList: StepListType = {
    "welcome": {
        title: "Welcome",
        component: <LazyWelcome />,
        group: "welcome",
    },
    "chain-parameters": {
        title: "Chain Parameters",
        component: <div>Chain Parameters</div>,
        group: "configure",
    },
    "tokenomics": {
        title: "Tokenomics",
        component: <div>Tokenomics</div>,
        group: "configure",
    },
    "permissions": {
        title: "Permissions",
        component: <div>Permissions</div>,
        group: "configure",
    },
    "genesis": {
        title: "Create genesis",
        component: <div>Genesis</div>,
        group: "configure",
    },
    "prepare-validators": {
        title: "Prepare Validators",
        component: <div>Prepare Validators</div>,
        group: "launch-l1",
    },
    "fund-p-chain-wallet": {
        title: "Fund P-chain wallet",
        component: <div>Fund P-chain wallet</div>,
        group: "launch-l1",
    },
    "create-chain": {
        title: "Create chain",
        component: <div>Create chain</div>,
        group: "launch-l1",
    },
    "launch-validators": {
        title: "Launch validators",
        component: <div>Launch validators</div>,
        group: "launch-l1",
    },
    "convert-to-l1": {
        title: "Convert to L1",
        component: <div>Convert to L1</div>,
        group: "launch-l1",
    },
    "launch-rpc-node": {
        title: "Launch an RPC node",
        component: <div>Launch an RPC node</div>,
        group: "launch-l1",
    },
    "open-rpc-port": {
        title: "Open RPC port",
        component: <div>Open RPC port</div>,
        group: "launch-l1",
    },
    "add-to-wallet": {
        title: "Add to wallet",
        component: <div>Add to wallet</div>,
        group: "initialize",
    },
    "deploy-contracts": {
        title: "Deploy contracts",
        component: <div>Deploy contracts</div>,
        group: "initialize",
    },
    "initialize-validator-manager": {
        title: "Initialize validator manager",
        component: <div>Initialize validator manager</div>,
        group: "initialize",
    },
    "whats-next": {
        title: "What's next?",
        component: <div>What's next?</div>,
        group: "whats-next",
    }
}

