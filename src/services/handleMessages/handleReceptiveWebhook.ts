import { MetaWebhook, Metadata } from '../interfaces/MetaWebhook';
import { createTaskReceptive } from "../producers/task.producer.receptive";
import { getAudio } from "../../adapters/microsservico/getAudio";
import type { Message } from "../interfaces/MetaWebhook";
import { sendMenssagem } from "../../adapters/microsservico/sendMenssage";
import { getAnwser } from "../../adapters/tools/getAnwser";

interface ReseultGetAudio {
    status: boolean,
    data: string
}

export async function HandleReceptiveWebhook(task: MetaWebhook) {
    try {
        let mensagemAnswer = process.env.MENSAGM_DEFAULT ?? "😔 Ops! Tivemos um pequeno imprevisto no momento.\nPedimos que tente novamente mais tarde.\n\n📞 Se for urgente, fale com a gente pelo número: +55 11 3164-7487\n\nA Gamefic agradece seu contato! 💙😊"

        const taskMessage = task.entry[0];
        const dadosDaMesagen = taskMessage.changes[0];

        if (dadosDaMesagen.value.messages) {

            const bodyDaMenssage = dadosDaMesagen.value.messages;
            const metadados = dadosDaMesagen.value.metadata;
            const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

            const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false; // Tipo da mensagem: Text / Audio
            const idMensagem = dadosDoBodyDaMensagem?.id || false; // Id da mensagem para usar na resposta
            const numeroDoContato = dadosDoBodyDaMensagem?.from || false; // Numero do contato que esta enviando mensgem
            const idWaba = taskMessage.id; // Id do waba para saber do numero e agente
            console.log(`Mensagem recebida do numero: ${metadados.display_phone_number} 📲`)

            if (idMensagem && numeroDoContato) {

                if (tipoDaMensagem === "audio") {
                    mensagemAnswer = await tratarMensagensDeAudio( // Converte o audio e retorna mensagem gerada pelo agente
                        dadosDoBodyDaMensagem,
                        numeroDoContato,
                        mensagemAnswer,
                        metadados
                    );

                } else if (tipoDaMensagem === "text") {
                    mensagemAnswer = await tratarMensagensDeTexto( // Gerada mensagem pelo agente
                        dadosDoBodyDaMensagem,
                        numeroDoContato,
                        mensagemAnswer,
                        metadados
                    );
                }

                await sendBodyToMenssage( // Envia para growth como mensagem normal
                    idMensagem,
                    numeroDoContato,
                    mensagemAnswer,
                    metadados.phone_number_id
                )

                await createTaskReceptive({
                    bodyTask: task,
                    resposta: mensagemAnswer
                });

            }
            console.log('---------💚 Tratamento de mensagem concluida---------');
        }

    } catch (err) {
        console.log('---------❌ Erro ao processar webhook---------');
        console.error(err);
    }
}


async function tratarMensagensDeAudio(dados: Message, numeroDoContato: string, MENSAGM_DEFAULT: string, metadados: Metadata) {
    try {
        const urlAudio = dados.audio?.url;
        const idAudio = dados.audio?.id;
        let mensagem = MENSAGM_DEFAULT;

        if (urlAudio && idAudio) {

            const resultgGetAudio: ReseultGetAudio = await getAudio(idAudio, MENSAGM_DEFAULT);

            if (resultgGetAudio.status && resultgGetAudio.data) {
                let result = resultgGetAudio.data
                mensagem = await getAnwser(result, numeroDoContato, MENSAGM_DEFAULT, metadados);
            }

            return mensagem
        } else {
            return mensagem
        }
    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de audio: " + e);
        return MENSAGM_DEFAULT
    }
}

async function tratarMensagensDeTexto(dados: Message, numeroDoContato: string, MENSAGM_DEFAULT: string, metadados: Metadata) {
    try {
        let responseToUser = MENSAGM_DEFAULT;

        if (dados.text?.body) {
            const mensagemUser = dados.text?.body;
            responseToUser = await getAnwser(mensagemUser, numeroDoContato, MENSAGM_DEFAULT, metadados);
        }

        return responseToUser;
    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de texto: " + e);
        return MENSAGM_DEFAULT;
    }
}

async function sendBodyToMenssage(idMensagem: string, numeroDoContato: string, consultaResposta: string, phone_number_id: string) {
    try {

        const listaDeRespostas = await splitText(consultaResposta);

        for (const mensagem of listaDeRespostas) {

            await sendMenssagem({
                mensagem,
                idMensagem,
                numeroDoContato,
                phone_number_id
            })

            await new Promise(r => setTimeout(r, 20000))
        }
    } catch (e: any) {
        console.log("Erro ao enviar mensagem: " + e)
    }
}

async function splitText(text: string, limit = 2800) {
    const parts = []
    let current = ""
    for (const word of text.split(" ")) {
        if ((current + " " + word).length > limit) {
            parts.push(current)
            current = word
        } else {
            current += (current ? " " : "") + word
        }
    }
    if (current) parts.push(current)
    return parts
}