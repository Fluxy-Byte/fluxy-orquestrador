import express from "express";
import swaggerUi from "swagger-ui-express";
import { createTaskCampaign } from "../services/producers/task.producer.campaign"// Criar task para campanhas
import { createTaskVendas } from "../services/producers/task.producer.vendas"// Criar task para campanhas
import { coletarHistorico } from "../infra/dataBase/messages";
import { HandleReceptiveWebhook } from "../services/handleMessages/handleReceptiveWebhook";
import { getAllContacts, getUserFilterWithWabaId, contatoConexaoSdr, updateNameLeadConexaoSdr } from "../infra/dataBase/contacts";
import { rdStationGet, rdStationPost } from "../infra/dataBase/rdstation";
import { Request, Response } from "express";
import { createWaba, getAllWaba, getWabaFilterOrganization, getWabaFilterWithPhoneNumber, updateWaba } from "@/infra/dataBase/waba";
import { createAgent, getAgentFilterWithId, getAllAgent, updateAgente, getAgentFilterWithOrganizationId } from "@/infra/dataBase/agent";
import cors from "cors";
import { error } from "node:console";

const routes = express();
routes.use(cors());
routes.use(express.json());

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "API WhatsApp / CRM",
        description: "Documentação da API de campanhas, vendas, contatos, WABA, agentes e histórico",
        version: "1.0.0",
    },
    servers: [
        {
            url: "https://fluxe-orquestrador.egnehl.easypanel.host",
            description: "Servidor local",
        },
    ],
    tags: [
        { name: "Webhook" },
        { name: "Campanhas" },
        { name: "Vendas" },
        { name: "Contatos" },
        { name: "RD Station" },
        { name: "WABA" },
        { name: "Agentes" },
        { name: "Histórico" },
        { name: "Health" },
    ],
    paths: {
        "/api/v1/receptive/webhook": {
            get: {
                tags: ["Webhook"],
                summary: "Validação do webhook da Meta",
                parameters: [
                    {
                        name: "hub.mode",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                    {
                        name: "hub.challenge",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                    {
                        name: "hub.verify_token",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: { description: "Webhook validado com sucesso" },
                    403: { description: "Token inválido" },
                },
            },
            post: {
                tags: ["Webhook"],
                summary: "Recebe mensagens e status do WhatsApp",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object" },
                        },
                    },
                },
                responses: {
                    200: { description: "Mensagem recebida" },
                },
            },
        },

        "/api/v1/campaign": {
            post: {
                tags: ["Campanhas"],
                summary: "Criar campanha de disparo",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["numbers", "template_name", "type"],
                                properties: {
                                    numbers: {
                                        type: "array",
                                        items: { type: "string" },
                                    },
                                    template_name: { type: "string" },
                                    type: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Campanha inserida na fila" },
                    401: { description: "Dados inválidos" },
                },
            },
        },

        "/api/v1/vendas": {
            post: {
                tags: ["Vendas"],
                summary: "Criar disparo de venda",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name_template", "dados"],
                                properties: {
                                    name_template: { type: "string" },
                                    dados: { type: "object" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Venda inserida na fila" },
                    401: { description: "Dados inválidos" },
                },
            },
        },

        "/api/v1/contacts": {
            get: {
                tags: ["Contatos"],
                summary: "Listar todos os contatos",
                parameters: [{
                    name: "waba_id",
                    in: "query",
                    schema: { type: "string" }
                }],
                responses: {
                    200: { description: "Lista de contatos" },
                },
            },
        },

        "/api/v1/contact": {
            post: {
                tags: ["Contatos"],
                summary: "Criar contato ou atualiza dados do contato",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["phone", "name"],
                                properties: {
                                    phone: { type: "string" },
                                    name: { type: "string" },
                                    phone_number_id: { type: "string" },
                                    objetivoLead: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contato criado" },
                },
            },
            put: {
                tags: ["Contatos"],
                summary: "Atualizar somente o campo nome do contato",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["phone", "name"],
                                properties: {
                                    phone: { type: "string" },
                                    name: { type: "string" },
                                    phone_number_id: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contato atualizado" },
                },
            },
        },

        "/api/v1/rdcrm": {
            get: {
                tags: ["RD Station"],
                summary: "Buscar lead no RD Station",
                parameters: [
                    {
                        name: "name",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: { description: "Lead encontrado" },
                },
            },
            post: {
                tags: ["RD Station"],
                summary: "Criar lead no RD Station",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object" },
                        },
                    },
                },
                responses: {
                    200: { description: "Lead criado" },
                },
            },
        },


        "/api/v1/list-wabas": {
            get: {
                tags: ["WABA"],
                summary: "Listar nomes dos wabas",
                parameters: [{
                    name: "organization_id",
                    in: "query",
                    schema: { type: "string" }
                }],
                responses: {
                    200: { description: "Lista de WABAs" },
                },
            }
        },

        "/api/v1/waba": {
            get: {
                tags: ["WABA"],
                summary: "Listar WABAs",
                parameters: [
                    {
                        name: "phone_number_id",
                        in: "query",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: { description: "Lista de WABAs" },
                },
            },
            post: {
                tags: ["WABA"],
                summary: "Criar WABA",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "phone_number_id",
                                    "display_phone_number",
                                    "idOrganization",
                                    "idAgente",
                                ],
                                properties: {
                                    phone_number_id: { type: "string" },
                                    display_phone_number: { type: "string" },
                                    idOrganization: { type: "string" },
                                    idAgente: { type: "number" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "WABA criado" },
                },
            },
            put: {
                tags: ["WABA"],
                summary: "Atualizar WABA",
                parameters: [
                    {
                        name: "phone_number_id",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    agentId: { type: "number" },
                                    displayPhoneNumber: { type: "string" },
                                    organizationId: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "WABA atualizado com sucesso" },
                    400: { description: "Dados inválidos" }
                }
            }
        },

        "/api/v1/agent": {
            get: {
                tags: ["Agentes"],
                summary: "Listar agentes",
                parameters: [
                    {
                        name: "id_agent",
                        in: "query",
                        schema: { type: "string" },
                    },
                    {
                        name: "organization_id",
                        in: "query",
                        schema: { type: "string" },
                    }
                ],
                responses: {
                    200: { description: "Lista de agentes" },
                },
            },
            post: {
                tags: ["Agentes"],
                summary: "Criar agentes",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "name",
                                    "url",
                                    "organizationId"
                                ],
                                properties: {
                                    name: { type: "string" },
                                    url: { type: "string" },
                                    organizationId: { type: "string" }
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Agente criado" },
                },
            },
            put: {
                tags: ["Agentes"],
                summary: "Atualizar agente",
                parameters: [
                    {
                        name: "id_agent",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "url", "mensagem", "organizationId"],
                                properties: {
                                    name: { type: "string" },
                                    url: { type: "string" },
                                    mensagem: { type: "string" },
                                    organizationId: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Agente atualizado com sucesso" },
                    400: { description: "Dados inválidos" }
                }
            }
        },

        "/api/v1/historico": {
            get: {
                tags: ["Histórico"],
                summary: "Buscar histórico de mensagens",
                parameters: [
                    {
                        name: "user",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                    {
                        name: "agente",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: { description: "Histórico retornado" },
                },
            },
        },

        "/api/v1/healths": {
            get: {
                tags: ["Health"],
                summary: "Health check da API",
                responses: {
                    200: {
                        description: "API funcionando",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "ok" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
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

type ParamsContact = {
    waba_id: string
}

routes.get("/api/v1/contacts", async (req: Request<ParamsContact>, res: Response) => {
    try {
        const { waba_id } = req.query;

        if (waba_id && typeof waba_id == "string") {

            const contatos = await getUserFilterWithWabaId(Number(waba_id));
            return res.status(200).json({
                status: true,
                contatos,
                message: "Contatos na base"
            })
        } else {
            const users = await getAllContacts();
            res.status(200).json({
                status: true,
                message: "Contatos na base",
                contatos: users
            });
        }
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contatos: []
        });
    }
})

routes.post("/api/v1/contact", async (req, res) => {
    try {
        const { phone, name, phone_number_id, objetivoLead } = req.body;
        const user = await contatoConexaoSdr(phone, name, phone_number_id, objetivoLead);
        res.status(200).json({
            status: true,
            message: user.message,
            contato: user.user
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contato: null
        });
    }
})

routes.put("/api/v1/contact", async (req, res) => {
    try {
        const { phone, name, phone_number_id } = req.body;
        const user = await updateNameLeadConexaoSdr(phone, name, phone_number_id);
        res.status(200).json({
            status: true,
            message: user.message,
            contato: user.user
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contato: null
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


routes.post("/api/v1/waba", async (req, res) => {
    try {
        const { phone_number_id, display_phone_number, idOrganization, idAgente } = req.body;

        if (!phone_number_id ||
            !display_phone_number ||
            !idOrganization ||
            !idAgente ||
            typeof phone_number_id != "string" ||
            typeof display_phone_number != "string" ||
            typeof idOrganization != "string" ||
            typeof idAgente != "number"
        ) {
            return res.status(400).json({
                status: false,
                waba: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: phone_number_id = string, display_phone_number = string, idOrganization = string, idAgente = number"
            })
        }

        const result = await createWaba(phone_number_id, display_phone_number, idOrganization, idAgente);

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            waba: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})

type WabaQuery = {
    phone_number_id?: string
}

routes.get("/api/v1/waba", async (req: Request<WabaQuery>, res) => {
    try {
        const { phone_number_id } = req.query;

        if (phone_number_id && typeof phone_number_id == "string") {
            const waba = await getWabaFilterWithPhoneNumber(phone_number_id);
            return res.status(200).json({
                status: true,
                waba,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: phone_number_id = string"
            })
        } else {
            const waba = await getAllWaba();
            return res.status(200).json({
                status: true,
                waba,
                mensagem: ""
            })
        }
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})

type WabaQueryWhitOrganization = {
    organization_id?: string
}

routes.get("/api/v1/list-wabas", async (req: Request<WabaQueryWhitOrganization>, res) => {
    try {
        const { organization_id } = req.query;

        if (organization_id && typeof organization_id == "string") {

            const wabas = await getWabaFilterOrganization(organization_id);
            return res.status(200).json({
                status: true,
                wabas,
                mensagem: ""
            })
        } else {
            const waba = await getAllWaba();
            return res.status(200).json({
                status: true,
                waba,
                mensagem: ""
            })
        }


    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


routes.put("/api/v1/waba", async (req: Request<WabaQuery>, res) => {
    try {
        const { agentId, displayPhoneNumber, organizationId } = req.body;
        const { phone_number_id } = req.query;

        if (!phone_number_id ||
            typeof phone_number_id != "string"
        ) {
            return res.status(400).json({
                status: false,
                waba: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: phone_number_id = string, agentId = number, displayPhoneNumber? = string e organizationId = string"
            })
        }

        const result = await updateWaba(phone_number_id, { agentId, displayPhoneNumber, organizationId, phoneNumberId: phone_number_id });

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            waba: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


type AgentQuery = {
    id_agent?: string
    organization_id?: string
}

routes.get("/api/v1/agent", async (req: Request<AgentQuery>, res) => {
    try {
        const { id_agent, organization_id } = req.query;

        if (id_agent && typeof id_agent == "string") {
            const agent = await getAgentFilterWithId(Number(id_agent));
            return res.status(200).json({
                status: true,
                agent,
                mensagem: "Consulta concluida usando id_agent como filtro"
            })
        } else if (organization_id && typeof organization_id == "string") {
            const agent = await getAgentFilterWithOrganizationId(organization_id);
            return res.status(200).json({
                status: true,
                agent,
                mensagem: "Consulta concluida usando organization_id como filtro"
            })
        } else {
            const agent = await getAllAgent();
            return res.status(200).json({
                status: true,
                agent,
                mensagem: "Consulta completa concluida"
            })
        }
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            agent: null,
            mensagem: "Erro interno no servidor"
        })
    }
})



routes.post("/api/v1/agent", async (req, res) => {
    try {
        const { name, url, organizationId } = req.body;
        console.log(name, url, organizationId)
        if (!name ||
            !url ||
            !organizationId ||
            typeof organizationId != "string" ||
            typeof name != "string" ||
            typeof url != "string"
        ) {
            return res.status(400).json({
                status: false,
                agent: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: name = string, url = string"
            })
        }

        const result = await createAgent(name, url, organizationId);

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            agent: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            agent: null,
            mensagem: "Erro interno no servidor"
        })
    }
})



routes.put("/api/v1/agent", async (req: Request<AgentQuery>, res) => {
    try {
        const { name, url, mensagem, organizationId } = req.body;
        const { id_agent } = req.query;

        if (!name ||
            !url ||
            typeof name != "string" ||
            typeof url != "string"
        ) {
            return res.status(400).json({
                status: false,
                agent: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: name = string, url = string, mensagem? = string e id_agent como query",
                organizationId: organizationId ?? ""
            })
        }

        const result = await updateAgente(Number(id_agent), { name, url, mensagem });

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            agent: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            agent: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


type HistoricoQuery = {
    user?: string
    agente?: string
}

routes.get("/api/v1/historico", async (req: Request<HistoricoQuery>, res: Response) => {
    try {
        const { user, agente } = req.query;

        console.log(user, agente)

        if (!agente || !user) {
            return res.status(500).json({
                status: false,
                historico: [],
                message: "user e agente são obrigatórios",
            })
        }
        const result = await coletarHistorico(Number(user), Number(agente));

        return res.status(200).json({
            status: true,
            historico: result,
            message: "Mensagens coletadas",
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            historico: [],
            message: "Erro interno no servidor",
        })
    }
})


routes.get("/api/v1/healths", (_: any, res: any) => {
    res.json({ status: "ok" });
});

export default routes;

// npm install --save-dev @types/cors