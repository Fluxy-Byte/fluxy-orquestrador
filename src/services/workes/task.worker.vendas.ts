// Onde o worker executa

import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import { sendCampaing } from "../../adapters/microsservico/sendCampaing";
import { handleHistoricoDeConversa } from "../tools/handleHistoricoDeConversa"
import { Task, LeadRegister } from "../../adapters/interfaces/BodySendToCampaing"
import { updateContactObejtivoLead } from "../../infra/dataBase/contacts";

export async function startTaskWorkerVendas() {
  const channel = getConectionTheChannel()
  const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "gamefic";
  const phoneNumberIdWaba = process.env.PHONE_NUMBER_ID ?? "1021940604341981";
  const queue = `task.${nomeFila}.vendas.create`
  const dlq = `task.${nomeFila}.vendas.dlq`

  await channel.assertQueue(dlq, { durable: true })

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: dlq
  })

  channel.prefetch(1)

  channel.consume(queue, async (msg: any) => {
    if (!msg) return

    const bodyVendas: Task = JSON.parse(msg.content.toString())
    console.log("🟠 Body recebido das vendas: " + bodyVendas)

    try {
      if (!bodyVendas.dados.telefone) {
        console.log('❌ Tarefa não concluida pois não tem numero para disparo');
        channel.ack(msg);
        return;
      }

      let bodyPayload;
      const dadosLead: LeadRegister = bodyVendas.dados;
      if (bodyVendas.name_template == "lead_register") {
        bodyPayload = {
          "phone_number_id": phoneNumberIdWaba,
          "payload": {
            messaging_product: "whatsapp",
            to: dadosLead.telefoneAgente,
            type: "template",

            template: {
              name: bodyVendas.name_template,

              language: {
                code: "pt_BR"
              },

              components: [
                {
                  "type": "header",
                  "parameters": [
                    {
                      "type": "text",
                      "text": dadosLead.nomeAgente
                    }
                  ]
                },
                {
                  "type": "body",
                  "parameters": [
                    {
                      "type": "text",
                      "text": dadosLead.nome
                    },
                    {
                      "type": "text",
                      "text": dadosLead.telefone
                    },
                    {
                      "type": "text",
                      "text": dadosLead.produto
                    },
                    {
                      "type": "text",
                      "text": dadosLead.nivelInteresse
                    }
                  ]
                }

              ]
            }
          }
        }
      } else if (bodyVendas.name_template == "chegou_mais_um_lead") {
        const dadosLead: LeadRegister = bodyVendas.dados;

        bodyPayload = {
          "phone_number_id": phoneNumberIdWaba,
          "payload": {
            messaging_product: "whatsapp",
            to: bodyVendas.dados.telefone,
            type: "template",

            template: {
              name: bodyVendas.name_template,

              language: {
                code: "pt_BR"
              },

              components: [
                {
                  "type": "body",
                  "parameters": [
                    {
                      "type": "text",
                      "text": dadosLead.nome
                    }
                  ]
                }

              ]
            }
          }
        }
      }

      let result = await sendCampaing(bodyPayload);
      console.log("Resposta do microsserviço de envio: " + JSON.stringify(result.data));

      const metadados = {
        display_phone_number: "553491713923",
        phone_number_id: "872884792582393"
      }

      // Esse handle é só para alimentar o histórico de conversa, ele não tem relação com o resultado do envio da mensagem, ou seja, mesmo que a mensagem não seja enviada por algum motivo, a tentativa de envio vai ser registrada no histórico de conversa.
      handleHistoricoDeConversa(bodyVendas.dados.telefone, bodyVendas.name_template, "template", "oi", String(new Date()), 'enviado', metadados)

      // Atualiza o objetivo do lead para o template que foi enviado, isso é útil para ter uma visão mais clara do objetivo do lead na base de contatos.
      updateContactObejtivoLead(bodyVendas.dados.telefone, bodyVendas.dados.nome, bodyVendas.dados.objetivoLead ?? 'Objetivo não foi informado');

      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ');
      channel.nack(msg, false, false)
    }
  })
}
