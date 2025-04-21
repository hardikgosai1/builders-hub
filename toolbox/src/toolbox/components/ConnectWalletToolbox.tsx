import { ConnectWallet } from "../../components/ConnectWallet";
import { useL1ListStore } from "../toolboxStore";
import { Select } from "./Select";

export const ConnectWalletToolbox = ({ children, required, chainRequired }: { children: React.ReactNode, required: boolean, chainRequired: boolean }) => {
    return (
        <ConnectWallet required={required} extraElements={chainRequired ? <ChainSelector /> : null} >
            {children}
        </ConnectWallet>
    );
};

const ChainSelector = () => {
    const { l1List, lastSelectedL1, setLastSelectedL1 } = useL1ListStore(state => state);


    return (
        <div className="w-48">
            <Select
                label=""
                value={lastSelectedL1}
                onChange={(value) => setLastSelectedL1(value as string)}
                options={[...l1List.map(l1 => ({ label: l1.id, value: l1.id })), { label: "Add New Chain ID...", value: "add-new", disabled: true }]}
            />
        </div>
    );
}
