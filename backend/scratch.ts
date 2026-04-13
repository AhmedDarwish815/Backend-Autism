import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching children...");
    const children = await prisma.user.findMany({
        where: { role: "CHILD" },
        include: { childProfile: true, parent: { select: { email: true } } }
    });
    
    if (children.length === 0) {
        console.log("NO CHILD ACCOUNTS FOUND IN DATABASE.");
    } else {
        const list = children.map((c: any) => ({
            childEmail: c.email,
            childName: c.childProfile?.name,
            parentEmail: c.parent?.email
        }));
        console.log("EXISTING CHILDREN:");
        console.table(list);
    }
}

main()
  .catch((e: any) => console.error(e))
  .finally(() => prisma.$disconnect());
