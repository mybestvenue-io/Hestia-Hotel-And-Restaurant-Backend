require('dotenv').config();
const port = process.env.PORT || 5000;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connect } = require('./common/db/connection');

const app = express();

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'https://the-hestia-hotel-banquethalls.vercel.app'
        ];
        
        // Allow all Vercel preview deployments
        if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now to debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve TinyMCE static files from node_modules. This is the robust way.
app.use('/tinymce', express.static(path.dirname(require.resolve('tinymce'))));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const testImageRoutes = require('./routes/testImageRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contentRoutes = require('./routes/contentRoutes');

app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/hotel', hotelRoutes);
app.use('/api/v1/test', testImageRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/content', contentRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: {
            nodeVersion: process.version,
            port: port,
            mongoConfigured: !!process.env.MONGO_URI,
            imagekitConfigured: !!process.env.IMAGEKIT_PUBLIC_KEY
        }
    });
});

async function start() {
    await connect();
    app.listen(port, '0.0.0.0', () => console.log(`Server started on port ${port}`));
}

start().catch((err) => {
console.error('Failed to start server', err);
process.exit(1);
});
