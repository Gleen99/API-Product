import express, { Router } from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController";
import authMiddleware from "../middlewares/authMiddleware";

const router: Router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API de gestion des produits
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer tous les produits
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Liste des produits retournée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware, getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Récupérer un produit par son ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit à récupérer
 *     responses:
 *       200:
 *         description: Produit trouvé
 *       404:
 *         description: Produit non trouvé
 */
router.get("/:id", authMiddleware, getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Ajouter un nouveau produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé (JWT manquant ou invalide)
 */
router.post("/", authMiddleware, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Modifier un produit existant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 *       404:
 *         description: Produit non trouvé
 *       401:
 *         description: Non autorisé (JWT manquant ou invalide)
 */
router.put("/:id", authMiddleware, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit à supprimer
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       404:
 *         description: Produit non trouvé
 *       401:
 *         description: Non autorisé (JWT manquant ou invalide)
 */
router.delete("/:id", authMiddleware, deleteProduct);

export default router;