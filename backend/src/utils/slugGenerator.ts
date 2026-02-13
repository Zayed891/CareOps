import prisma from '../db';

/**
 * Generate a URL-friendly slug from a name
 * @param name - The name to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
        || 'workspace';                 // Fallback if empty
};

/**
 * Generate a unique slug for a workspace
 * @param baseName - The base name to generate slug from
 * @param excludeWorkspaceId - Optional workspace ID to exclude from uniqueness check
 * @returns A unique slug
 */
export const generateUniqueSlug = async (
    baseName: string,
    excludeWorkspaceId?: string
): Promise<string> => {
    const baseSlug = generateSlug(baseName);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.workspace.findFirst({
            where: {
                slug: slug,
                ...(excludeWorkspaceId && { id: { not: excludeWorkspaceId } }),
            },
        });

        if (!existing) {
            return slug; // Slug is available
        }

        // If slug exists, append counter
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};
