import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Standard Prisma Client initialization for passing URL at runtime
    return new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://neondb_owner:npg_1jGmLdRfwl8X@ep-flat-shape-aib20yxl-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
            }
        }
    });
};

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
