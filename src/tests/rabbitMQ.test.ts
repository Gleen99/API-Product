import { connectRabbitMQ, publishToQueue, closeRabbitMQ } from "../utils/rabbitmq";
import amqplib from "amqplib";

jest.mock("amqplib");

describe("RabbitMQ Utils", () => {
    let mockChannel: any;
    let mockConnection: any;

    beforeAll(async () => {
        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
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

    it(" Devrait se connecter à RabbitMQ", async () => {
        expect(amqplib.connect).toHaveBeenCalled();
        expect(mockConnection.createChannel).toHaveBeenCalled();
    });

    it("Devrait envoyer un message à la queue", async () => {
        await publishToQueue("test_queue", "Hello, RabbitMQ!");
        expect(mockChannel.assertQueue).toHaveBeenCalledWith("test_queue", { durable: true });
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith("test_queue", Buffer.from("Hello, RabbitMQ!"));
    });

    it(" Devrait fermer proprement RabbitMQ", async () => {
        await closeRabbitMQ();
        expect(mockChannel.close).toHaveBeenCalled();
        expect(mockConnection.close).toHaveBeenCalled();
    });
});