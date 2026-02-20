import 'dotenv/config'
import routes from "./src/routes/route";
import { connectRabbit } from "./src/infra/rabbitMQ/conection";
import { startTaskWorkerCampaign } from './src/services/workes/task.worker.campaign';
import { startTaskWorkerReceptive } from './src/services/workes/task.worker.receptive';
import { startTaskWorkerVendas } from './src/services/workes/task.worker.vendas';
import { connectMongo } from './src/infra/dataBase/messages';
import { createAdminUserWithAccess } from './src/infra/dataBase/query';
import bcrypt from "bcryptjs"

const PORT = process.env.PORT || 5304;

async function start() {
  try {

    await connectRabbit();
    await startTaskWorkerCampaign();
    await startTaskWorkerReceptive();
    await startTaskWorkerVendas()
    await connectMongo();
    const passwordHash = await bcrypt.hash("12345678", 10)

    await createAdminUserWithAccess({
      name: "Admin Master",
      email: "admin@sistema.com",
      passwordHash,
    })
  } catch (e) {
    console.log(e)
  } finally {
    routes.listen(PORT, () => {
      console.log(`🚀 API rodando na porta http://localhost:${PORT} ou https://fluxe-orquestrador.egnehl.easypanel.host`);
      console.log(`📚 Swagger em http://localhost:${PORT}/api/v1/docs ou https://fluxe-orquestrador.egnehl.easypanel.host/api/v1/docs`);
    });
  }
}

start()