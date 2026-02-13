import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Trash2, MessageCircle, Calendar, FileText } from 'lucide-react';
import { contactService } from '../../services/contactService';
import type { Contact } from '../../types/modules';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';

const ContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const result = await contactService.getAll({ page, limit: 20, search: search || undefined });
            setContacts(result.data);
            setTotalPages(result.meta.totalPages);
        } catch {
            setError('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContacts(); }, [page, search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await contactService.create({
                name: form.name,
                email: form.email || undefined,
                phone: form.phone || undefined,
            });
            setForm({ name: '', email: '', phone: '' });
            setShowForm(false);
            fetchContacts();
        } catch {
            setError('Failed to create contact');
        }
    };

    const handleDeleteClick = (id: string) => {
        setContactToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return;
        try {
            setDeleting(true);
            await contactService.delete(contactToDelete);
            fetchContacts();
            setDeleteModalOpen(false);
            setContactToDelete(null);
        } catch {
            setError('Failed to delete contact');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            <div className="section-header mb-8">
                <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary-600" />
                    <div>
                        <h1 className="section-title">Contacts</h1>
                        <p className="section-description">Manage your customer contact directory</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Contact
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search contacts by name, email, or phone..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">New Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input required placeholder="Name *" value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                        <input type="email" placeholder="Email" value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                        <input placeholder="Phone" value={form.phone}
                            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Save</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            {/* Contacts List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : contacts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No contacts yet. Add your first contact to get started.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {contacts.map(contact => (
                                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-900">{contact.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {contact.email ? (
                                                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{contact.email}</span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {contact.phone ? (
                                                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{contact.phone}</span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1" title="Bookings">
                                                    <Calendar className="h-3.5 w-3.5" />{contact._count?.bookings || 0}
                                                </span>
                                                <span className="flex items-center gap-1" title="Conversations">
                                                    <MessageCircle className="h-3.5 w-3.5" />{contact._count?.conversations || 0}
                                                </span>
                                                <span className="flex items-center gap-1" title="Form Submissions">
                                                    <FileText className="h-3.5 w-3.5" />{contact._count?.formSubmissions || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDeleteClick(contact.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {contacts.map(contact => (
                            <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteClick(contact.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {contact.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{contact.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 border-t border-gray-100 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />{contact._count?.bookings || 0} bookings
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="h-3.5 w-3.5" />{contact._count?.conversations || 0} convos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-3.5 w-3.5" />{contact._count?.formSubmissions || 0} forms
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination currentPage={page} totalPages={totalPages} totalItems={totalPages * 20} itemsPerPage={20} onPageChange={setPage} />
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setContactToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Contact"
                message="Are you sure you want to delete this contact? This action cannot be undone and will remove all associated bookings, conversations, and form submissions."
                confirmText="Delete Contact"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};

export default ContactsPage;
