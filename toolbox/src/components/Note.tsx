import { cn } from "../lib/utils"; // Assuming you have a utility for class names

type NoteVariant = 'default' | 'success' | 'destructive';

interface NoteProps {
    children: React.ReactNode;
    variant?: NoteVariant;
    className?: string;
}

export const Note = ({ children, variant = 'default', className }: NoteProps) => {
    const variantClasses = {
        default: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
        success: 'border-green-500 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300',
        destructive: 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300',
    };

    return (
        <div className={cn("border-l-4 p-4 rounded-md my-4", variantClasses[variant], className)}>
            <div className="ml-3">
                <div className="text-sm font-medium">
                    {children}
                </div>
            </div>
        </div>
    );
};
