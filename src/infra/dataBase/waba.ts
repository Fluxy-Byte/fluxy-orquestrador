import { prisma } from '../../lib/prisma'


async function verificandoExistencia(phoneNumberId: string) {
    return await prisma.waba.findFirst({
        where: {
            phoneNumberId,
        },
        include: {
            agent: true,
        },
    })
}


async function criarWaba(
    phoneNumberId: string,
    displayPhoneNumber: string,
) {
    const organization = await prisma.organization.findFirst({
        where: {
            name: "Administradores"
        }
    });
    const agent = await prisma.agent.findFirst({
        where: {
            name: "fluxy"
        }
    });

    console.log(organization)
    console.log(agent)
    if (organization && agent) {
        return await prisma.waba.create({
            data: {
                phoneNumberId,
                displayPhoneNumber,
                organizationId: organization?.id,
                agentId: agent.id,
            },
            include: {
                agent: true,
            },
        })
    }

}


export async function waba(phone_number_id: string, display_phone_number: string) {
    try {
        let waba = await verificandoExistencia(phone_number_id);

        if (!waba) {
            const waba = await criarWaba(phone_number_id, display_phone_number);
            return {
                status: true,
                waba
            }
        }

        return {
            status: true,
            waba
        };

    } catch (e) {
        console.error('Erro ao gerar waba:', e);

        return {
            status: false,
            waba: undefined
        };
    }
}