import express from "express";
import swaggerUi from "swagger-ui-express";
import { createTaskCampaign } from "../services/producers/task.producer.campaign"// Criar task para campanhas
import { createTaskVendas } from "../services/producers/task.producer.vendas"// Criar task para campanhas
import { coletarHistorico } from "../infra/dataBase/messages";
import { HandleReceptiveWebhook } from "../services/handleMessages/handleReceptiveWebhook";
import { getAllContacts, contatoConexaoSdr, updateNameLeadConexaoSdr } from "../infra/dataBase/contacts";
import { rdStationGet, rdStationPost } from "../infra/dataBase/rdstation";
import { Request, Response } from "express";
import cors from "cors";

const routes = express();
routes.use(cors());
routes.use(express.json());

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "API Teste",
        version: "1.0.0"
    }
};

routes.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Para validar o token de acesso webhook
routes.get("/api/v1/receptive/webhook", async (req: any, res: any) => {
    try {
        const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
        const verifyToken = process.env.VERIFY_TOKEN;
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WEBHOOK VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.status(403).end();
        }
    } catch (e) {
        console.log("❌ Erro tentar verificar webhook GET-/api/v1/receptive/webhook: " + e)
        return res.status(500).end();
    }
})

// Receber mensagens e alteração de status do webhook da meta
routes.post("/api/v1/receptive/webhook", async (req: any, res: any) => {
    try {
        res.status(200).end()
        // await createTaskReceptive(req.body);
        await HandleReceptiveWebhook(req.body)
        return
    } catch (e) {
        console.log("❌ Erro ao tentar criar mensagem na fila POST-/api/v1/receptive/webhook: " + e)
        res.status(500).end();
    }
})


// Receber mensagens ativas para disparo
routes.post("/api/v1/campaign", async (req: any, res: any) => {
    try {
        const bodyToCampaing: any = req.body;
        console.log(bodyToCampaing)
        if (bodyToCampaing.numbers.length == 0 || !bodyToCampaing.template_name || !bodyToCampaing.type) {
            return res.status(401).json({
                status: false,
                message: "Erro ao inserir na fila de disparo pois esta faltando dados no corpo da req.",
                error: ""
            });
        }

        await createTaskCampaign(bodyToCampaing);

        return res.status(200).json({
            status: true,
            message: "Campanha inserida na fila de disparo com sucesso.",
            error: ""
        })
    } catch (e) {
        console.log("❌ Erro ao tentar criar campaign na fila POST-/api/v1/campaign: " + e)
        res.status(500).json({
            status: false,
            message: "Erro ao inserir na fila de disparo.",
            error: JSON.stringify(e)
        });
    }
})

// Receber mensagens ativas para disparo
routes.post("/api/v1/vendas", async (req: any, res: any) => {
    try {
        const bodyToCampaing: any = req.body;
        if (!bodyToCampaing.name_template || !bodyToCampaing.dados) {
            return res.status(401).json({
                status: false,
                message: "Erro ao inserir na fila de disparo pois esta faltando dados no corpo da req.",
                error: ""
            });
        }

        await createTaskVendas(bodyToCampaing);

        return res.status(200).json({
            status: true,
            message: "Venda inserida na fila de disparo com sucesso.",
            error: ""
        })
    } catch (e) {
        console.log("❌ Erro ao tentar criar venda na fila POST-/api/v1/vendas: " + e)
        res.status(500).json({
            status: false,
            message: "Erro ao inserir na fila de disparo.",
            error: JSON.stringify(e)
        });
    }
})

routes.post("/api/v1/contact", async (req, res) => {
    try {
        console.log("Chegou")
        const { phone, name, metadado, context } = req.body;
        const mensagens = await contatoConexaoSdr(phone, name, metadado, context);
        res.status(200).json({
            status: true,
            message: "Contato criado na base",
            data: mensagens
        });
    } catch (e: any) {
        res.status(500).json({
            status: false,
            message: "Erro ao criar contato",
            error: JSON.stringify(e)
        });
    }
})

routes.put("/api/v1/contact", async (req, res) => {
    try {
        const { phone, name, metadado } = req.body;
        const mensagens = await updateNameLeadConexaoSdr(phone, name, metadado);
        res.status(200).json({
            status: true,
            message: "Contatos atualizado na base",
            data: mensagens
        });
    } catch (e: any) {
        res.status(500).json({
            status: false,
            message: "Erro ao atualizar contato",
            error: JSON.stringify(e)
        });
    }
})

type Params = {
    name: string;
}

routes.get("/api/v1/rdcrm", async (req: Request<Params>, res: Response) => {
    try {
        const { name } = req.params;
        const result = await rdStationGet(name);

        if (!result.status) {
            return res.status(500).json({
                status: false,
                data: null,
            })
        }

        return res.status(200).json({
            status: true,
            data: result.dados,
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            data: null,
        })
    }
})


routes.post("/api/v1/rdcrm", async (req, res) => {
    try {
        const body = req.body

        const result = await rdStationPost(body)

        if (!result.status) {
            return res.status(500).json({
                status: false,
                data: null,
            })
        }

        return res.status(200).json({
            status: true,
            data: result.dados,
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            data: null,
        })
    }
})

routes.get("/api/v1/contacts", async (req, res) => {
    try {
        const mensagens = await getAllContacts();
        res.status(200).json({
            status: true,
            message: "Contatos na base",
            data: mensagens
        });
    } catch (e: any) {
        res.status(500).json({
            status: false,
            message: "Erro ao coletar contatos",
            error: JSON.stringify(e)
        });
    }
})

type ParamsHistorico = {
    user: string;
}

routes.get("/api/v1/historico", async (req: Request<ParamsHistorico>, res: Response) => {
    try {
        const { user } = req.params;
        const result = await coletarHistorico(user);

        return res.status(200).json({
            status: true,
            historico: result,
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            historico: [],
        })
    }
})



routes.get("/api/v1/healths", (_: any, res: any) => {
    res.json({ status: "ok" });
});

export default routes;


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


// npm install --save-dev @types/cors