import { prisma } from '../../lib/prisma'

export async function procurarUsuario(email: string) {
    return await prisma.user.findFirst({
        where: {
            email
        }
    })
}
