import { criarHistoricoDeConversa } from "../../infra/dataBase/messages"
import { contato } from "../../infra/dataBase/contacts";
import type { Waba, Contact } from "../../adapters/interfaces/DataBaseInterface";
import { getWabaFilterWithPhoneNumber } from "../../infra/dataBase/waba";
import type { Metadata } from "../interfaces/MetaWebhook";

export async function handleHistoricoDeConversa(numeroDoContato: string, id_agent: number, repostaEnviada: string, tipoDaMensagem: string, mensagemRecebida: string, timesTampMensagem: string, status: string, dadosDoWaba: Metadata) {
    let respostaParaMensagem = repostaEnviada ?? "😔 Ops! Tivemos um pequeno imprevisto no momento.\nPedimos que tente novamente mais tarde.\n\n📞 Se for urgente, fale com a gente pelo número: +55 11 3164-7487\n\nA Gamefic agradece seu contato! 💙😊";

    const Waba = await getWabaFilterWithPhoneNumber(dadosDoWaba.phone_number_id);

    if (Waba) {
        const usuario = await contato(numeroDoContato, Waba.id);

        if (usuario.user) {
            const dadosUser: Contact = usuario.user
            await criarHistoricoDeConversa(
                dadosUser.id,
                id_agent,
                tipoDaMensagem,
                mensagemRecebida,
                respostaParaMensagem,
                timesTampMensagem,
                status
            )
        }
    }
}
