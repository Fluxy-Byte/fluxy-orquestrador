import { prisma } from '../../lib/prisma'
import { randomUUID } from 'crypto'

/**
 * Interface usada pela aplicação
 * (não expõe ID do banco)
 */
export interface RDCRM {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
}

/**
 * Busca o token salvo (singleton)
 */
async function coletarTokenRD() {
    return prisma.rdstation.findFirst()
}

/**
 * Cria ou atualiza o token RD Station
 * usando upsert (padrão profissional)
 */
async function salvarOuAtualizarToken(dados: RDCRM) {
    return prisma.rdstation.upsert({
        where: {
            refresh_token: dados.refresh_token
        },
        update: {
            access_token: dados.access_token,
            expires_in: dados.expires_in,
            token_type: dados.token_type
        },
        create: {
            access_token: dados.access_token,
            expires_in: dados.expires_in,
            refresh_token: dados.refresh_token,
            token_type: dados.token_type
        }
    })
}

/**
 * GET – retorna o token salvo
 */
export async function rdStationGet() {
    try {
        const dados = await coletarTokenRD()

        return {
            status: true,
            dados
        }
    } catch (error) {
        console.error('Erro ao buscar token RD Station:', error)

        return {
            status: false,
            dados: undefined
        }
    }
}

/**
 * POST – cria ou atualiza o token
 */
export async function rdStationPost(dados: RDCRM) {
    try {
        const result = await salvarOuAtualizarToken(dados)

        return {
            status: true,
            dados: result
        }
    } catch (error) {
        console.error('Erro ao salvar token RD Station:', error)

        return {
            status: false,
            dados: undefined
        }
    }
}
