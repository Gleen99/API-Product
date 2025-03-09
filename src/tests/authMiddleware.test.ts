import authMiddleware from "../middlewares/authMiddleware";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;
    let validToken: string;
    let invalidToken: string;

    beforeEach(() => {
        req = {
            headers: {}
        } as Partial<Request>;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as Partial<Response>;
        next = jest.fn();

        // Générer un token valide pour les tests
        validToken = jwt.sign(
            { userId: "67ab1abe5905025733f3661f", role: "api_client" },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        invalidToken = "invalid_token";
    });

    it("Devrait refuser une requête avec un token manquant", () => {
        req.headers = {};
        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Accès non autorisé : Token manquant" });
        expect(next).not.toHaveBeenCalled();
    });

    it("Devrait refuser une requête avec un token invalide", () => {
        req.headers = { authorization: `Bearer ${invalidToken}` };
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Accès non autorisé : Token invalide" });
        expect(next).not.toHaveBeenCalled();
    });

    it("Devrait autoriser la requête avec un token valide", () => {
        req.headers = { authorization: `Bearer ${validToken}` };
        (jwt.verify as jest.Mock).mockReturnValue({ userId: "67ab1abe5905025733f3661f", role: "api_client" });

        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("Devrait refuser une requête si le token est expiré", () => {
        req.headers = { authorization: `Bearer ${validToken}` };
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("jwt expired");
        });

        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Accès non autorisé : Token invalide" });
        expect(next).not.toHaveBeenCalled();
    });

    it("Devrait refuser une requête si le token a un format incorrect", () => {
        req.headers = { authorization: "InvalidFormat" };
        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Accès non autorisé : Format de token incorrect" });
        expect(next).not.toHaveBeenCalled();
    });
});
