import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../database";

/**
 * Récupère toutes les cartes Pokémon triées par numéro Pokédex.
 * @route GET /api/cards
 * @param {Request} _req - Requête Express (non utilisée).
 * @param {Response} res - Réponse Express.
 * @returns {Promise<void>} Retourne un tableau contenant toutes les cartes.
 * @throws {500} Erreur serveur.
 */
export const getAllCards = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const cartes = await prisma.card.findMany({
            orderBy: { pokedexNumber: "asc" },
        });
        res.status(StatusCodes.OK).json(cartes);
    } catch (error) {
        console.error("Erreur lors de la récupération des cartes:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            erreur: "Erreur serveur",
            message: "Impossible de récupérer les cartes.",
        });
    }
};