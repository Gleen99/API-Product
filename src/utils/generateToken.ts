import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error("🚨 JWT_SECRET est introuvable ! Vérifie ton fichier .env !");
}

const generateToken = () => {
    const payload = { role: "api_product" };
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    console.log("Nouveau Token JWT :", accessToken);
};

generateToken();