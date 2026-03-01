import {createServer} from "http";
import {env} from "./env";
import express, {Request, Response} from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import cardRoutes from "./routes/card.routes";
import deckRoutes from "./routes/deck.routes";
import {authenticateToken} from "./middlewares/auth.middleware";
import { socketAuthMiddleware } from "./middlewares/socket-auth.middleware";
import swaggerUi from "swagger-ui-express";
import { generateSwaggerSpec } from "./docs/index";
import { Server } from "socket.io";
import { setupGameEvents } from "./events/game.events";

export const app = express();

// Middlewares
app.use(
    cors({
        origin: true,  
        credentials: true,
    }),
);

app.use(express.json());

// Serve static files 
app.use(express.static('public'));

// Swagger UI configuration
const swaggerSpec = generateSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true,
    },
    customCss: '.topbar { display: none }',
    customSiteTitle: 'Pokedex TCG API - Documentation',
}));

// Health check endpoint
app.get("/api/health", (_req, res) => {
    res.json({status: "ok", message: "TCG Backend Server is running"});
});

// Auth routes
app.use("/api/auth", authRoutes);

// Cards routes 
app.use("/api/cards", cardRoutes);

// Decks routes 
app.use("/api/decks", deckRoutes);

// Route de test protégée 
app.get("/api/me", authenticateToken, (req: Request, res: Response) => {
    res.json({
        message: "Vous êtes authentifié",
        user: req.user,
    });
});

// Start server only if this file is run directly
if (require.main === module) {
    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io with authentication
    const io = new Server(httpServer, {
        cors: {
            origin: true,
            credentials: true,
        },
    });

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    // Setup game events (matchmaking, room creation, etc.)
    setupGameEvents(io);

    // Handle Socket.io connections
    io.on("connection", (socket) => {
        console.log(`✓ Utilisateur connecté: ${socket.data.email} (${socket.data.userId})`);

        // Send welcome message with user info
        socket.emit("authenticated", {
            message: "Authentification réussie",
            userId: socket.data.userId,
            email: socket.data.email,
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`✗ Utilisateur déconnecté: ${socket.data.email} (${socket.data.userId})`);
        });

        // Handle errors
        socket.on("error", (error) => {
            console.error(`Erreur Socket.io pour ${socket.data.email}:`, error);
        });
    });

    // Handle authentication errors
    io.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.io:", error.message);
    });

    // Start server
    try {
        httpServer.listen(env.PORT, () => {
            console.log(`\n Server is running on http://localhost:${env.PORT}`);
            console.log(` Socket.io Test Client available at http://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}