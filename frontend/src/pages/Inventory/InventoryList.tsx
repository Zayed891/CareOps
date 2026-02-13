import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    AlertTriangle,
    Edit2,
    Trash2
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { type InventoryItem } from '../../types/inventory';
import InventoryForm from './InventoryForm';

import Pagination from '../../components/Pagination';
import SortControls, { type SortOption } from '../../components/SortControls';
import ConfirmModal from '../../components/ConfirmModal';

const InventoryList: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Sorting state
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const sortOptions: SortOption[] = [
        { label: 'Name', value: 'name' },
        { label: 'Stock Level', value: 'quantity' },
        { label: 'Last Updated', value: 'updatedAt' }
    ];

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
                lowStock: showLowStock,
                sortBy,
                sortOrder
            };

            const response = await inventoryService.getAll(params);
            setItems(response.data);
            setTotalPages(response.meta.totalPages);
            setTotalItems(response.meta.total);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [showLowStock, currentPage, sortBy, sortOrder]);

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            setDeleting(true);
            await inventoryService.delete(itemToDelete);
            fetchItems();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Failed to delete item:', error);
        } finally {
            setDeleting(false);
        }
    };

    // Client-side filtering for search on current page
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Inventory</h1>
                    <p className="section-description">Manage stock levels and supplies</p>
                </div>
                <button onClick={handleCreate} className="btn-primary flex items-center justify-center">
                    <Plus size={20} className="mr-2" />
                    Add Item
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search items by name or category..."
                        className="input pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => { setShowLowStock(!showLowStock); setCurrentPage(1); }}
                    className={`btn-secondary flex items-center whitespace-nowrap ${showLowStock ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}`}
                >
                    <AlertTriangle size={18} className="mr-2" />
                    {showLowStock ? 'Showing Low Stock' : 'Show Low Stock'}
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading inventory...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No items found</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isLowStock = item.reorderLevel !== null && item.reorderLevel !== undefined && item.quantity <= item.reorderLevel;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                {item.description && <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>}
                                                {isLowStock && (
                                                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.category || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.quantity}
                                                </div>
                                                <div className="text-xs text-gray-400">Min: {item.reorderLevel || 0}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredItems.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">No items found</p>
                    </div>
                ) : (
                    <>
                        {filteredItems.map((item) => {
                            const isLowStock = item.reorderLevel !== null && item.reorderLevel !== undefined && item.quantity <= item.reorderLevel;
                            return (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                            {item.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                            )}
                                            {item.category && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {item.category}
                                                </span>
                                            )}
                                            {isLowStock && (
                                                <span className="inline-block ml-2 mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                                                    Low Stock
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-3">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 text-xs">Stock:</span>
                                                <span className={`ml-1 font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Min: {item.reorderLevel || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {!loading && filteredItems.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            <InventoryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchItems}
                initialData={editingItem}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Inventory Item"
                message="Are you sure you want to delete this inventory item? This action cannot be undone."
                confirmText="Delete Item"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};

export default InventoryList;
