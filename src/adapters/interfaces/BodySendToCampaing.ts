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


export type WhatsAppMessageList = WhatsAppMessagePayload[];

export interface WhatsAppMessagePayload {
    chatid: string;
    content: MessageContent;
    convertOptions: string;
    edited: string;
    fromMe: boolean;
    id: string;
    isGroup: boolean;
    messageTimestamp: number;
    messageType: MessageType;
    messageid: string;
    owner: string;
    quoted: string;
    reaction: string;
    readChatAttempted: boolean;
    sender: string;
    senderName: string;
    source: "web" | "mobile" | "api";
    status: MessageStatus;
    text: string;
    track_id: string;
    track_source: string;
}

export interface MessageContent {
    text: string;
    contextInfo: MessageContextInfo;
}

export interface MessageContextInfo {
    quotedMessageId?: string;
    mentionedJid?: string[];
    participant?: string;
}

export type MessageType =
    | "ExtendedTextMessage"
    | "TextMessage"
    | "ImageMessage"
    | "VideoMessage"
    | "AudioMessage"
    | "DocumentMessage"
    | "StickerMessage"
    | "ContactMessage"
    | "LocationMessage"
    | "ButtonsMessage"
    | "ListMessage";

export type MessageStatus =
    | "Pending"
    | "Sent"
    | "Delivered"
    | "Read"
    | "Failed";

