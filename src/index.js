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

mongoose.connect('mongodb+srv://admin:9Kzy8IZlVvOpkYcc@dev.qei0ybm.mongodb.net/?retryWrites=true&w=majority&appName=dev')
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

// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ['GET', 'POST']
//     }
// })

useSheetWebSocket(wss)

// let sheets = {}
// const roomId = () => {
//     return new Date().getTime()


// }

// const connectedUsers = new Map()
// const rooms = new Map()
// const sheetSessions = {}

// wss.on('connection', (ws) => {
//     // Generate a unique ID for this connection
//     const sessionId = generateUniqueId();

//     // Store the connection with its ID
//     connectedUsers.set(sessionId, ws);

//     // Send the client its ID
//     // send(ws, {
//     //     type: 'connected',
//     //     sessionId: sessionId
//     // });

//     console.log(`New user connected: ${sessionId}`);

//     ws.on('message', async (messageData) => {
//         console.log(messageData)
//         // console.log(JSON.parse(messageData.toString('utf-8')))
//         // convert buffer to string

//         try {
//             const message = JSON.parse(messageData);
//             console.log(message)
//             // Handle different message types
//             const { sheetId, userId } = message;

//             switch (message.type) {
//                 case 'join':
//                     // if (!sheetId) send(ws, { success: false })
//                     await handleJoinSheet(userId, ws, sheetId);
//                     break;

//                 case 'undo':
//                     await handleUndo(userId, ws, sheetId)
//                     break;

//                 case 'redo':
//                     await handleRedo(userId, ws, sheetId)
//                     break;

//                 case 'editSheet':
//                     const { sheet } = message;
//                     delete sheet._id
//                     await handleEditSheet(userId, sheetId, sheet, ws);
//                     break;

//                 default:
//                     console.log(`Unknown message type: ${message.type}`);
//             }
//         } catch (error) {
//             console.error('Error processing message:', error);
//         }
//     });

//     ws.on('close', () => {
//         console.log(`Client disconnected`);

//         // Notify others when user leaves rooms
//         leaveAllRooms(sessionId);

//         // Remove client from our map
//         connectedUsers.delete(sessionId);
//     });

//     ws.on('error', (error) => {
//         console.error(`WebSocket error from ${sessionId}:`, error);
//     });
// });

// // Function to join a sheet room
// async function handleJoinSheet(userId, ws, sheetId) {
//     const roomName = `sheet/${sheetId}`;

//     // Add client to the room
//     if (!rooms.has(roomName)) {
//         rooms.set(roomName, new Set());
//     }
//     rooms.get(roomName).add(userId);

//     console.log(`User ${userId} joined sheet: ${sheetId}`);

//     // Get current sheet data (if it exists)
//     // const sheetData = sheets[sheetId];
//     let sheet = sheets[sheetId]
//     if (!sheets[sheetId]) {
//         sheet = await SheetService.get(sheetId)
//         sheets[sheetId] = sheet
//         if (!sheet) throw `Invalid sheetId ${sheetId}`
//     }

//     // Send the current sheet data to the newly joined user
//     send(ws, {
//         type: 'sheetInitialData',
//         sheetId: sheetId,
//         sheet: {
//             ...sheet,
//             versions: [],
//             version: sheet.versions[sheet.currentVersion]
//         },
//     });

//     // Notify all other users in this room that a new user joined
//     broadcastToRoom(ws, roomName, {
//         type: 'userJoinedSheet',
//         userId: userId,
//         sheetId: sheetId,
//         timestamp: new Date().toISOString()
//     }, userId);
// }

// async function handleUndo(userId, ws, sheetId) {
//     const sheet = sheets[sheetId]
//     if (!sheet) {
//         throw 'No sheet with this Id'
//     }

//     sheet.currentVersion--
//     sheets[sheetId] = sheet;

//     await SheetService.update(sheetId, sheet)

