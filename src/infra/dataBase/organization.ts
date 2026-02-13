import { prisma } from '../../lib/prisma'

export interface InterfaceWaba {
    id_waba: number;
    phone_number_id: string;
    display_phone_number: string;
    organization?: number[];
}


export async function createOrganization() {
    const organizacao = await prisma.organization.findFirst(
        {
            where: {
                name: "Administrador"
            }
        }
    )

    if (!organizacao) {
        prisma.organization.upsert({
            where: { slug: "administradores" },
            update: {},
            create: {
                name: "Administradores",
                slug: "administradores",
                createdAt: new Date(),
            },
        })
    }

    return organizacao;
}
