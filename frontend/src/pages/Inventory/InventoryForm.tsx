import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type CreateInventoryItemIn, type InventoryItem } from '../../types/inventory';
import { inventoryService } from '../../services/inventoryService';

interface InventoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: InventoryItem | null;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData
}) => {
    const [formData, setFormData] = useState<CreateInventoryItemIn>({
        name: '',
        description: '',
        quantity: 0,
        unit: 'pcs',
        reorderLevel: 0,
        category: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || '',
                quantity: initialData.quantity,
                unit: initialData.unit,
                reorderLevel: initialData.reorderLevel || 0,
                category: initialData.category || '',
            });
        } else {
            // Reset form for new item
            setFormData({
                name: '',
                description: '',
                quantity: 0,
                unit: 'pcs',
                reorderLevel: 0,
                category: '',
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (initialData) {
                await inventoryService.update(initialData.id, formData);
            } else {
                await inventoryService.create(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save inventory item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-surface-00 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-surface-1 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.24]">
                        <h3 className="text-lg font-medium text-text-primary">
                            {initialData ? 'Edit Item' : 'Add New Item'}
                        </h3>
                        <button onClick={onClose} className="text-text-muted hover:text-text-muted">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-error-50 text-error-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">Item Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="e.g. Surgical Masks"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input"
                                    placeholder="e.g. PPE"
                                />
                            </div>
                            <div>
                                <label className="label">Unit</label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="input"
                                >
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="box">Box</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="l">Liter (l)</option>
                                    <option value="m">Meter (m)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Current Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">Low Stock Threshold</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input h-24 resize-none"
                                placeholder="Optional description..."
                            />
                        </div>

                        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Saving...' : 'Save Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InventoryForm;
