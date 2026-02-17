import strict from "node:assert/strict"

export interface User {
  id: string
  name?: string | null
  email: string
  emailVerified: boolean
  image?: string | null
  role: string
  banned: boolean
  banReason?: string | null
  banExpires?: Date | null
  createdAt: Date
  updatedAt: Date

  sessions?: Session[]
  accounts?: Account[]
  memberships?: Member[]
  invitations?: Invitation[]
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  token: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date

  user?: User
}


export interface Account {
  id: string
  userId: string
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

  user?: User
}

export interface Verification {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: string | null
  createdAt: Date
  updatedAt: Date

  members?: Member[]
  invitations?: Invitation[]
  wabas?: Waba[]
}

type MemberRole = "member" | "admin" | "owner"


export interface Member {
  id: string
  role: string
  createdAt: Date
  updatedAt: Date

  userId: string
  organizationId: string

  user?: User
  organization?: Organization
}

export interface Invitation {
  id: string
  organizationId: string
  inviterId: string
  email: string
  role: string
  status: "pending" | "accepted" | "expired"
  expiresAt: Date
  createdAt: Date
  updatedAt: Date

  organization?: Organization
  inviter?: User
}


export interface Agent {
  id: string
  name: string
  url: string
  mensagem?: string | null

  wabas?: Waba[]
}


export interface Waba {
  id: string
  phoneNumberId: string
  displayPhoneNumber: string

  organizationId: string
  agentId: string

  organization?: Organization
  agent?: Agent
  contacts?: Contact[]
}


export interface Contact {
  id: string
  email?: string | null
  name?: string | null
  phone: string
  startDateConversation: Date
  lastDateConversation?: Date | null
  leadGoal?: string | null

  wabaId: string
  waba?: Waba
}


export enum Role {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
}
