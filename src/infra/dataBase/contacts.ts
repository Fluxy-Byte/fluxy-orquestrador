import { prisma } from '../../lib/prisma'

async function verificandoExistencia(phone: string) {
    return await prisma.contact.findFirst({
        where: {
            phone
        }
    })
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

async function criarUsuario(phone: string, id_waba: number) {
    return await prisma.contact.create({
        data: {
            phone,
            wabaId: id_waba
        }
    })
}

export async function contato(phone: string, id_waba: number) {
    try {
        let user = await verificandoExistencia(phone);

        if (!user) {
            user = await criarUsuario(phone, id_waba);
        }

        await updateDateLastMessage(phone);

        return {
            status: true,
            user
        };

    } catch (e) {
        console.error('Erro ao gerar usuário:', e);

        return {
            status: false,
            user: null
        };
    }
}


export async function getAllContacts() {
    return await prisma.contact.findMany();
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