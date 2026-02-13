export interface User {
    id: number
    name: string
    email: string
    emailVerified: boolean
    image?: string | null
    role?: string | null
    banned?: boolean | null
    banReason?: string | null
    banExpiresAt?: Date | null
    createdAt: Date
    updatedAt: Date

    sessions?: Session[]
    accounts?: Account[]
    members?: Member[]
    invitations?: Invitation[]
}


export interface Session {
    id: number
    expiresAt: Date
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    impersonatedBy?: string | null
    activeOrganizationId?: number | null
    createdAt: Date
    updatedAt: Date

    userId: number
    user?: User
}

export interface Account {
    id: number
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | null
    refreshTokenExpiresAt?: Date | null
    scope?: string | null
    password?: string | null
    createdAt: Date
    updatedAt: Date

    userId: number
    user?: User
}

export interface Verification {
    id: number
    identifier: string
    value: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface Organization {
    id: number
    name: string
    slug: string
    logo?: string | null
    metadata?: string | null
    createdAt: Date

    members?: Member[]
    invitations?: Invitation[]
    wabas?: Waba[]
}

export interface Member {
    id: number
    role: "ADMIN" | "MEMBER"
    createdAt: Date

    userId: number
    organizationId: number

    user?: User
    organization?: Organization
}

export interface Invitation {
    id: number
    email: string
    role?: string | null
    status: "pending" | "accepted" | "expired"
    expiresAt: Date
    createdAt: Date

    organizationId: number
    inviterId: number

    organization?: Organization
    inviter?: User
}

export interface Agent {
    id: number
    name: string
    url: string

    wabas?: Waba[]
}

export interface Waba {
    id: number
    phoneNumberId: string
    displayPhoneNumber: string

    organizationId: number
    agentId: number

    organization?: Organization
    agent?: Agent
    contacts?: Contact[]
}

export interface Contact {
    id: number
    email?: string | null
    name?: string | null
    phone: string
    startDateConversation: Date
    lastDateConversation?: Date | null
    leadGoal?: string | null

    wabaId: number
    waba?: Waba
}

export enum Role {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
}
