import SelectChain from "./components/SelectChain";

export default function ChainSelector() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Chain Operations</h1>

            <SelectChain>
                <div className="space-y-6">
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Chain Information</h2>
                        <p className="mb-2">Use this panel to view and interact with your selected chain.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a chain from the dropdown above or add a new chain to get started.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Chain Status</h3>
                            <p>View the current status of your chain.</p>
                        </div>

                        <div className="p-6 border rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Chain Operations</h3>
                            <p>Perform operations on your chain.</p>
                        </div>
                    </div>
                </div>
            </SelectChain>
        </div>
    );
} 
