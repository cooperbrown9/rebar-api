import express from 'express'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

import Routes from './routes/index.js'
import { SheetService } from './routes/sheet/index.js';
import { useSheetWebSocket } from './routes/sheet/index.js';
import Auth from './routes/auth/index.js';

const PORT = process.env.PORT || 8000
const app = express()


app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        callback(null, true);
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '100mb' }));

// Log which worker is handling the request (for demonstration)
app.use((req, res, next) => {
    console.log(`Worker ${process.pid} handling request: ${req.method} ${req.url}`, 'LOOK', req.query);
    next();
});

app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request query before auth:', req.query);
    next();
});
/**
 * Force every route to go through authentication (except public auth routes)
 */
app.use('/api',
    Auth.Middleware.authenticate,
    Routes
)

mongoose.connect(process.env.MONGO_URI)
    .then(async (db) => {
        console.log(`💾 DB Connected - Worker ${process.pid}`);
    })
    .catch((e) => console.log(e));

const server = http.createServer(app)


server.listen(PORT, () => {
    console.log('bruh')
    console.log('listening on ', PORT)
})

const wss = new WebSocketServer({
    server: server,
    path: '/ws'
})

useSheetWebSocket(wss)
