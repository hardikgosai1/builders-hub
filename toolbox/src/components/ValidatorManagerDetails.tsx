interface ValidatorManagerDetailsProps {
  validatorManagerAddress: string | null;
  blockchainId: string | null;
  subnetId: string;
  isLoading: boolean;
}

export function ValidatorManagerDetails({
  validatorManagerAddress,
  blockchainId,
  subnetId,
  isLoading
}: ValidatorManagerDetailsProps) {
  if (isLoading) {
    return <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 animate-pulse">Loading L1 details...</p>;
  }

  if (!validatorManagerAddress) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-3 space-y-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Validator Manager Address</div>
          <button 
            onClick={() => copyToClipboard(validatorManagerAddress)}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Copy
          </button>
        </div>
        <div className="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 overflow-auto">{validatorManagerAddress}</div>
      </div>

      {blockchainId && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Blockchain ID</div>
            <button 
              onClick={() => copyToClipboard(blockchainId)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Copy
            </button>
          </div>
          <div className="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 overflow-auto">{blockchainId}</div>
        </div>
      )}

      {blockchainId && subnetId && blockchainId !== subnetId && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-700 dark:text-blue-300 text-xs flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Note: The blockchain ID identifies the blockchain where this L1's validator manager contract is deployed.</span>
        </div>
      )}
    </div>
  );
} 