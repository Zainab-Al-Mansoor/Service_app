import { sequelize } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const runDatabaseInit = async () => {
  try {
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbHost = process.env.DB_HOST || 'localhost';

    console.log('Initializing database...');
    console.log('Note: Run schema.sql manually first:');
    console.log(`mysql -u${dbUser} -p -h${dbHost} < schema.sql`);

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful!');

    // Sync models
    await sequelize.sync({ force: false });
    console.log('Database models synced!');

    // Check if roles exist
    const { Role } = await import('../models');
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
    const { Category } = await import('../models');
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
    const { User } = await import('../models');
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
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

runDatabaseInit();
