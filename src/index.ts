import {createServer} from "http";
import {env} from "./env";
import express, {Request, Response} from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import cardRoutes from "./routes/card.routes";
import deckRoutes from "./routes/deck.routes";
import {authenticateToken} from "./middlewares/auth.middleware";
import swaggerUi from "swagger-ui-express";
import { generateSwaggerSpec } from "./docs/index";

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