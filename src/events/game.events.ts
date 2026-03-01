import { Server, Socket } from "socket.io";
import { roomService } from "../services/room.service";

/**
 * Configure les événements Socket.io pour le matchmaking
 */
export const setupGameEvents = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    const email = socket.data.email;

    /**
     * Événement: Créer une room d'attente
     */
    socket.on("createRoom", async (data) => {
      try {
        const { deckId } = data;

        if (!deckId) {
          socket.emit("error", { message: "deckId manquant" });
          return;
        }

        const room = await roomService.createRoom(userId, email, deckId);

        if (!room) {
          socket.emit("error", { message: "Erreur lors de la création de la room" });
          return;
        }

        // Le créateur rejoint la room Socket.io
        socket.join(room.id);
        socket.data.roomId = room.id;

        // Envoyer la confirmation au créateur
        socket.emit("roomCreated", {
          roomId: room.id,
          message: "Room créée avec succès",
          room,
        });

        // Informer tous les clients de la nouvelle room disponible
        io.emit("roomsListUpdated", {
          rooms: roomService.getRooms(),
        });
      } catch (error) {
        socket.emit("error", { message: (error as Error).message });
      }
    });

    /**
     * Événement: Obtenir la liste des rooms disponibles
     */
    socket.on("getRooms", () => {
      const rooms = roomService.getRooms();
      socket.emit("roomsList", {
        rooms,
      });
    });

    /**
     * Événement: Rejoindre une room et démarrer la partie
     */
    socket.on("joinRoom", async (data) => {
      try {
        const { roomId, deckId } = data;

        if (!roomId || !deckId) {
          socket.emit("error", { message: "roomId ou deckId manquant" });
          return;
        }

        const room = await roomService.joinRoom(roomId, userId, email, deckId);

        if (!room) {
          socket.emit("error", { message: "Erreur lors de la jonction de la room" });
          return;
        }

        // Le joueur 2 rejoint la room Socket.io
        socket.join(roomId);
        socket.data.roomId = roomId;

        // Préparer l'état initial du jeu pour chaque joueur
        const gameState = {
          roomId: room.id,
          players: {
            host: {
              userId: room.host.userId,
              email: room.host.email,
              deckId: room.host.deckId,
            },
            opponent: {
              userId: room.player2!.userId,
              email: room.player2!.email,
              deckId: room.player2!.deckId,
            },
          },
        };

        // Envoyer l'état du jeu aux deux joueurs
        io.to(roomId).emit("gameStarted", gameState);

        // Informer tous les clients que la room n'est plus disponible
        io.emit("roomsListUpdated", {
          rooms: roomService.getRooms(),
        });
      } catch (error) {
        socket.emit("error", { message: (error as Error).message });
      }
    });

    /**
     * Événement: Déconnexion
     */
    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;

      if (roomId) {
        const room = roomService.getRoom(roomId);

        // Si c'est le host qui se déconnecte, supprimer la room
        if (room && room.host.userId === userId) {
          roomService.deleteRoom(roomId);

          // Informer les clients de la mise à jour
          io.emit("roomsListUpdated", {
            rooms: roomService.getRooms(),
          });
        }
      }
    });
  });
};