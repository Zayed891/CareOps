export type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea';

export interface FormField {
    id: string; // client-side ID for builder
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[]; // for select type
}

export interface FormTemplate {
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    fields: FormField[]; // Stored as JSON in backend
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FormSubmission {
    id: string;
    templateId: string;
    submittedBy: string;
    data: Record<string, any>; // JSON data
    createdAt: string;
    updatedAt: string;
    template?: FormTemplate;
    contact?: {
        id: string;
        name: string;
        email: string;
    };
    booking?: {
        id: string;
        scheduledAt: string;
        status: string;
    };
}

export interface CreateFormTemplateIn {
    name: string;
    description?: string;
    fields: FormField[];
}

export interface UpdateFormTemplateIn {
    name?: string;
    description?: string;
    fields?: FormField[];
    isActive?: boolean;
}

export interface SubmitFormIn {
    templateId: string;
    data: Record<string, any>;
}
