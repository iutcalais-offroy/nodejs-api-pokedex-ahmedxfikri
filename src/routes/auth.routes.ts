/**
 * Routes d'authentification.
 */
import { Router } from "express";
import { signUp, signIn } from "../controllers/auth.controller";

const router = Router();

/**
 * Inscription d'un nouvel utilisateur.
 * @route POST /api/auth/sign-up
 * @returns {void} Retourne un token JWT et les informations utilisateur.
 * @throws {400} Données manquantes ou invalides.
 * @throws {409} Email ou nom d'utilisateur déjà utilisé.
 * @throws {500} Erreur serveur.
 */
router.post("/sign-up", signUp);

/**
 * Connexion d'un utilisateur.
 * @route POST /api/auth/sign-in
 * @returns {void} Retourne un token JWT et les informations utilisateur.
 * @throws {400} Données manquantes.
 * @throws {401} Identifiants incorrects.
 * @throws {500} Erreur serveur.
 */
router.post("/sign-in", signIn);

export default router;
