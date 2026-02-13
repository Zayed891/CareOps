import React from 'react';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

export interface SortOption {
    label: string;
    value: string;
}

interface SortControlsProps {
    options: SortOption[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const SortControls: React.FC<SortControlsProps> = ({
    options,
    sortBy,
    sortOrder,
    onSortChange,
}) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortOrder)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
                {sortOrder === 'asc' ? <ArrowDownAZ size={20} /> : <ArrowUpAZ size={20} />}
            </button>
        </div>
    );
};

export default SortControls;
