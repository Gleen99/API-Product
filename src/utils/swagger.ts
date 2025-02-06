import swaggerJsDoc from "swagger-jsdoc";
import path from "path";
import productRoutes from "../routes/productRoutes";
import dotenv from "dotenv";

dotenv.config();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Products",
            version: "1.0.0",
            description: "Documentation API pour la gestion des produits",
        },
        servers: [
            {
                url: process.env.BACK_API_URL,
            },
        ],
    },
    apis: ["./src/routes/productRoutes.ts"]
};

const swaggerDocs = swaggerJsDoc(options);
export default swaggerDocs;