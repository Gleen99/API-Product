import Product from "../models/productModel";
import startOrderConsumer, { connectRabbitMQ, publishToQueue, closeRabbitMQ } from "../utils/rabbitmq";
import amqplib from "amqplib";

jest.mock("amqplib");
jest.mock("../models/productModel", () => ({
    findOne: jest.fn()
}));

describe("RabbitMQ Utils", () => {
    let mockChannel: any;
    let mockConnection: any;
    let mockMsg: any;

    beforeAll(async () => {
        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn(),
            nack: jest.fn(),
            close: jest.fn()
        };
        mockConnection = {
            createChannel: jest.fn().mockResolvedValue(mockChannel),
            close: jest.fn()
        };

        (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);
        await connectRabbitMQ();
    });

    afterAll(async () => {
        await closeRabbitMQ();
    });

    it("Devrait se connecter à RabbitMQ", async () => {
        expect(amqplib.connect).toHaveBeenCalled();
        expect(mockConnection.createChannel).toHaveBeenCalled();
    });

    it("Devrait envoyer un message à la queue", async () => {
        await publishToQueue("test_queue", "Hello, RabbitMQ!");
        expect(mockChannel.assertQueue).toHaveBeenCalledWith("test_queue", { durable: true });
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith("test_queue", Buffer.from("Hello, RabbitMQ!"));
    });

    it("Devrait fermer proprement RabbitMQ", async () => {
        await closeRabbitMQ();
        expect(mockChannel.close).toHaveBeenCalled();
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it("Devrait écouter et traiter un message correctement", async () => {
        // Simule une commande avec des articles
        const fakeOrder = {
            data: { items: ["product123"] }
        };
    
        mockMsg = {
            content: Buffer.from(JSON.stringify(fakeOrder))
        };
    
        // Simule un produit existant en base de données
        (Product.findOne as jest.Mock).mockResolvedValueOnce({
            stock: 10,
            save: jest.fn()
        });
    
        // Simule le comportement du consume et appelle la callback avec le message
        mockChannel.consume.mockImplementation((_queue: any, callback: any) => {
            callback(mockMsg);
        });
    
        await startOrderConsumer();
    

        await new Promise((resolve) => setTimeout(resolve, 100));
    
        expect(mockChannel.assertQueue).toHaveBeenCalledWith("order_retrieved", { durable: true });
        expect(Product.findOne).toHaveBeenCalledWith({ _id: "product123" });
        expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    });    

    it("Devrait ne pas traiter un message invalide", async () => {
        mockMsg = {
            content: Buffer.from("message_invalide")
        };

        mockChannel.consume.mockImplementation((_queue: any, callback: any) => {
            callback(mockMsg);
        });

        await startOrderConsumer();

        expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);
    });
});
