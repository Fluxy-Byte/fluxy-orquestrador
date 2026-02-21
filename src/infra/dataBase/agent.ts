import { prisma } from '../../lib/prisma'

export async function getAllAgent() {
    return await prisma.agent.findMany({
        include: {
            wabas: true,
        },
    })
}

export async function getAgentFilterWithId(id: number) {
    return await prisma.agent.findFirst({
        where: {
            id
        },
        include: {
            wabas: true,
        },
    })
}

export async function createAgent(name: string, url: string, organizationId: string) {
    const resultSeachName = await prisma.agent.findFirst({
        where: {
            name,
            url,
            organizationId
        }
    })

    if (resultSeachName) return resultSeachName;

    return await prisma.agent.create({
        data: {
            name,
            url
        }
    })
}

interface UpdateAgent {
    name?: string,
    url?: string,
    mensagem?: string,
    organizationId?: string
}

export async function updateAgente(id: number, dados: UpdateAgent) {
    return await prisma.agent.update({
        where: {
            id
        },
        data: dados
    })
}

export async function getAgentFilterWithPhoneNumberId(phoneNumberId: string) {
    return await prisma.waba.findFirst({
        where: {
            phoneNumberId
        },
        include: {
            agent: true,
        },
    })
}