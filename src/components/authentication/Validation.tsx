import { Check, X } from 'lucide-react';

const ValidationItem = ({ condition, text }: { condition: boolean, text: string }) => (
    <div className="flex items-center space-x-2 text-sm">

        {condition ? (
            <Check size={16} className="text-green-500" />
        ) : (
            <X size={16} className="text-red-500" />
        )}
        <span className={condition ? "text-green-600" : "text-red-500"}>{text}</span>

    </div>
);

export default ValidationItem