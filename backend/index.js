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

if (!process.env.JWT_SECRET) {
    console.warn('⚠ CRITICAL WARNING: JWT_SECRET is not defined in environment variables. Authentication will fail.');
}

// Diagnostic Health Check
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED";
    res.json({ 
        status: "STRATEGIC INTEL: ONLINE", 
        database: dbStatus,
        message: "Military Asset Management API is operational.",
        timestamp: new Date().toISOString()
    });
});

// Database Connection Logic
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/military-assets';

// Obscure password for logging
const logURI = dbURI.replace(/:([^:@]{1,})@/, ':****@');
console.log(`[STRATEGIC INTEL] Targeting Database: ${logURI}`);

mongoose.connect(dbURI)
    .then(() => console.log('✓ SUCCESS: MongoDB Connected Successfully'))
    .catch(async (err) => {
        console.error('⚠ CONNECTION ERROR: The target database did not respond.');
        console.error(`Error Details: ${err.message}`);
        
        if (dbURI.includes('localhost') || !process.env.MONGO_URI) {
            console.log('\n[FALLBACK] Attempting connection to Local Sector Database...');
            try {
                await mongoose.connect('mongodb://localhost:27017/military-assets');
                console.log('✓ LOCAL FALLBACK SUCCESSFUL: Running on local assets.');
            } catch (localErr) {
                console.error('CRITICAL: Local Database also unreachable. Ensure MongoDB is running locally.');
            }
        } else {
            console.error('CRITICAL: Remote connection failed. Local fallback skipped in production-like environment.');
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
