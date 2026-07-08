"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const runDatabaseInit = async () => {
    try {
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbHost = process.env.DB_HOST || 'localhost';
        console.log('Initializing database...');
        console.log('Note: Run schema.sql manually first:');
        console.log(`mysql -u${dbUser} -p -h${dbHost} < schema.sql`);
        // Test connection
        await models_1.sequelize.authenticate();
        console.log('Database connection successful!');
        // Sync models
        await models_1.sequelize.sync({ force: false });
        console.log('Database models synced!');
        // Check if roles exist
        const { Role } = await Promise.resolve().then(() => __importStar(require('../models')));
        const rolesCount = await Role.count();
        if (rolesCount === 0) {
            console.log('Creating default roles...');
            await Role.bulkCreate([
                { role_name: 'customer', description: 'Regular customer who can browse and book services' },
                { role_name: 'provider', description: 'Service provider who can offer services' },
                { role_name: 'admin', description: 'Administrator with full access to the system' },
            ]);
            console.log('Default roles created!');
        }
        // Check if categories exist
        const { Category } = await Promise.resolve().then(() => __importStar(require('../models')));
        const categoriesCount = await Category.count();
        if (categoriesCount === 0) {
            console.log('Creating default categories...');
            await Category.bulkCreate([
                { name: 'Home Cleaning', description: 'Professional home cleaning services', sort_order: 1 },
                { name: 'Plumbing', description: 'Pipe repair, installation, and maintenance', sort_order: 2 },
                { name: 'Electrical', description: 'Electrical repairs and installations', sort_order: 3 },
                { name: 'Beauty & Wellness', description: 'Salon and spa services at home', sort_order: 4 },
                { name: 'Appliance Repair', description: 'Repair for home appliances', sort_order: 5 },
                { name: 'Painting', description: 'Interior and exterior painting services', sort_order: 6 },
                { name: 'AC Services', description: 'Air conditioning repair and maintenance', sort_order: 7 },
                { name: 'Pest Control', description: 'Professional pest management', sort_order: 8 },
            ]);
            console.log('Default categories created!');
        }
        // Create default admin user if not exists
        const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
        const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
        if (adminRole) {
            const existingAdmin = await User.findOne({ where: { email: 'admin@servicehub.com' } });
            if (!existingAdmin) {
                console.log('Creating default admin user...');
                // Pre-generated bcrypt hash for 'admin123456'
                const hashedPassword = '$2a$10$mzQsbSeanYJ.jKVPuIMvN.NhlBj1Ie2wwMLQK.pKhmTMNdlTBXwH2';
                await User.create({
                    email: 'admin@servicehub.com',
                    password: hashedPassword,
                    full_name: 'System Admin',
                    role_id: adminRole.id,
                    is_verified: true,
                    is_active: true,
                });
                console.log('Default admin user created!');
            }
        }
        console.log(`
=====================================================================
  Database initialization completed!
=====================================================================
  Default Admin Credentials:
  Email: admin@servicehub.com
  Password: admin123456

  IMPORTANT: Change this password after first login!
=====================================================================
    `);
        process.exit(0);
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
};
runDatabaseInit();
//# sourceMappingURL=initDatabase.js.map