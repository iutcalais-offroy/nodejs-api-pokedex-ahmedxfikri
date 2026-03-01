import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware pour vérifier le token JWT dans l'en-tête Authorization.
 * Ajoute userId et email dans req.user si le token est valide.
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Fonction pour passer au middleware suivant.
 * @returns {void} Appelle next() si le token est valide, sinon retourne une erreur.
 * @throws {401} Token manquant, invalide ou expiré.
 * @throws {500} Erreur serveur.
 */
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Récupérer le token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                erreur: "Non autorisé",
                message: "Token manquant. Format attendu : Authorization: Bearer <token>.",
            });
            return;
        }

        // Extraire le token
        const token = authHeader.substring(7);

        if (!token) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                erreur: "Non autorisé",
                message: "Token manquant.",
            });
            return;
        }

        try {
            // Vérifier et décoder le token
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
                userId: number;
                email: string;
                iat?: number;
                exp?: number;
            };

            // Ajouter userId et email à la requête
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
            };

            // Passer au prochain middleware ou à la route
            next();
        } catch (error) {
            // Gérer les erreurs de token
            if (error instanceof jwt.TokenExpiredError) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    erreur: "Non autorisé",
                    message: "Token expiré.",
                });
                return;
            }

            res.status(StatusCodes.UNAUTHORIZED).json({
                erreur: "Non autorisé",
                message: "Token invalide.",
            });
            return;
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            erreur: "Erreur serveur",
            message: "Une erreur est survenue lors de la vérification du token.",
        });
        return;
    }
};
