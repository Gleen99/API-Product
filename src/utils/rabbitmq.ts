import amqplib, { Connection, Channel } from "amqplib";
import logger from "./logger";
import Product from "../models/productModel";

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqplib.connect(process.env.RABBITMQ_URL as string);
        channel = await connection.createChannel();
        console.log("Connecté à RabbitMQ");
    } catch (error:any) {
        console.error("Erreur de connexion à RabbitMQ:", error.message);
        throw new Error("RabbitMQ Down");
    }
};

export const publishToQueue = async (queue: string, message: string) => {
    try {
        if (!channel) throw new Error("Le canal RabbitMQ n'est pas défini");
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message envoyé à la queue: ${queue}`);
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
            console.log("Connexion RabbitMQ fermée");
        }
    }  catch (error:any) {
        console.error("Erreur lors de la fermeture de RabbitMQ:", error.message);
    }
};

export async function startOrderConsumer() {
    try {
        if (!channel) {
            logger.warn("Le canal RabbitMQ n'est pas encore prêt. Tentative de reconnexion...");
            await connectRabbitMQ();
        }

        const queue = "orders_created";

        await channel.assertQueue(queue, { durable: true });

        logger.info(`En écoute sur la queue : ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const order = JSON.parse(msg.content.toString());
                    logger.info(`Commande reçue : ${JSON.stringify(order)}`);
        
                    const items = order.items;
        
                    for (const itemId of items) {
                        const productData = await Product.findOne({ _id: itemId });
                        if (productData) {
                            productData.stock = Math.max(productData.stock - 1, 0);
                            await productData.save();
                            logger.info(`Stock mis à jour pour l'article ${itemId}: ${productData.stock}`);
                        } else {
                            logger.warn(`Produit introuvable : ${itemId}`);
                        }
                    }
        
                    if (channel) {
                        channel.ack(msg);
                        logger.info("Message traité avec succès.");
                    }
                } catch (err) {
                    logger.error("Erreur lors du traitement du message RabbitMQ : ", err);
        
                    if (channel) {
                        channel.nack(msg, false, false);
                    }
                }
            }
        }, { noAck: false }); 
        
    } catch (error) {
        logger.error("Erreur dans le consumer RabbitMQ : ", error);
    }
}


