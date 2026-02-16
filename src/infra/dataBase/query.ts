import { prisma } from "../../lib/prisma"

type CreateAdminUserInput = {
  name: string
  email: string
  passwordHash: string 
}

export async function createAdminUserWithOrganization(
  data: CreateAdminUserInput
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: data.email },
      update: {
        role: "ADMIN",
      },
      create: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        role: "ADMIN",
      },
    })

    const organization = await tx.organization.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Administradores",
      },
    })

    const agent = await tx.agent.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "fluxy",
        url: "https://fluxe-sdr.egnehl.easypanel.host",
      },
    })

    return {
      user,
      organization,
      agent,
    }
  })
}
