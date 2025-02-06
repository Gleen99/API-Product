import { Request, Response } from "express";
import Product from "../models/productModel";
import { publishToQueue } from "../utils/rabbitmq";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();

        await publishToQueue("product_created", JSON.stringify(newProduct));

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }

        await publishToQueue("product_updated", JSON.stringify(updatedProduct));

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }

        await publishToQueue("product_deleted", JSON.stringify(deletedProduct));

        res.json({ message: "Produit supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};