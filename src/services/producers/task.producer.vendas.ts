
import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import type { Task } from '../../adapters/interfaces/BodySendToCampaing';

export async function createTaskVendas(task: Task) {
    try {
        console.log(task)
        const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
        const channel = await getConectionTheChannel()
        console.log(`🟠 Criou na fila vendas`);
        const queue = `task.${nomeFila}.vendas.create`
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
            persistent: true
        })
        return;
    } catch (e: any) {
        console.log("Erro ao iniciar conexão com rabbitmq: " + e)
    }
}