//     const roomName = `sheet/${sheetId}`;
//     broadcastToRoom(ws, roomName, {
//         type: 'sheetUpdated',
//         userId,
//         sheetId,
//         sheet: {
//             ...sheet,
//             versions: [],
//             version: sheet.versions[sheet.currentVersion]
//         },
//         timestamp: new Date().toISOString()
//     }, userId)
// }

// async function handleRedo(userId, ws, sheetId) {
//     const sheet = sheets[sheetId]
//     if (!sheet) {
//         throw 'No sheet with this Id'
//     }

//     if (sheet.currentVersion + 1 < sheet.versions.length) {
//         sheet.currentVersion++
//     }

//     sheets[sheetId] = sheet;

//     await SheetService.update(sheetId, sheet)

//     const roomName = `sheet/${sheetId}`;
//     broadcastToRoom(ws, roomName, {
//         type: 'sheetUpdated',
//         userId,
//         sheetId,
//         sheet: {
//             ...sheet,
//             versions: [],
//             version: sheet.versions[sheet.currentVersion]
//         },
//         timestamp: new Date().toISOString()
//     }, userId)
// }

// async function handleEditSheet(userId, sheetId, sheet, ws) {
//     const existingSheet = sheets[sheetId];
//     if (!existingSheet) {
//         console.log(`Sheet not found: ${sheetId}`);
//         return;
//     }

//     if (sheet.version) {
//         sheets[sheetId].versions.push(sheet.version)
//     }

//     await SheetService.update(sheetId, sheets[sheetId])
//     console.log(sheets[sheetId])

//     const roomName = `sheet/${sheetId}`;

//     // Broadcast the shapes to all other users in this sheet room
//     broadcastToRoom(ws, roomName, {
//         type: 'sheetUpdated',
//         sheetId: sheetId,
//         sheet: {
//             ...sheet,
//             versions: [],
//             version: sheet.versions[sheet.currentVersion]
//         },
//         // editorId: userId,
//         timestamp: new Date().toISOString()
//     }, userId);
// }

// // Function to handle client leaving all rooms
// function leaveAllRooms(userId) {
//     // Check each room for this client
//     for (const [roomName, members] of rooms.entries()) {
//         if (members.has(userId)) {
//             // Remove from the room
//             members.delete(userId);

//             // If it's a sheet room, notify others
//             if (roomName.startsWith('sheet/')) {
//                 const sheetId = roomName.split('/')[1];
//                 broadcastToRoom(ws, roomName, {
//                     type: 'userLeftSheet',
//                     userId: userId,
//                     sheetId: sheetId,
//                     timestamp: new Date().toISOString()
//                 });
//             }

//             // Clean up empty rooms
//             if (members.size === 0) {
//                 rooms.delete(roomName);
//             }
//         }
//     }
// }

// // Helper function to send formatted JSON messages
// function send(ws, data) {
//     ws.send(JSON.stringify(data));
// }

// // Helper function to broadcast to a room
// function broadcastToRoom(ws, roomName, data, excludeuserId = null) {
//     const roomMembers = rooms.get(roomName);
//     if (!roomMembers) return;

//     roomMembers.forEach(userId => {
//         // Skip the sender if specified
//         // if (excludeuserId && userId === excludeuserId) return;

//         const client = connectedUsers.get(userId);
//         send(ws, data);
//         // send(client, data);
//     });
// }

// // Generate a unique client ID
// function generateUniqueId() {
//     return Math.random().toString(36).substr(2, 9);
// }


// // Assuming you have your Socket.IO server set up as in your previous code
// io.on('connection', (socket) => {
//     console.log(`New client connected: ${socket.id}`);

//     // 1. Join Sheet Room
//     socket.on('joinSheet', (sheetId) => {
//         console.log(sheetId)
//         // Create the room name using the pattern
//         const roomName = `sheet/${sheetId}`;

//         // Join the room
//         socket.join(roomName);
//         console.log(`User ${socket.id} joined sheet: ${sheetId}`);

//         // Get current sheet data (if it exists)
//         const sheetData = sheets[sheetId] || null;

