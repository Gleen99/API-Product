import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import productRoutes from "./routes/productRoutes";
import { connectRabbitMQ } from "./utils/rabbitmq";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./utils/swagger";
import { metricsEndpoint } from "./utils/metrics";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api/products", productRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connexion à RabbitMQ
connectRabbitMQ();

// Exposition des métriques Prometheus
app.get("/metrics", metricsEndpoint);


 // se connecte à MongoDB et loggue le résultat.
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connecté");
  } catch (err) {
    console.error("Erreur MongoDB :", err);
  }
};

export const startServer = (): void => {
  const PORT =
    process.env.NODE_ENV === "test" ? process.env.TEST_PORT : process.env.PORT;
  app.listen(PORT, () =>
    console.log(`Serveur en écoute sur le port ${PORT}`)
  );
};

if (require.main === module) {
  connectToDatabase();
  startServer();
}

export default app;
