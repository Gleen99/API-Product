import amqplib, { Connection, Channel } from "amqplib";

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqplib.connect(process.env.RABBITMQ_URL as string);
        channel = await connection.createChannel();
        console.log(" Connecté à RabbitMQ");
    } catch (error:any) {
        console.error(" Erreur de connexion à RabbitMQ:", error.message);
        throw new Error("RabbitMQ Down");
    }
};

export const publishToQueue = async (queue: string, message: string) => {
    try {
        if (!channel) throw new Error("Le canal RabbitMQ n'est pas défini");
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`📩 Message envoyé à la queue: ${queue}`);
    }  catch (error:any)  {
        console.error(`Erreur d'envoi du message à RabbitMQ:`, error.message);
        throw error;
    }
};

export const closeRabbitMQ = async () => {
    try {
        if (channel) {
            await channel.close();
            console.log(" Canal RabbitMQ fermé");
        }
        if (connection) {
            await connection.close();
            console.log(" Connexion RabbitMQ fermée");
        }
    }  catch (error:any) {
        console.error(" Erreur lors de la fermeture de RabbitMQ:", error.message);
    }
};