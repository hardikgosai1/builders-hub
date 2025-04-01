import { BookOpen, Terminal, Flag, Settings, Server } from 'lucide-react'
import { StepGroupListType, StepListType } from '../components/Steps'
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

//Welcome
const LazyWelcome = lazy(() => import('./01_Welcome/Welcome'))

//Configure
const LazyChainParameters = lazy(() => import('./02_Configure/ChainParameters'))
const LazyTokenomics = lazy(() => import('./02_Configure/Tokenomics'))
const LazyPermissions = lazy(() => import('./02_Configure/Permissions'))
const LazyGenesis = lazy(() => import('./02_Configure/Genesis'))

//Launch
const LazyPrepareValidators = lazy(() => import('./03_Launch/PrepareValidators'))
const LazyFundPChainWallet = lazy(() => import('./03_Launch/FundPChainWallet'))
const LazyCreateChain = () => <div>TODO: Create chain</div>
const LazyLaunchValidators = () => <div>TODO: Launch validators</div>
const LazyConvertToL1 = () => <div>TODO: Convert to L1</div>
const LazyLaunchRpcNode = () => <div>TODO: Launch RPC node</div>
const LazyOpenRpcPort = () => <div>TODO: Open RPC port</div>

//Initialize
const LazyAddToWallet = () => <div>TODO: Add to wallet</div>
const LazyDeployContracts = () => <div>TODO: Deploy contracts</div>
const LazyInitializeValidatorManager = () => <div>TODO: Initialize validator manager</div>

//What's next
const LazyWhatsNext = () => <div>TODO: What's next?</div>


export const stepList: StepListType = {
    "welcome": {
        title: "Welcome",
        component: <LazyWelcome />,
        group: "welcome",
    },
    "chain-parameters": {
        title: "Chain Parameters",
        component: <LazyChainParameters />,
        group: "configure",
    },
    "tokenomics": {
        title: "Tokenomics",
        component: <LazyTokenomics />,
        group: "configure",
    },
    "permissions": {
        title: "Permissions",
        component: <LazyPermissions />,
        group: "configure",
    },
    "genesis": {
        title: "Create genesis",
        component: <LazyGenesis />,
        group: "configure",
    },
    "prepare-validators": {
        title: "Prepare Validators",
        component: <LazyPrepareValidators />,
        group: "launch-l1",
    },
    "fund-p-chain-wallet": {
        title: "Fund P-chain wallet",
        component: <LazyFundPChainWallet />,
        group: "launch-l1",
    },
    "create-chain": {
        title: "Create chain",
        component: <LazyCreateChain />,
        group: "launch-l1",
    },
    "launch-validators": {
        title: "Launch validators",
        component: <LazyLaunchValidators />,
        group: "launch-l1",
    },
    "convert-to-l1": {
        title: "Convert to L1",
        component: <LazyConvertToL1 />,
        group: "launch-l1",
    },
    "launch-rpc-node": {
        title: "Launch an RPC node",
        component: <LazyLaunchRpcNode />,
        group: "launch-l1",
    },
    "open-rpc-port": {
        title: "Open RPC port",
        component: <LazyOpenRpcPort />,
        group: "launch-l1",
    },
    "add-to-wallet": {
        title: "Add to wallet",
        component: <LazyAddToWallet />,
        group: "initialize",
    },
    "deploy-contracts": {
        title: "Deploy contracts",
        component: <LazyDeployContracts />,
        group: "initialize",
    },
    "initialize-validator-manager": {
        title: "Initialize validator manager",
        component: <LazyInitializeValidatorManager />,
        group: "initialize",
    },
    "whats-next": {
        title: "What's next?",
        component: <LazyWhatsNext />,
        group: "whats-next",
    }
}

