import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { type FormTemplate, type FormField, type FieldType, type CreateFormTemplateIn } from '../../types/form';
import { formService } from '../../services/formService';

interface FormBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: FormTemplate | null;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description || '');
                setFields(initialData.fields || []);
            } else {
                setName('');
                setDescription('');
                setFields([]);
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const addField = () => {
        const newField: FormField = {
            id: Date.now().toString(),
            label: 'New Question',
            type: 'text',
            required: false,
            options: []
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData: CreateFormTemplateIn = {
                name,
                description,
                fields
            };

            if (initialData) {
                await formService.updateTemplate(initialData.id, formData);
            } else {
                await formService.createTemplate(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save form template');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-surface-00 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-surface-1 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.24]">
                        <h3 className="text-lg font-medium text-text-primary">
                            {initialData ? 'Edit Form Template' : 'Create Form Template'}
                        </h3>
                        <button onClick={onClose} className="text-text-muted hover:text-text-muted">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 bg-error-50 border border-error-500/20 text-error-500 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:h-[70vh]">
                        {/* Form Settings Sidebar */}
                        <div className="md:w-1/3 md:border-r border-white/[0.24] p-6 overflow-y-auto bg-surface-0 border-b md:border-b-0">
                            <h4 className="font-medium text-text-primary mb-4">Form Settings</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Form Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input"
                                        placeholder="e.g. Patient Intake"
                                    />
                                </div>
                                <div>
                                    <label className="label">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="input h-24 resize-none"
                                        placeholder="Form instructions..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Field Builder Area */}
                        <div className="flex-1 p-6 overflow-y-auto bg-surface-1 max-h-[50vh] md:max-h-none">
                            <h4 className="font-medium text-text-primary mb-4">Form Fields</h4>

                            <div className="space-y-4 mb-6">
                                {fields.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-white/[0.24] rounded-lg">
                                        <p className="text-text-muted">No fields added yet.</p>
                                        <button
                                            onClick={addField}
                                            className="mt-2 text-amber-400 font-medium hover:text-amber-300"
                                        >
                                            Add your first question
                                        </button>
                                    </div>
                                ) : (
                                    fields.map((field) => (
                                        <div key={field.id} className="card p-4 relative group border border-white/[0.24] hover:border-primary-200 transition-colors">
                                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => removeField(field.id)}
                                                    className="text-text-muted hover:text-red-500"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="label text-xs uppercase text-text-muted">Question Label</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        className="input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label text-xs uppercase text-text-muted">Response Type</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                                                        className="input"
                                                    >
                                                        <option value="text">Short Text</option>
                                                        <option value="textarea">Long Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="date">Date</option>
                                                        <option value="checkbox">Checkbox</option>
                                                        <option value="select">Dropdown</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center pt-6">
                                                    <label className="flex items-center space-x-2 text-sm text-text-secondary cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                            className="rounded border-white/[0.16] text-amber-400 focus:ring-amber-500/40"
                                                        />
                                                        <span>Required Field</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Options for Select/Dropdown type */}
                                            {field.type === 'select' && (
                                                <div className="mt-4">
                                                    <label className="label text-xs uppercase text-text-muted">Options (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={field.options?.join(', ') || ''}
                                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                        className="input"
                                                        placeholder="Option 1, Option 2, Option 3"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={addField}
                                className="w-full py-3 border-2 border-dashed border-white/[0.16] rounded-lg text-text-muted hover:border-amber-500 hover:text-amber-400 transition-colors flex items-center justify-center font-medium"
                            >
                                <Plus size={20} className="mr-2" />
                                Add Question
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-surface-0 border-t border-white/[0.24] flex justify-end space-x-3">
                        <button onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !name}
                            className="btn-primary"
                        >
                            {loading ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
