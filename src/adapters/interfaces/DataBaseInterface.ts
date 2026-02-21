export interface Agent {
  id: number
  name: string
  url: string
  mensagem?: string | null

  wabas?: Waba[]
}

export interface Waba {
  id: number
  phoneNumberId: string
  displayPhoneNumber: string
  qtdContatos: number | null
  qtdConversao: number | null
  organizationId: string
  agentId: number

  agent?: Agent
  contactWabas?: ContactWaba[]
}

export interface Contact {
  id: number
  email?: string | null
  name?: string | null
  phone: string
  startDateConversation: Date
  lastDateConversation?: Date | null
  leadGoal?: string | null

  contactWabas?: ContactWaba[]
}


export enum Role {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export interface ContactWaba {
  id: number
  contactId: number
  wabaId: number

  waba?: Waba
}