import React, { useState, useEffect } from 'react';
import { type FormSubmission } from '../../types/form';
import { formService } from '../../services/formService';
import { FileText, ChevronUp, ChevronDown } from 'lucide-react';

import Pagination from '../../components/Pagination';

interface FormSubmissionListProps {
    templateId: string;
}

const FormSubmissionList: React.FC<FormSubmissionListProps> = ({ templateId }) => {
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const params: any = {
                    page: currentPage,
                    limit: itemsPerPage
                };
                const response = await formService.getSubmissions(templateId, params);
                setSubmissions(response.data);
                setTotalPages(response.meta.totalPages);
                setTotalItems(response.meta.total);
            } catch (error) {
                console.error('Failed to fetch submissions:', error);
            } finally {
                setLoading(false);
            }
        };

        if (templateId) {
            fetchSubmissions();
        }
    }, [templateId, currentPage]);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    if (loading) return <div className="text-center py-8">Loading submissions...</div>;

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No submissions yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {submissions.map((submission) => (
                <div key={submission.id} className="card p-4 hover:shadow-md transition-shadow">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleExpand(submission.id)}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    {submission.contact?.name || submission.submittedBy || 'Anonymous User'}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Submitted {new Date(submission.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-400">
                            {expandedIds.has(submission.id) ? (
                                <ChevronUp size={20} />
                            ) : (
                                <ChevronDown size={20} />
                            )}
                        </div>
                    </div>

                    {expandedIds.has(submission.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                            {/* Submission Data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(submission.data).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-md">
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">{key}</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Linked Booking Info */}
                            {submission.booking && (
                                <div className="mt-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
                                    <h5 className="text-sm font-semibold text-indigo-900 mb-2">Linked Appointment</h5>
                                    <p className="text-sm text-indigo-700">
                                        Scheduled for: {new Date(submission.booking.scheduledAt).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-indigo-700">
                                        Status: <span className="font-medium">{submission.booking.status}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default FormSubmissionList;
