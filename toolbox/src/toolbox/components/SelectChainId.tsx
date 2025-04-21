import { Input, type Suggestion } from "../../components/Input";
import { useCreateChainStore } from "../toolboxStore";
import { useMemo } from "react";

export default function InputChainId({ value, onChange, error }: { value: string, onChange: (value: string) => void, error: string | null }) {
    const createChainStorechainID = useCreateChainStore(state => state.chainID);

    const chainIDSuggestions: Suggestion[] = useMemo(() => {
        const result: Suggestion[] = [];

        if (createChainStorechainID) {
            result.push({
                title: createChainStorechainID,
                value: createChainStorechainID,
                description: "From the \"Create Chain\" tool"
            });
        }

        return result;
    }, [createChainStorechainID]);

    return <Input
        label="Chain ID"
        value={value}
        onChange={onChange}
        suggestions={chainIDSuggestions}
        error={error}
    />
}
