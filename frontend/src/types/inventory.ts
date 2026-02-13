export interface InventoryItem {
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    quantity: number;
    unit: string;
    reorderLevel: number | null;
    category: string | null;
    createdAt: string;
    updatedAt: string;
    alerts?: InventoryAlert[];
}

export interface InventoryAlert {
    id: string;
    itemId: string;
    threshold: number;
    isActive: boolean;
    notifiedAt: string | null;
    createdAt: string;
}

export interface CreateInventoryItemIn {
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    reorderLevel?: number;
    category?: string;
}

export interface UpdateInventoryItemIn {
    name?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    reorderLevel?: number;
    category?: string;
}

export interface UpdateStockIn {
    quantity?: number;
    adjustment?: number;
}
