import React, { useState } from 'react';
import { type FormTemplate, type FormField, type SubmitFormIn } from '../../types/form';
import { formService } from '../../services/formService';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FormRendererProps {
    template: FormTemplate;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ template, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic client-side validation for required fields
        const missingFields = template.fields
            .filter(f => f.required && (formData[f.id] === undefined || formData[f.id] === ''))
            .map(f => f.label);

        if (missingFields.length > 0) {
            setError(`Please fill in required fields: ${missingFields.join(', ')}`);
            setLoading(false);
            return;
        }

        try {
            const submissionData: SubmitFormIn = {
                templateId: template.id,
                data: formData
            };
            await formService.submitForm(submissionData);
            setSuccess(true);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-green-900">Form Submitted!</h3>
                <p className="text-green-600 mb-6">Your response has been recorded successfully.</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => {
                            setSuccess(false);
                            setFormData({});
                        }}
                        className="btn-secondary"
                    >
                        Submit Another
                    </button>
                    {onCancel && (
                        <button onClick={onCancel} className="btn-primary">
                            Close
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                {template.description && (
                    <p className="mt-2 text-gray-600">{template.description}</p>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-6">
                {template.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {renderFieldInput(field, formData[field.id], (val) => handleInputChange(field.id, val))}
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Form'}
                </button>
            </div>
        </form>
    );
};

const renderFieldInput = (field: FormField, value: any, onChange: (val: any) => void) => {
    const commonClasses = "input w-full";

    switch (field.type) {
        case 'textarea':
            return (
                <textarea
                    className={`${commonClasses} h-24 resize-none`}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={field.required}
                />
            );
        case 'checkbox':
            return (
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-5 w-5"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                    <span className="text-gray-600 text-sm">Yes</span>
                </div>
            );
        case 'select':
            return (
                <select
                    className={commonClasses}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={field.required}
                >
                    <option value="">Select an option...</option>
                    {field.options?.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        case 'date':
            return (
                <input
                    type="date"
                    className={commonClasses}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={field.required}
                />
            );
        case 'number':
            return (
                <input
                    type="number"
                    className={commonClasses}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={field.required}
                />
            );
        default: // text
            return (
                <input
                    type="text"
                    className={commonClasses}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={field.required}
                />
            );
    }
};

export default FormRenderer;
