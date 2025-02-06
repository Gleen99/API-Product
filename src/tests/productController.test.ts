import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController";
import Product from "../models/productModel";
import { Request, Response } from "express";
import { publishToQueue } from "../utils/rabbitmq";

jest.mock("../models/productModel");
jest.mock("../utils/rabbitmq");

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

    it("Devrait retourner une erreur 500 si `getProducts` échoue", async () => {
        (Product.find as jest.Mock).mockRejectedValue(new Error("Erreur MongoDB"));
        await getProducts(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it(" Devrait retourner une erreur 404 si `getProductById` ne trouve rien", async () => {
        req = { params: { id: "12345" } };
        (Product.findById as jest.Mock).mockResolvedValue(null);

        await getProductById(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it(" Devrait retourner une erreur 500 si `createProduct` échoue", async () => {
        req = { body: { name: "Produit Test", price: 100 } };
        (Product.prototype.save as jest.Mock).mockRejectedValue(new Error("Erreur MongoDB"));

        await createProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("Devrait retourner une erreur 500 si `updateProduct` échoue", async () => {
        req = { params: { id: "12345" }, body: { name: "Produit Modifié" } };
        (Product.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("Erreur MongoDB"));

        await updateProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("Devrait retourner une erreur 404 si `deleteProduct` ne trouve rien", async () => {
        req = { params: { id: "12345" } };
        (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

        await deleteProduct(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});