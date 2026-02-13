import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FormList from './FormList';
import FormBuilder from './FormBuilder';
import FormRenderer from './FormRenderer';
import FormSubmissionList from './FormSubmissionList';
import { type FormTemplate } from '../../types/form';

type ViewMode = 'list' | 'render' | 'submissions';

const FormsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

    // Form builder modal state
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleFillForm = (template: FormTemplate) => {
        setSelectedTemplate(template);
        setViewMode('render');
    };

    const handleViewSubmissions = (template: FormTemplate) => {
        setSelectedTemplate(template);
        setViewMode('submissions');
    };

    const handleBack = () => {
        setSelectedTemplate(null);
        setViewMode('list');
    };

    const handleNewForm = () => {
        setEditingTemplate(null);
        setIsBuilderOpen(true);
    };

    const handleEditForm = (template: FormTemplate) => {
        setEditingTemplate(template);
        setIsBuilderOpen(true);
    };

    const handleBuilderSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (viewMode === 'render' && selectedTemplate) {
        return (
            <div className="max-w-3xl mx-auto py-8">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Forms
                </button>

                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                    <FormRenderer
                        template={selectedTemplate}
                        onCancel={handleBack}
                        onSuccess={() => {
                            // Optionally redirect or just stay on success screen
                        }}
                    />
                </div>
            </div>
        );
    }

    if (viewMode === 'submissions' && selectedTemplate) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h1>
                            <p className="text-gray-500">Submissions</p>
                        </div>
                    </div>
                </div>

                <FormSubmissionList templateId={selectedTemplate.id} />
            </div>
        );
    }

    return (
        <>
            <FormList
                key={refreshTrigger}
                onFillForm={handleFillForm}
                onViewSubmissions={handleViewSubmissions}
                onNewForm={handleNewForm}
                onEditForm={handleEditForm}
            />
            <FormBuilder
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                onSuccess={handleBuilderSuccess}
                initialData={editingTemplate}
            />
        </>
    );
};

export default FormsPage;
