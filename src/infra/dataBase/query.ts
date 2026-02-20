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
    const agent = await tx.agent.upsert({
      where: {
        name: "fluxy"
      },
      update: {},
      create: {
        name: "fluxy",
        url: "https://fluxe-sdr.egnehl.easypanel.host",
      },
    })

    return {
      agent,
    }
  })
}
