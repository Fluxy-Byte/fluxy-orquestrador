import { prisma } from '../../lib/prisma'

export interface RDCRM {
    id: number
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
}

async function coletarTokenRD() {
    return await prisma.rdstation.findFirst()
}

async function createRefresh(dados: RDCRM) {
    return await prisma.rdstation.create({
        data: {
            id: 1,
            access_token: dados.access_token,
            expires_in: dados.expires_in,
            refresh_token: dados.refresh_token,
            token_type: dados.token_type
        }
    })
}

async function updateRefresh(dados: RDCRM) {
    return await prisma.rdstation.update({
        where: {
            id: 1
        },
        data: {
            access_token: dados.access_token,
            expires_in: dados.expires_in,
            refresh_token: dados.refresh_token,
            token_type: dados.token_type
        }
    })
}

export async function rdStationGet() {
    try {
        const dados: RDCRM | null = await coletarTokenRD()
        return {
            status: true,
            dados
        };
    } catch (e) {
        console.error('Erro ao gerar rd:', e);

        return {
            status: false,
            dados: undefined
        };
    }
}

export async function rdStationPost(dados: RDCRM) {
    try {
        const token = await coletarTokenRD()

        const result = token
            ? await updateRefresh(dados)
            : await createRefresh(dados)

        return {
            status: true,
            dados: result
        }

    } catch (e) {
        console.error('Erro ao gerar rd:', e)
        return {
            status: false,
            dados: undefined
        }
    }
}
