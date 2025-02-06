import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
    client?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    let token = req.header("Authorization")?.split(" ")[1] || process.env.DEFAULT_ACCESS_TOKEN;

    if (!token) {
        res.status(401).json({ message: "Accès refusé, token manquant" });
        return;
    }

    try {
        const SECRET_KEY = process.env.JWT_SECRET || "supersecret";
        const decoded = jwt.verify(token, SECRET_KEY);
        req.client = decoded;
        next();
    } catch (error: any) {
        console.error("Erreur JWT :", error.message);
        res.status(401).json({ message: "Token invalide ou expiré" });
    }
};