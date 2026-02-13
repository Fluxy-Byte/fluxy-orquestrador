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
    // 1️⃣ Criar ou buscar usuário
    const user = await tx.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        emailVerified: true,
      },
    })

    // 2️⃣ Garantir account (credentials)
    const existingAccount = await tx.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credentials",
      },
    })

    if (!existingAccount) {
      await tx.account.create({
        data: {
          userId: user.id,
          providerId: "credentials",
          accountId: user.email,
          password: data.passwordHash,
        },
      })
    }

    // 3️⃣ Criar ou buscar organization "Administradores"
    const organization = await tx.organization.upsert({
      where: { slug: "administradores" },
      update: {},
      create: {
        name: "Administradores",
        slug: "administradores",
      },
    })

    // 4️⃣ Garantir vínculo ADMIN
    const existingMember = await tx.member.findFirst({
      where: {
        userId: user.id,
        organizationId: organization.id,
      },
    })

    if (!existingMember) {
      await tx.member.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ADMIN",
        },
      })
    }

    // 5️⃣ Criar ou buscar Agent

    const agent = await tx.agent.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "fluxy",
        url: "https://gamefic-sdr.egnehl.easypanel.host/", // pode vir de env
      },
    })

    return {
      user,
      organization,
      agent,
    }
  })
}
