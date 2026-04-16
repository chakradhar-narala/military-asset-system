require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection Logic
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/military-assets';

// Obscure password for logging
const logURI = dbURI.replace(/:([^:@]{1,})@/, ':****@');
console.log(`[STRATEGIC INTEL] Targeting Database: ${logURI}`);

mongoose.connect(dbURI)
    .then(() => console.log('✓ SUCCESS: MongoDB Connected'))
    .catch(async (err) => {
        console.error('⚠ CONNECTION REFUSED: The target database did not respond.');
        console.log('Possible Causes:');
        console.log(' 1. Your current IP is not whitelisted in MongoDB Atlas.');
        console.log(' 2. Your network/DNS does not support SRV records (ECONNREFUSED).');
        console.log(' 3. The credentials in .env are incorrect.');
        
        if (dbURI.includes('mongodb+srv')) {
            console.log('\n[FALLBACK] Attempting connection to Local Sector Database...');
            try {
                await mongoose.connect('mongodb://localhost:27017/military-assets');
                console.log('✓ LOCAL FALLBACK SUCCESSFUL: Running on local assets.');
            } catch (localErr) {
                console.error('CRITICAL: Local Database also unreachable. Ensure MongoDB is running locally.');
            }
        }
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/transactions', require('./routes/transactions'));

// Dynamic Base Listing for Filters
app.get('/api/bases', async (req, res) => {
    try {
        const bases = await mongoose.model('Asset').distinct('baseId');
        res.json(bases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
