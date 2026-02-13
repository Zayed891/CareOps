const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspace = await prisma.workspace.findFirst();
    if (workspace) {
        console.log(`SLUG: ${workspace.slug}`);
    } else {
        console.log('NO_WORKSPACE_FOUND');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
