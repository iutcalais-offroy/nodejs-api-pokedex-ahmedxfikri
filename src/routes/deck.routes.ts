/**
 * Routes pour les decks.
 */
import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
    createDeck,
    getMyDecks,
    getDeckById,
    updateDeck,
    deleteDeck,
} from "../controllers/deck.controller";

const router = Router();

// Toutes les routes sont protégées par l'authentification
router.use(authenticateToken);

/**
 * Crée un nouveau deck.
 * @route POST /api/decks
 * @returns {void} Retourne le deck créé avec ses cartes.
 * @throws {401} Token manquant.
 * @throws {400} Nom manquant ou cartes invalides.
 * @throws {500} Erreur serveur.
 */
router.post("/", createDeck);

/**
 * Liste tous les decks de l'utilisateur connecté.
 * @route GET /api/decks/mine
 * @returns {void} Retourne un tableau des decks de l'utilisateur.
 * @throws {401} Token manquant.
 * @throws {500} Erreur serveur.
 */
router.get("/mine", getMyDecks);

/**
 * Récupère un deck par son ID avec ses cartes.
 * @route GET /api/decks/:id
 * @param {string} id - ID du deck.
 * @returns {void} Retourne le deck avec ses cartes.
 * @throws {401} Token manquant.
 * @throws {400} ID invalide.
 * @throws {404} Deck introuvable.
 * @throws {403} Accès interdit.
 * @throws {500} Erreur serveur.
 */
router.get("/:id", getDeckById);

/**
 * Modifie un deck par son ID.
 * @route PATCH /api/decks/:id
 * @param {string} id - ID du deck.
 * @returns {void} Retourne le deck mis à jour avec ses cartes.
 * @throws {401} Token manquant.
 * @throws {400} ID invalide ou cartes invalides.
 * @throws {404} Deck introuvable.
 * @throws {403} Accès interdit.
 * @throws {500} Erreur serveur.
 */
router.patch("/:id", updateDeck);

/**
 * Supprime un deck par son ID.
 * @route DELETE /api/decks/:id
 * @param {string} id - ID du deck.
 * @returns {void} Retourne un message de confirmation.
 * @throws {401} Token manquant.
 * @throws {400} ID invalide.
 * @throws {404} Deck introuvable.
 * @throws {403} Accès interdit.
 * @throws {500} Erreur serveur.
 */
router.delete("/:id", deleteDeck);

export default router;
