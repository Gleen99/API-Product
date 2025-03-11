import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

// Mock de RabbitMQ
jest.mock("../utils/rabbitmq", () => ({
    connectRabbitMQ: jest.fn(),
    startOrderConsumer: jest.fn(),
    publishToQueue: jest.fn(),
    closeRabbitMQ: jest.fn(),
}));

let mongoServer: MongoMemoryServer;
let testToken: string;

beforeAll(async () => {
    jest.setTimeout(50000);

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }

    // Générer un token JWT sécurisé pour les tests
    testToken = jwt.sign(
        { userId: "67ab1abe5905025733f3661f", role: "api_client" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("Product API", () => {
    it("Devrait retourner la liste des produits", async () => {
        const res = await request(app)
            .get("/api/products")
            .set("Authorization", `Bearer ${testToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it("Devrait créer un nouveau produit", async () => {
        const product = {
            name: "Produit Test",
            description: "Description test",
            price: 100,
            stock: 10
        };

        const res = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${testToken}`)
            .send(product);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe(product.name);
    });

    it("Devrait récupérer un produit par ID", async () => {
        const product = {
            name: "Produit Test 2",
            description: "Test",
            price: 50,
            stock: 5
        };

        const createdProduct = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${testToken}`)
            .send(product);

        const productId = createdProduct.body._id;

        const res = await request(app)
            .get(`/api/products/${productId}`)
            .set("Authorization", `Bearer ${testToken}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe(product.name);
    });

    it("Devrait mettre à jour un produit", async () => {
        const product = {
            name: "Produit à modifier",
            description: "Test update",
            price: 75,
            stock: 20
        };

        const createdProduct = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${testToken}`)
            .send(product);

        const updatedData = { name: "Produit Modifié", price: 120 };

        const res = await request(app)
            .put(`/api/products/${createdProduct.body._id}`)
            .set("Authorization", `Bearer ${testToken}`)
            .send(updatedData);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe(updatedData.name);
    });

    it("Devrait supprimer un produit", async () => {
        const product = {
            name: "Produit à supprimer",
            description: "Test delete",
            price: 60,
            stock: 15
        };

        const createdProduct = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${testToken}`)
            .send(product);

        const res = await request(app)
            .delete(`/api/products/${createdProduct.body._id}`)
            .set("Authorization", `Bearer ${testToken}`);

        expect(res.status).toBe(200);
    });
});
