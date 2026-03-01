import { prisma } from "../database";

/**
 * Interface pour une room de matchmaking
 */
interface Room {
  id: string;
  host: {
    userId: number;
    email: string;
    deckId: number;
  };
  player2?: {
    userId: number;
    email: string;
    deckId: number;
  };
  status: "waiting" | "playing";
  createdAt: Date;
}

/**
 * Service de gestion des rooms pour le matchmaking
 */
class RoomService {
  private rooms: Map<string, Room> = new Map();

  /**
   * Crée une nouvelle room
   */
  async createRoom(userId: number, email: string, deckId: number): Promise<Room | null> {
    // Vérifie que le deck existe et appartient à l'utilisateur
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: { deckCards: true },
    });

    if (!deck) {
      throw new Error("Deck introuvable");
    }

    if (deck.userId !== userId) {
      throw new Error("Ce deck ne vous appartient pas");
    }

    if (deck.deckCards.length !== 10) {
      throw new Error("Le deck doit contenir exactement 10 cartes");
    }

    // Crée la room
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room: Room = {
      id: roomId,
      host: { userId, email, deckId },
      status: "waiting",
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Récupère la liste des rooms disponibles (en attente)
   */
  getRooms(): Room[] {
    return Array.from(this.rooms.values()).filter((room) => room.status === "waiting");
  }

  /**
   * Rejoint une room existante
   */
  async joinRoom(
    roomId: string,
    userId: number,
    email: string,
    deckId: number,
  ): Promise<Room | null> {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("Room introuvable");
    }

    if (room.status === "playing") {
      throw new Error("La partie a déjà commencé");
    }

    // Vérifie que le deck existe et appartient à l'utilisateur
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: { deckCards: true },
    });

    if (!deck) {
      throw new Error("Deck introuvable");
    }

    if (deck.userId !== userId) {
      throw new Error("Ce deck ne vous appartient pas");
    }

    if (deck.deckCards.length !== 10) {
      throw new Error("Le deck doit contenir exactement 10 cartes");
    }

    // Ajoute le joueur 2 et change le status
    room.player2 = { userId, email, deckId };
    room.status = "playing";

    return room;
  }

  /**
   * Récupère une room par son ID
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Supprime une room
   */
  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }
}

export const roomService = new RoomService();
