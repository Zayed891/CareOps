import React, { useState, useEffect } from 'react';
import { Plus, FileText, Edit2, Trash2, Search, Copy, ExternalLink } from 'lucide-react';
import { formService } from '../../services/formService';
import { type FormTemplate } from '../../types/form';

import Pagination from '../../components/Pagination';
import SortControls, { type SortOption } from '../../components/SortControls';
import ConfirmModal from '../../components/ConfirmModal';

interface FormListProps {
    onFillForm?: (template: FormTemplate) => void;
    onViewSubmissions?: (template: FormTemplate) => void;
    onNewForm?: () => void;
    onEditForm?: (template: FormTemplate) => void;
}

const FormList: React.FC<FormListProps> = ({ onFillForm, onViewSubmissions, onNewForm, onEditForm }) => {
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formToDelete, setFormToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Sorting state
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortOptions: SortOption[] = [
        { label: 'Date Created', value: 'createdAt' },
        { label: 'Name', value: 'name' },
        { label: 'Status', value: 'isActive' }
    ];

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                sortBy,
                sortOrder
            };
            const response = await formService.getAllTemplates(params);
            setTemplates(response.data);
            setTotalPages(response.meta.totalPages);
            setTotalItems(response.meta.total);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [currentPage, sortBy, sortOrder]);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFormToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!formToDelete) return;
        try {
            setDeleting(true);
            await formService.deleteTemplate(formToDelete);
            fetchTemplates();
            setDeleteModalOpen(false);
            setFormToDelete(null);
        } catch (error) {
            console.error('Failed to delete template:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleCopyLink = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/f/${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePreview = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/f/${id}`, '_blank');
    };

    // Client-side filtering for current page
    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Forms</h1>
                    <p className="section-description">Create and manage form templates</p>
                </div>
                <button
                    onClick={() => onNewForm?.()}
                    className="btn-primary flex items-center justify-center"
                >
                    <Plus size={20} className="mr-2" />
                    New Form
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SortControls
                    options={sortOptions}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(field, order) => {
                        setSortBy(field);
                        setSortOrder(order);
                    }}
                />
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search forms..."
                        className="input pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 bg-surface-0 rounded-lg">
                    <p className="text-text-muted">No forms found. Create your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="card-interactive"
                            onClick={() => onViewSubmissions?.(template)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-amber-900/30 rounded-lg text-amber-400">
                                    <FileText size={24} />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditForm?.(template);
                                        }}
                                        className="p-2 text-text-muted hover:text-amber-400 hover:bg-amber-900/30 rounded-full"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(template.id, e)}
                                        className="p-2 text-text-muted hover:text-error-500 hover:bg-error-50 rounded-full"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">{template.name}</h3>
                            <p className="text-text-muted text-sm mb-3 line-clamp-2">
                                {template.description || 'No description provided.'}
                            </p>

                            {/* Public Link */}
                            <div className="bg-surface-0 rounded-lg p-2 mb-3 flex items-center gap-2">
                                <code className="text-xs text-text-secondary truncate flex-1" title={`${window.location.origin}/f/${template.id}`}>
                                    {window.location.origin}/f/{template.id}
                                </code>
                            </div>
                            <div className="space-y-2 mt-auto">
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => handleCopyLink(template.id, e)}
                                        className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center"
                                        title="Copy public link"
                                    >
                                        <Copy size={16} className="mr-1" />
                                        {copiedId === template.id ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button
                                        onClick={(e) => handlePreview(template.id, e)}
                                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                                        title="Preview form"
                                    >
                                        <ExternalLink size={16} className="mr-1" />
                                        Preview
                                    </button>
                                </div>
                                {(onFillForm || onViewSubmissions) && (
                                    <div className="flex gap-2">
                                        {onFillForm && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onFillForm(template);
                                                }}
                                                className="btn-secondary text-sm flex-1"
                                            >
                                                Fill Form
                                            </button>
                                        )}
                                        {onViewSubmissions && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewSubmissions(template);
                                                }}
                                                className="btn-secondary text-sm flex-1"
                                            >
                                                Responses
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                    }
                </div >
            )}

            {
                !loading && filteredTemplates.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )
            }

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setFormToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Form Template"
                message="Are you sure you want to delete this form template? This action cannot be undone and will remove all associated form submissions."
                confirmText="Delete Form"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div >
    );
};

export default FormList;
