"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from public directory
app.use(express_1.default.static('public'));
// API Routes
app.use('/api', routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        await (0, database_1.testConnection)();
        // Sync database (in development)
        if (process.env.NODE_ENV === 'development') {
            await database_1.sequelize.sync({ alter: false });
            console.log('Database synced successfully');
        }
        // Start server
        app.listen(PORT, () => {
            console.log(`
=====================================================================
  On-Demand Service Backend Server
=====================================================================
  Server running on: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  API Base URL: http://localhost:${PORT}/api
=====================================================================
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map