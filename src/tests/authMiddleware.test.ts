import { authMiddleware } from "../middlewares/authMiddleware";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe(" Auth Middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        process.env.DEFAULT_ACCESS_TOKEN ;
    });

    it(" Devrait refuser une requête avec un token manquant", () => {
        req.header = jest.fn().mockReturnValue(undefined);
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Token invalide ou expiré" });
        expect(next).not.toHaveBeenCalled();
    });

    it("Devrait refuser une requête avec un token invalide", () => {
        req.header = jest.fn().mockReturnValue("Bearer invalid_token");
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Token invalide ou expiré" });
        expect(next).not.toHaveBeenCalled();
    });

    it(" Devrait autoriser la requête avec un token valide", () => {
        req.header = jest.fn().mockReturnValue("Bearer valid_token");
        (jwt.verify as jest.Mock).mockReturnValue({ role: "api_client" });

        authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});