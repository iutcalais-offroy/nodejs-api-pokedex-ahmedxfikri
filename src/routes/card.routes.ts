/**
 * Routes pour les cartes Pokémon.
 */
import { Router } from "express";
import { getAllCards } from "../controllers/card.controller";

const router = Router();

/**
 * Récupère toutes les cartes Pokémon triées par numéro Pokédex.
 * @route GET /api/cards
 * @returns {void} Retourne un tableau contenant toutes les cartes.
 * @throws {500} Erreur serveur.
 */
router.get("/", getAllCards);

export default router;