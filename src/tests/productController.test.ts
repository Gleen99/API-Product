import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController";
import Product from "../models/productModel";
import { Request, Response } from "express";
import mongoose from "mongoose";
import logger from "../utils/logger";

jest.mock("../models/productModel");

describe("Product Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            json: jsonMock,
            status: statusMock,
        };
    });

    it("Devrait retourner une erreur 500 si getProducts échoue", async () => {
        (Product.find as jest.Mock).mockRejectedValue(new Error("Erreur MongoDB"));
        await getProducts(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Erreur serveur" });
    });

    it("Devrait retourner une erreur 404 si getProductById ne trouve rien", async () => {
        req = { params: { id: new mongoose.Types.ObjectId().toString() } }; // ID valide mais inexistant
        (Product.findById as jest.Mock).mockResolvedValue(null);

        await getProductById(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Produit non trouvé" });
    });

    it("Devrait retourner une erreur 400 si l’ID est invalide dans getProductById", async () => {
        req = { params: { id: "invalid_id" } }; // ID invalide

        await getProductById(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ message: "ID produit invalide" });
    });

    it("Devrait retourner une erreur 500 si createProduct échoue", async () => {
        req = { body: { name: "Produit Test", price: 100 } };
        (Product.prototype.save as jest.Mock).mockRejectedValue(new Error("Erreur MongoDB"));

        await createProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Erreur serveur" });
    });

    it("Devrait retourner une erreur 500 si updateProduct échoue", async () => {
        req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: { name: "Produit Modifié" } };
        (Product.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("Erreur MongoDB"));

        await updateProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Erreur serveur" });
    });

    it("Devrait retourner une erreur 404 si deleteProduct ne trouve rien", async () => {
        req = { params: { id: new mongoose.Types.ObjectId().toString() } }; // ID valide mais inexistant
        (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

        await deleteProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Produit non trouvé" });
    });

    it("Devrait retourner une erreur 400 si l’ID est invalide dans deleteProduct", async () => {
        req = { params: { id: "invalid_id" } }; // ID invalide

        await deleteProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ message: "ID produit invalide" });
    });

    describe("Tests de simulation des erreurs", () => {
        it("Devrait gérer une CastError dans getProductById et retourner une erreur 400", async () => {
            req = { params: { id: new mongoose.Types.ObjectId().toString() } };
            const castError = new mongoose.Error.CastError("ObjectId", "invalid", "path");
            (Product.findById as jest.Mock).mockRejectedValueOnce(castError);
            const loggerWarnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

            await getProductById(req as Request, res as Response);

            expect(loggerWarnSpy).toHaveBeenCalledWith("ID produit invalide (CastError)");
            expect(res.status).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "ID produit invalide" });
        });

        it("Devrait retourner une erreur 404 si aucun produit n'est trouvé pour mise à jour dans updateProduct", async () => {
            req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: { name: "Produit Modifié" } };
            (Product.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);
            const loggerWarnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

            await updateProduct(req as Request, res as Response);

            expect(loggerWarnSpy).toHaveBeenCalledWith("Produit non trouvé pour mise à jour");
            expect(res.status).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Produit non trouvé" });
        });

        it("Devrait gérer une CastError dans deleteProduct et retourner une erreur 400", async () => {
            req = { params: { id: new mongoose.Types.ObjectId().toString() } };
            const castError = new mongoose.Error.CastError("ObjectId", "invalid", "path");
            (Product.findByIdAndDelete as jest.Mock).mockRejectedValueOnce(castError);
            const loggerWarnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

            await deleteProduct(req as Request, res as Response);

            expect(loggerWarnSpy).toHaveBeenCalledWith("ID produit invalide (CastError)");
            expect(res.status).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "ID produit invalide" });
        });
    });
});
