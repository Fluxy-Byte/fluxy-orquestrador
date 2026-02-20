import { prisma } from '../../lib/prisma'

export async function createWaba(phoneNumberId: string, displayPhoneNumber: string, organizationId: string, agentId: number) {
    return await prisma.waba.create({
        data: {
            phoneNumberId,
            displayPhoneNumber,
            organizationId,
            agentId,
        },
        include: {
            agent: true,
            contactWabas: {
                include: {
                    contact: true
                }
            }
        },
    })
}

export async function getAllWaba() {
    return await prisma.waba.findMany({
        select: {
            organizationId: true,
            displayPhoneNumber: true,
            id: true,
            phoneNumberId: true,
            agent: true
        }
    })
}

export async function getWabaFilterOrganization(organization_id: string) {
    return await prisma.waba.findMany({
        where: {
            organizationId: organization_id
        },
        select: {
            organizationId: true,
            displayPhoneNumber: true,
            id: true,
            phoneNumberId: true,
            agent: true
        }
    })
}

export async function getWabaFilterWithPhoneNumber(phone_number_id: string) {
    return await prisma.waba.findFirst({
        where: {
            phoneNumberId: phone_number_id,
        },
        include: {
            agent: true,
            contactWabas: {
                include: {
                    contact: true
                }
            }
        },
    })
}

export async function getWabaFilterWithId(id: number) {
    return await prisma.waba.findFirst({
        where: {
            id
        },
        include: {
            agent: true,
            contactWabas: {
                include: {
                    contact: true
                }
            }
        },
    })
}

interface UpdateWaba {
    agentId?: number,
    displayPhoneNumber?: string,
    organizationId?: string,
    phoneNumberId?: string
}

export async function updateWaba(phone_number_id: string, dados: UpdateWaba) {
    return await prisma.waba.update({
        where: {
            phoneNumberId: phone_number_id
        },
        data: dados
    })
}


export async function updateNumberContactsWaba(phone_number_id: string) {
    return await prisma.waba.update({
        where: {
            phoneNumberId: phone_number_id
        },
        data: {
            qtdContatos: {
                increment: 1
            }
        }
    })
}

export async function updateNumberContactsConvertationWaba(phone_number_id: string) {
    return await prisma.waba.update({
        where: {
            phoneNumberId: phone_number_id
        },
        data: {
            qtdConversao: {
                increment: 1
            }
        }
    })
}