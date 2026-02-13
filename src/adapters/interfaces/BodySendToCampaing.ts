export interface BodyTemplate {
    "type": string,
    "body": {
        "messaging_product": string,
        "recipient_type": string,
        "to": string,
        "type": string,
        "template": {
            "name": string,
            "language": {
                "code": string
            },
            "components": any[]
        }
    }
}

export interface Task {
    name_template: string,
    dados: LeadRegister,
    phoneNumberId: string
}


export interface LeadRegister {
    nome: string,
    produto?: string,
    nivelInteresse?: string,
    problemaCentral?: string,
    objetivoLead?: string,
    tomLead?: string,
    urgenciaLead?: string,
    instrucao?: string,
    telefone: string,
    nomeAgente: string,
    telefoneAgente: string,
    problema?: string,
    etapa?: string,
}