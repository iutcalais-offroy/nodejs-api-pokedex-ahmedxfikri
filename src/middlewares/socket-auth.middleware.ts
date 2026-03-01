import jwt from "jsonwebtoken";
import { env } from "../env";
import { Socket } from "socket.io";

/**
 * Middleware d'authentification pour Socket.io.
 * Vérifie le token JWT dans socket.handshake.auth.token.
 * @param {Socket} socket - Socket.io socket instance.
 * @param {Function} next - Callback pour passer au middleware suivant.
 * @returns {void} Accepte ou rejette la connexion.
 * @throws {Error} Token manquant, invalide ou expiré.
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token manquant"));
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: number;
      email: string;
      iat?: number;
      exp?: number;
    };

    // Ajouter les informations utilisateur au socket
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error("Token expiré"));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error("Token invalide"));
    }
    return next(new Error("Erreur lors de l'authentification"));
  }
};
