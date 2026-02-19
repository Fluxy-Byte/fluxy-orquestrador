import axios from "axios";
import { SdrInterface } from "../interfaces/sdrInterface";
import { Metadata } from '../../services/interfaces/MetaWebhook';
import { waba } from '../../infra/dataBase/waba';

/**
 * Envia mensagem ao ADK e retorna a resposta em texto
 */
export async function getAnwser(
  mensagem: string,
  phone: string,
  MENSAGM_DEFAULT: string,
  metadados: Metadata
): Promise<string> {
  try {
    const resultSession = await createSession(phone, metadados); // Criando sessão de usuário no ADK (ou reutilizando se já existir)
    console.log(resultSession)
    const urlAgente = (await waba(metadados.phone_number_id, metadados.display_phone_number)).waba?.agent.url ?? "https://fluxe-sdr.egnehl.easypanel.host"
    const nameAgente = (await waba(metadados.phone_number_id, metadados.display_phone_number)).waba?.agent.name ?? "fluxy"
    const sessionOk =
      resultSession.status === 200 ||
      (resultSession.status === 400 &&
        resultSession.data?.error?.includes("Session already exists"));

    console.log(urlAgente)

    if (sessionOk == false) {
      console.log(`\n\n💥 Erro ao criar sessão do usuario: ${JSON.stringify(resultSession)}`);
      return MENSAGM_DEFAULT;
    }

    const response = await axios.post(
      `${urlAgente}/run`,
      {
        appName: nameAgente,
        userId: phone,
        sessionId: phone,
        newMessage: {
          role: "user",
          parts: [
            {
              text: mensagem
            }
          ]
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        validateStatus: (status: number) => status >= 200 && status < 500
      }
    );

    if (response.status !== 200) {
      console.error("Erro ao rodar agente:", response.data);
      return MENSAGM_DEFAULT;
    }

    const body: SdrInterface[] = response.data;

    const resposta = body.find((b) =>
      b.content.parts.some((p) => "text" in p)
    );

    const textPart = resposta?.content.parts.find(
      (p): p is { text: string } => "text" in p
    );
    
    return textPart?.text ?? MENSAGM_DEFAULT;

  } catch (error) {
    handleAxiosError(error, "getAnwser");
    return MENSAGM_DEFAULT;
  }
}

/**
 * Cria sessão no ADK (ou reutiliza se já existir)
 */
async function createSession(phone: string, metadados: Metadata) {
  try {
    const urlAgente = (await waba(metadados.phone_number_id, metadados.display_phone_number)).waba?.agent.url ?? "https://fluxe-sdr.egnehl.easypanel.host"

    const nameAgente = (await waba(metadados.phone_number_id, metadados.display_phone_number)).waba?.agent.name ?? "fluxy"

    const url = `${urlAgente}/apps/${nameAgente}/users/${phone}/sessions/${phone}`
    console.log(url)
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          "Content-Type": "application/json"
        },
        validateStatus: (status: number) => status === 200 || status === 400
      }
    );

    return {
      status: response.status,
      data: response.data ?? {}
    };

  } catch (error) {
    handleAxiosError(error, "createSession");

    return {
      status: 500,
      data: {}
    };
  }
}

/**
 * Centraliza tratamento de erro Axios
 */
function handleAxiosError(error: unknown, origem: string) {
  if (axios.isAxiosError(error)) {
    console.error(`❌ Erro Axios em ${origem}`);

    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("URL:", error.config?.url);

  } else {
    console.error(`❌ Erro desconhecido em ${origem}`, error);
  }
}
