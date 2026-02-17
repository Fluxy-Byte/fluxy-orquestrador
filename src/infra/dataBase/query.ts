import { prisma } from "../../lib/prisma"

type CreateAdminUserInput = {
  name: string
  email: string
  passwordHash: string
}

export async function createAdminUserWithAccess(
  data: CreateAdminUserInput
) {
  return prisma.$transaction(async (tx) => {
    /**
     * 1️⃣ Usuário ADMIN
     */
    const user = await tx.user.upsert({
      where: { email: data.email },
      update: {
        role: "ADMIN",
      },
      create: {
        name: data.name,
        email: data.email,
        role: "ADMIN",
        accounts: {
          create: {
            providerId: "credentials",
            accountId: data.email,
            password: data.passwordHash,
          },
        },
      },
    })

    /**
     * 2️⃣ Organização (singleton)
     */
    const organization = await tx.organization.upsert({
      where: { slug: "administradores" },
      update: {},
      create: {
        name: "Administradores",
        slug: "administradores",
      },
    })

    /**
     * 3️⃣ Vínculo User ↔ Organization (Member ADMIN)
     */
    await tx.member.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: {
        role: "admin",
      },
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: "admin",
      },
    })

    /**
     * 4️⃣ Agent (singleton)
     */
    const agent = await tx.agent.upsert({
      where: {
        id: "1",
        url: "https://fluxe-sdr.egnehl.easypanel.host",
      },
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
