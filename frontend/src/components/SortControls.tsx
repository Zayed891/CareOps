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
            <span className="text-sm text-text-muted">Sort by:</span>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortOrder)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 bg-surface-2 text-text-primary border border-white/[0.08] focus:ring-2 focus:ring-amber-500/40 sm:text-sm sm:leading-6"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-text-muted hover:text-text-primary bg-surface-2 border border-white/[0.08] rounded-md transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
                {sortOrder === 'asc' ? <ArrowDownAZ size={20} /> : <ArrowUpAZ size={20} />}
            </button>
        </div>
    );
};

export default SortControls;
