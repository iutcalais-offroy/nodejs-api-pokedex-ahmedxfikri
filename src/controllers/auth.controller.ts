import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../database";
import { env } from "../env";

/**
 * Interface pour les données de création de compte
 */
interface SignUpBody {
    email: string;
    username: string;
    password: string;
}

/**
 * Interface pour les données de connexion
 */
interface SignInBody {
    email: string;
    password: string;
}

/**
 * Génère un token JWT pour l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @returns {string} Token JWT valide 7 jours
 */
const generateToken = (userId: number, email: string): string => {
    return jwt.sign(
        { userId, email },
        env.JWT_SECRET,
        { expiresIn: "7d" } // Valide pendant 7 jours
    );
};

/**
 * Inscription d'un nouvel utilisateur.
 * @route POST /api/auth/sign-up
 * @param {Request<{}, {}, SignUpBody>} req - Requête contenant l'email, le nom d'utilisateur et le mot de passe.
 * @param {Response} res - Réponse Express.
 * @returns {Promise<void>} Retourne un token JWT et les informations utilisateur.
 * @throws {400} Données manquantes ou invalides.
 * @throws {409} Email ou nom d'utilisateur déjà utilisé.
 * @throws {500} Erreur serveur.
 */
export const signUp = async (
    req: Request<{}, {}, SignUpBody>,
    res: Response
): Promise<void> => {
    try {
        const { email, username, password } = req.body;

        // Vérifie que toutes les données sont présentes
        if (!email || !username || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({
                erreur: "Données manquantes",
                message: "Veuillez fournir un email, un nom d'utilisateur et un mot de passe.",
            });
            return;
        }

        // Vérifie le format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                erreur: "Email invalide",
                message: "Le format de l'email est incorrect.",
            });
            return;
        }

        // Vérifie la longueur du mot de passe
        if (password.length < 6) {
            res.status(StatusCodes.BAD_REQUEST).json({
                erreur: "Mot de passe trop court",
                message: "Le mot de passe doit contenir au moins 6 caractères.",
            });
            return;
        }

        // Vérifie si l'email est déjà utilisé
        const utilisateurExistant = await prisma.user.findUnique({
            where: { email },
        });

        if (utilisateurExistant) {
            res.status(StatusCodes.CONFLICT).json({
                erreur: "Email déjà utilisé",
                message: "Cet email est déjà enregistré.",
            });
            return;
        }

        // Vérifie si le nom d'utilisateur est déjà utilisé
        const usernameExistant = await prisma.user.findUnique({
            where: { username },
        });

        if (usernameExistant) {
            res.status(StatusCodes.CONFLICT).json({
                erreur: "Nom d'utilisateur déjà pris",
                message: "Ce nom d'utilisateur est déjà pris.",
            });
            return;
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur
        const utilisateur = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Génération du token JWT
        const token = generateToken(utilisateur.id, utilisateur.email);

        // Réponse avec les informations utilisateur et le token
        res.status(StatusCodes.CREATED).json({
            token,
            utilisateur,
        });
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            erreur: "Erreur serveur",
            message: "Une erreur est survenue lors de la création du compte.",
        });
    }
};

/**
 * Connexion d'un utilisateur.
 * @route POST /api/auth/sign-in
 * @param {Request<{}, {}, SignInBody>} req - Requête contenant l'email et le mot de passe.
 * @param {Response} res - Réponse Express.
 * @returns {Promise<void>} Retourne un token JWT et les informations utilisateur.
 * @throws {400} Données manquantes.
 * @throws {401} Identifiants incorrects.
 * @throws {500} Erreur serveur.
 */
export const signIn = async (
    req: Request<{}, {}, SignInBody>,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Vérifie que toutes les données sont présentes
        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({
                erreur: "Données manquantes",
                message: "Veuillez fournir un email et un mot de passe.",
            });
            return;
        }

        // Recherche de l'utilisateur par email
        const utilisateur = await prisma.user.findUnique({
            where: { email },
        });

        if (!utilisateur) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                erreur: "Identifiants incorrects",
                message: "Email ou mot de passe invalide.",
            });
            return;
        }

        // Vérifie le mot de passe
        const motDePasseValide = await bcrypt.compare(password, utilisateur.password);

        if (!motDePasseValide) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                erreur: "Identifiants incorrects",
                message: "Email ou mot de passe invalide.",
            });
            return;
        }

        // Génération du token JWT
        const token = generateToken(utilisateur.id, utilisateur.email);

        // Réponse avec les informations utilisateur et le token
        res.status(StatusCodes.OK).json({
            token,
            utilisateur: {
                id: utilisateur.id,
                email: utilisateur.email,
                username: utilisateur.username,
                createdAt: utilisateur.createdAt,
                updatedAt: utilisateur.updatedAt,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            erreur: "Erreur serveur",
            message: "Une erreur est survenue lors de la connexion.",
        });
    }
};
