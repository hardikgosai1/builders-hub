export const Note = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="mx-auto my-6">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-md shadow">
                <div className="ml-3">
                    <p className="text-sm font-medium text-blue-700">
                        {children}
                    </p>
                </div>
            </div>
        </div>
    );
};
