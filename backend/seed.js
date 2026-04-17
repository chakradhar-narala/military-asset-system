require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const { Asset, Transaction } = require('./models/asset');

const seed = async () => {
    try {
        const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/military-assets';
        await mongoose.connect(dbURI);
        console.log(`Seeding database at ${dbURI.replace(/:([^:@]{1,})@/, ':****@')} ...`);

        // Clear existing
        await User.deleteMany({});
        await Asset.deleteMany({});

        // Create Users
        const admin = new User({ username: 'commander', password: 'password123', role: 'Admin' });
        const logistics = new User({ username: 'logistics_pro', password: 'password123', role: 'Logistics Officer' });
        const commanderAlpha = new User({ username: 'alpha_lead', password: 'password123', role: 'Base Commander', baseId: 'Sector Alpha' });

        await admin.save();
        await logistics.save();
        await commanderAlpha.save();

        // Create Initial Assets
        const assetData = [
            { name: 'M4A1 Carbine', equipmentType: 'Weapon', baseId: 'Sector Alpha', quantity: 50 },
            { name: 'Humvee', equipmentType: 'Vehicle', baseId: 'Sector Alpha', quantity: 5 },
            { name: '5.56mm Ammo Crate', equipmentType: 'Ammo', baseId: 'Sector Bravo', quantity: 100 }
        ];
        
        const createdAssets = await Asset.insertMany(assetData);

        // Create initial "Purchase" transactions for these assets
        const initialTransactions = createdAssets.map(asset => ({
            assetId: asset._id,
            transactionType: 'Purchase',
            toBase: asset.baseId,
            performedBy: admin._id,
            date: new Date()
        }));
        await Transaction.insertMany(initialTransactions);

        console.log("Data seeded successfully!");
        console.log("Logins (pwd: password123): commander, logistics_pro, alpha_lead");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
