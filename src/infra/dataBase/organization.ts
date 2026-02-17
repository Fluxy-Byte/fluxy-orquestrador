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
            where: { id: "1" },
            update: {},
            create: {
                name: "Administradores",
                slug: "adm",
                updatedAt: new Date(),
                createdAt: new Date(),
            },
        })
    }

    return organizacao;
}
