import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/productModel";
import { publishToQueue } from "../utils/rabbitmq";
import logger from "../utils/logger";


export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find();
        logger.info("Produits récupérés avec succès");
        res.json(products);
    } catch (error) {
        logger.error("Erreur lors de la récupération des produits", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn("ID produit invalide");
            res.status(400).json({ message: "ID produit invalide" });
            return;
        }
        const product = await Product.findById(id);
        if (!product) {
            logger.warn("Produit non trouvé");
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        logger.info(`Produit récupéré: ${id}`);
        res.json(product);
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            logger.warn("ID produit invalide (CastError)");
            res.status(400).json({ message: "ID produit invalide" });
            return;
        }
        logger.error("Erreur lors de la récupération du produit", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        await publishToQueue("product_created", JSON.stringify(newProduct));
        logger.info(`Produit créé: ${newProduct._id}`);
        res.status(201).json(newProduct);
    } catch (error) {
        logger.error("Erreur lors de la création du produit", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            logger.warn("Produit non trouvé pour mise à jour");
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        await publishToQueue("product_updated", JSON.stringify(updatedProduct));
        logger.info(`Produit mis à jour: ${req.params.id}`);
        res.json(updatedProduct);
    } catch (error) {
        logger.error("Erreur lors de la mise à jour du produit", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn("ID produit invalide");
            res.status(400).json({ message: "ID produit invalide" });
            return;
        }
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            logger.warn("Produit non trouvé pour suppression");
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        await publishToQueue("product_deleted", JSON.stringify(deletedProduct));
        logger.info(`Produit supprimé: ${id}`);
        res.json({ message: "Produit supprimé" });
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            logger.warn("ID produit invalide (CastError)");
            res.status(400).json({ message: "ID produit invalide" });
            return;
        }
        logger.error("Erreur lors de la suppression du produit", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
