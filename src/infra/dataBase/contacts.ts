import { prisma } from '../../lib/prisma';
import { Metadata } from '../../services/interfaces/MetaWebhook';
import { getWabaFilterWithPhoneNumber, getWabaFilterWithId } from './waba';

async function getUserFilterWithPhone(phone: string) {
    return await prisma.contact.findFirst({
        where: { phone },
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });
}

async function getUserFilterWithPhoneAndWabaId(
    phone: string,
    wabaId: number
) {
    return await prisma.contact.findFirst({
        where: {
            phone,
            contactWabas: {
                some: {
                    wabaId,
                },
            },
        },
        include: {
            contactWabas: {
                where: { wabaId },
                include: { waba: true },
            },
        },
    });
}

async function updateDateLastMessage(phone: string) {
    await prisma.contact.update({
        where: {
            phone: phone
        },
        data: {
            lastDateConversation: new Date()
        }
    });
}

async function createUser(phone: string, wabaId: number) {
    return await prisma.contact.create({
        data: {
            phone,
            contactWabas: {
                create: {
                    waba: {
                        connect: { id: wabaId },
                    },
                },
            },
        },
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });
}

export async function contato(phone: string, id_waba: number) {
    try {
        const dadosWaba = await getWabaFilterWithId(id_waba);

        if (!dadosWaba) {
            return {
                status: false,
                user: null,
                message: "Não existe Waba com id_waba: " + id_waba
            };
        }

        let user = await getUserFilterWithPhone(phone);

        if (!user) {
            user = await createUser(phone, id_waba);
        } else {
            const jaTemRelacionamento = user.contactWabas.some(
                cw => cw.wabaId === id_waba
            );

            if (!jaTemRelacionamento) {
                await createContactWabaRelation(user.id, id_waba);
            }
        }

        await updateDateLastMessage(phone);

        const contatoAtualizado = await getUserFilterWithPhoneAndWabaId(
            phone,
            id_waba
        );

        return {
            status: true,
            user: contatoAtualizado,
            message: "Sucesso ao encontrar usuario"
        };

    } catch (e) {
        console.error("Erro ao gerar usuário:", e);

        return {
            status: false,
            user: null,
            message: "Erro interno ao gerar usuario"
        };
    }
}


export async function getAllContacts() {
    return await prisma.contact.findMany({
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });
}

export async function updateContactObejtivoLead(phone: string, nome: string, objetivoLead: string) {
    return await prisma.contact.update({
        where: {
            phone: phone
        },
        data: {
            leadGoal: objetivoLead,
            name: nome
        }
    })
}

export async function contatoConexaoSdr(
    phone: string,
    name: string,
    phone_number_id: string,
    objetivoLead: string
) {
    try {
        const dadosWaba = await getWabaFilterWithPhoneNumber(phone_number_id);

        if (!dadosWaba) {
            return {
                status: false,
                user: null,
                message: "Não existe Waba com phone_number_id: " + phone_number_id
            };
        }

        let user = await getUserFilterWithPhone(phone);

        if (!user) {
            user = await criarUsuarioConexaoSdr(
                phone,
                name,
                dadosWaba.id,
                objetivoLead
            );
        } else {
            const jaTemRelacionamento = user.contactWabas.some(
                cw => cw.wabaId === dadosWaba.id
            );

            if (!jaTemRelacionamento) {
                await createContactWabaRelation(user.id, dadosWaba.id);
            }
        }

        await updateDateLastMessageConexaoSdr(phone, objetivoLead);

        const contatoAtualizado = await getUserFilterWithPhoneAndWabaId(
            phone,
            dadosWaba.id
        );

        return {
            status: true,
            user: contatoAtualizado,
            message: "Sucesso ao encontrar usuario"
        };

    } catch (e) {
        console.error("Erro ao gerar usuário:", e);

        return {
            status: false,
            user: null,
            message: "Erro interno ao gerar usuario"
        };
    }
}
async function criarUsuarioConexaoSdr(
    phone: string,
    name: string,
    wabaId: number,
    leadGoal: string
) {
    return await prisma.contact.create({
        data: {
            phone,
            name,
            leadGoal,

            contactWabas: {
                create: {
                    waba: {
                        connect: { id: wabaId },
                    },
                },
            },
        },
        include: {
            contactWabas: {
                include: {
                    waba: true,
                },
            },
        },
    });
}

async function updateDateLastMessageConexaoSdr(phone: string, leadGoal: string) {
    await prisma.contact.update({
        where: {
            phone: phone
        },
        data: {
            lastDateConversation: new Date(),
            leadGoal
        }
    });
}

async function updateNameContact(
    phone: string,
    name: string,
    wabaId: number
) {
    await prisma.contact.updateMany({
        where: {
            phone,
            contactWabas: {
                some: { wabaId },
            },
        },
        data: {
            name,
            lastDateConversation: new Date(),
        },
    });

    return await prisma.contact.findFirst({
        where: {
            phone,
            contactWabas: {
                some: { wabaId },
            },
        },
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });
}

export async function updateNameLeadConexaoSdr(
    phone: string,
    name: string,
    phone_number_id: string
) {
    try {
        const dadosWaba = await getWabaFilterWithPhoneNumber(phone_number_id);

        if (!dadosWaba) {
            return {
                status: false,
                user: null,
                message: "Não existe Waba com phone_number_id: " + phone_number_id
            };
        }

        let user = await getUserFilterWithPhone(phone);

        if (!user) {
            user = await criarUsuarioConexaoSdr(
                phone,
                name,
                dadosWaba.id,
                "Objetivo não foi informado"
            );
        } else {
            const jaTemRelacionamento = user.contactWabas.some(
                cw => cw.wabaId === dadosWaba.id
            );

            if (!jaTemRelacionamento) {
                await createContactWabaRelation(user.id, dadosWaba.id);
            }
        }

        const contatoAtualizado = await updateNameContact(
            phone,
            name,
            dadosWaba.id
        );

        return {
            status: true,
            user: contatoAtualizado,
            message: "Sucesso ao encontrar usuario"
        };

    } catch (e) {
        console.error("Erro ao gerar usuário:", e);

        return {
            status: false,
            user: null,
            message: "Erro interno ao gerar usuario"
        };
    }
}

async function createContactWabaRelation(
    contactId: number,
    wabaId: number
) {
    return await prisma.contactWaba.create({
        data: {
            contactId,
            wabaId
        },
        include: {
            waba: true
        }
    });
}