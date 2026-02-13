import { prisma } from '../../lib/prisma';
import { Metadata } from '../../services/interfaces/MetaWebhook';
import { waba } from './waba';

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

export async function contatoConexaoSdr(phone: string, name: string, metadado: Metadata, context: string) {
    try {
        let dadosWaba = (await waba(metadado.phone_number_id, metadado.display_phone_number)).waba

        let user = await verificandoExistencia(phone);

        if (!user) {
            let idTemp = dadosWaba?.id ?? 1
            user = await criarUsuarioConexaoSdr(phone, name, idTemp, context);
        }

        updateDateLastMessageConexaoSdr(phone, context);

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

async function criarUsuarioConexaoSdr(phone: string, name: string, idTemp: number, context: string) {
    console.log(phone, name, idTemp, context)
    return await prisma.contact.create({
        data: {
            phone,
            name,
            wabaId: idTemp,
            leadGoal: context
        }
    })
}

async function updateDateLastMessageConexaoSdr(phone: string, context: string) {
    await prisma.contact.update({
        where: {
            phone: phone
        },
        data: {
            lastDateConversation: new Date(),
            leadGoal: context
        }
    });
}

export async function updateNameLeadConexaoSdr(phone: string, name: string, metadado: Metadata) {
    try {
        console.log("1")
        let dadosWaba = (await waba(metadado.phone_number_id, metadado.display_phone_number)).waba

        let user = await verificandoExistencia(phone);

        if (!user) {
            let idTemp = dadosWaba?.id ?? 1
            user = await criarUsuarioConexaoSdr(phone, name, idTemp, "Objetivo não foi informado");
        }

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