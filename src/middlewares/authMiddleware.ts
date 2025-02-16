import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
    client?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    let token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Accès refusé, token manquant" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded;
        next();
    } catch (error: any) {
        console.error("Erreur JWT :", error.message);
        res.status(401).json({ message: "Token invalide ou expiré" });
    }
};