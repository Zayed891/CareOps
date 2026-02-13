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
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            {initialData ? 'Edit Form Template' : 'Create Form Template'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:h-[70vh]">
                        {/* Form Settings Sidebar */}
                        <div className="md:w-1/3 md:border-r border-gray-200 p-6 overflow-y-auto bg-gray-50 border-b md:border-b-0">
                            <h4 className="font-medium text-gray-900 mb-4">Form Settings</h4>
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
                        <div className="flex-1 p-6 overflow-y-auto bg-white max-h-[50vh] md:max-h-none">
                            <h4 className="font-medium text-gray-900 mb-4">Form Fields</h4>

                            <div className="space-y-4 mb-6">
                                {fields.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500">No fields added yet.</p>
                                        <button
                                            onClick={addField}
                                            className="mt-2 text-primary-600 font-medium hover:text-primary-700"
                                        >
                                            Add your first question
                                        </button>
                                    </div>
                                ) : (
                                    fields.map((field) => (
                                        <div key={field.id} className="card p-4 relative group border border-gray-200 hover:border-primary-200 transition-colors">
                                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => removeField(field.id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="label text-xs uppercase text-gray-400">Question Label</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        className="input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label text-xs uppercase text-gray-400">Response Type</label>
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
                                                    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        />
                                                        <span>Required Field</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Options for Select/Dropdown type */}
                                            {field.type === 'select' && (
                                                <div className="mt-4">
                                                    <label className="label text-xs uppercase text-gray-400">Options (comma separated)</label>
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
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center font-medium"
                            >
                                <Plus size={20} className="mr-2" />
                                Add Question
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
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