//         // Send the current sheet data to the newly joined user
//         socket.emit('sheetInitialData', {
//             sheetId,
//             data: sheetData
//         });

//         // Notify all other users in this room that a new user joined
//         socket.to(roomName).emit('userJoinedSheet', {
//             userId: socket.id,
//             sheetId,
//             timestamp: new Date().toISOString()
//         });
//     });

//     // 2. Edit Sheet
//     socket.on('editSheet', (data) => {
//         const { sheetId, changes } = data;

//         // Validate the sheet exists
//         const existingSheet = sheets[sheetId];
//         if (!existingSheet) {
//             console.log(`Sheet not found: ${sheetId}`);
//             return;
//         }

//         // Update the sheet with changes
//         // This is a simplified example. Your actual update logic might be more complex
//         // depending on your sheet structure
//         sheets[sheetId] = {
//             ...existingSheet,
//             ...changes,
//             lastModified: new Date().toISOString(),
//             lastModifiedBy: socket.id
//         };

//         // Create the room name using the pattern
//         const roomName = `sheet/${sheetId}`;

//         // Broadcast the changes to all other users in this sheet room
//         socket.to(roomName).emit('sheetUpdated', {
//             sheetId,
//             changes,
//             editorId: socket.id,
//             timestamp: new Date().toISOString()
//         });
//     });

//     // Handle disconnection - optionally notify others when someone leaves a sheet
//     socket.on('disconnect', () => {
//         console.log(`Client disconnected: ${socket.id}`);

//         // Get all rooms this socket was in
//         const rooms = Array.from(socket.rooms);

//         // For each room, if it's a sheet room, notify others
//         rooms.forEach(room => {
//             if (room.startsWith('sheet/')) {
//                 const sheetId = room.split('/')[1];
//                 io.to(room).emit('userLeftSheet', {
//                     userId: socket.id,
//                     sheetId,
//                     timestamp: new Date().toISOString()
//                 });
//             }
//         });
//     });
// });

// io.on('connection', (socket) => {
//     console.log(`New client connected: ${socket.id}`);

//     // Send a welcome message to the connected client
//     // socket.emit('welcome', { message: 'Welcome to the Socket.IO server!' });

//     // Broadcast to all clients except the sender
//     socket.broadcast.emit('newUser', { message: 'A new user has joined' });

//     // Edit an existing shape
//     socket.on('edit', (data) => {
//         console.log(`Received message from ${socket.id}:`, data);
//         const { sheetId, sheet } = data;

//         const existingSheet = sheets[sheetId]
//         if (!existingSheet) return console.log('wtf sheet not found')

//         sheets[sheetId] = sheet
//         // Echo the message back to the sender
//         // socket.emit('messageResponse', {
//         //     from: 'server',
//         //     content: `You said: ${data.content}`,
//         //     timestamp: new Date().toISOString()
//         // });

//         // Broadcast the message to all other clients
//         // socket.broadcast.emit('broadcastMessage', {
//         socket.broadcast.emit('handleEdit', {
//             from: socket.id,
//             content: sheets[sheetId],
//             timestamp: new Date().toISOString()
//         });
//     });

//     // Handle client joining a room
//     socket.on('join', (roomName) => {
//         socket.join(roomName);
//         console.log(`${socket.id} joined room: ${roomName}`);

//         // Notify everyone in the room
//         io.to(roomName).emit('roomNotification', {
//             message: `User ${socket.id} has joined ${roomName}`
//         });
//     });

//     // Handle room messages
//     socket.on('roomMessage', (data) => {
//         console.log(`Room message to ${data.room}:`, data.content);

//         // Send message to everyone in the room
//         io.to(data.room).emit('roomMessage', {
//             from: socket.id,
//             room: data.room,
//             content: data.content,
//             timestamp: new Date().toISOString()
//         });
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log(`Client disconnected: ${socket.id}`);
//         io.emit('userDisconnected', { id: socket.id });
//     });

//     // Error handling
//     socket.on('error', (error) => {
//         console.error(`Socket error from ${socket.id}:`, error);
//     });
// });
