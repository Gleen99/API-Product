import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app, { connectToDatabase, startServer } from "../index";

jest.mock("../utils/rabbitmq", () => ({
  connectRabbitMQ: jest.fn(),
  startOrderConsumer: jest.fn()
}));
jest.mock("../models/productModel", () => {
  return {
      __esModule: true,
      default: {
          find: jest.fn(),
          findById: jest.fn(),
          findByIdAndUpdate: jest.fn(),
          findByIdAndDelete: jest.fn(),
          create: jest.fn(),
          prototype: {
              save: jest.fn(),
          },
      },
  };
});
describe("Index.ts - Tests généraux", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.env.MONGO_URI = mongoUri;
    await connectToDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("Devrait répondre sur la route principale de l'API", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(401);
  });

  it("Devrait exposer les métriques Prometheus", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.text).toContain("nodejs");
  });

  it("Devrait gérer une erreur de connexion MongoDB", async () => {
    // Sauvegarder la méthode d'origine
    const originalConnect = mongoose.connect;
    // Forcer une erreur lors de la connexion
    (mongoose.connect as jest.Mock) = jest.fn().mockRejectedValue(new Error("Connection failed"));
    
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    await connectToDatabase();

    expect(consoleErrorMock).toHaveBeenCalledWith(
      expect.stringContaining("Erreur MongoDB"),
      expect.any(Error)
    );

    consoleErrorMock.mockRestore();
    // Restaurer la méthode d'origine
    mongoose.connect = originalConnect;
  });

  it("Devrait tester le démarrage du serveur", () => {
    const consoleLogMock = jest.spyOn(console, "log").mockImplementation();
    const listenMock = jest.spyOn(app, "listen").mockImplementation((port, callback) => {
        if (callback) callback();
        return {} as any;
    });

    process.env.NODE_ENV = "production";
    startServer();

    expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringContaining("Serveur en écoute sur le port")
    );

    consoleLogMock.mockRestore();
    listenMock.mockRestore();
});
});
