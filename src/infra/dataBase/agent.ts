import { prisma } from '../../lib/prisma'

export async function coletarAgent(phoneNumberId: string) {
    return await prisma.waba.findFirst({
        where: {
            phoneNumberId
        },
        include: {
            agent: true,
        },
    })
}