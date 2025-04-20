import SheetService from "./service.sheet.js";

export default function (wss) {

    let sheets = {}

    const connectedUsers = new Map()
    const rooms = new Map()

    wss.on('connection', (ws) => {
        // Generate a unique ID for this connection
        const sessionId = generateUniqueId()



        console.log(`New user connected: ${sessionId}`);

        ws.on('message', async (messageData) => {
            console.log(messageData)
            // console.log(JSON.parse(messageData.toString('utf-8')))
            // convert buffer to string

            try {
                const message = JSON.parse(messageData);
                console.log(message)
                // Handle different message types
                const { sheetId, userId } = message;

                switch (message.type) {
                    case 'join':
                        // if (!sheetId) send(ws, { success: false })
                        await handleJoinSheet(userId, ws, sheetId);
                        break;

                    case 'undo':
                        await handleUndo(userId, ws, sheetId)
                        break;

                    case 'redo':
                        await handleRedo(userId, ws, sheetId)
                        break;

                    case 'editSheet':
                        const { sheet } = message;
                        delete sheet._id
                        await handleEditSheet(userId, sheetId, sheet, ws);
                        break;
                    case 'cursorMove':
                        const { position } = message;
                        await handleCursorMove(userId, sheetId, position, ws);
                        break;


                    default:
                        console.log(`Unknown message type: ${message.type}`);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on('close', () => {
            console.log(`Client disconnected - gotta handle this at some point`);


        });

        ws.on('error', (error) => {
            console.error(`WebSocket error from ${sessionId}:`, error);
        });
    });

    // Function to join a sheet room
    async function handleJoinSheet(userId, ws, sheetId) {

        const roomName = `sheet/${sheetId}`;

        // Add user to the room
        if (!rooms.has(roomName)) {
            rooms.set(roomName, new Set());
        }
        rooms.get(roomName).add(userId);

        console.log(`User ${userId} joined sheet: ${sheetId}`);

        // Get current sheet data (if it exists)
        // const sheetData = sheets[sheetId];
        let sheet = sheets[sheetId]
        if (!sheets[sheetId]) {
            sheet = await SheetService.get(sheetId)
            sheets[sheetId] = sheet
            if (!sheet) throw `Invalid sheetId ${sheetId}`
        }

        // Send the current sheet data to the newly joined user
        send(ws, {
            type: 'sheetInitialData',
            sheetId: sheetId,
            sheet: {
                ...sheet,
                versions: [],
                version: sheet.versions[sheet.currentVersion],
                versionCount: sheet.versions.length,
            },
        });

        // Notify all other users in this room that a new user joined
        broadcastToRoom(ws, roomName, {
            type: 'userJoinedSheet',
            userId: userId,
            sheetId: sheetId,
            timestamp: new Date().toISOString()
        }, userId);
    }

    async function handleUndo(userId, ws, sheetId) {
        const sheet = sheets[sheetId]
        if (!sheet) {
            throw 'No sheet with this Id'
        }

        sheet.currentVersion--
        sheets[sheetId] = sheet;

        await SheetService.update(sheetId, sheet)

        const roomName = `sheet/${sheetId}`;
        broadcastToRoom(ws, roomName, {
            type: 'sheetUpdated',
            userId,
            sheetId,
            sheet: {
                ...sheet,
                versions: [],
                version: sheet.versions[sheet.currentVersion],
                versionCount: sheet.versions.length,
            },
            timestamp: new Date().toISOString()
        }, userId)
    }

    async function handleRedo(userId, ws, sheetId) {
        const sheet = sheets[sheetId]
        if (!sheet) {
            throw 'No sheet with this Id'
        }

        if (sheet.currentVersion + 1 < sheet.versions.length) {
            sheet.currentVersion++
        }

        sheets[sheetId] = sheet;

        await SheetService.update(sheetId, sheet)

        const roomName = `sheet/${sheetId}`;
        broadcastToRoom(ws, roomName, {
            type: 'sheetUpdated',
            userId,
            sheetId,
            sheet: {
                ...sheet,
                versions: [],
                version: sheet.versions[sheet.currentVersion],
                versionCount: sheet.versions.length,
            },
            timestamp: new Date().toISOString()
        }, userId)
    }

    async function handleEditSheet(userId, sheetId, sheet, ws) {
        const existingSheet = sheets[sheetId];
        if (!existingSheet) {
            console.log(`Sheet not found: ${sheetId}`);
            return;
        }

        if (sheet.version) {
            // If we're not at the latest version, truncate the versions array
            if (existingSheet.currentVersion < existingSheet.versions.length - 1) {
                // Remove all versions after the current one
                existingSheet.versions = existingSheet.versions.slice(0, existingSheet.currentVersion + 1);
            }

            // Now push the new version and increment currentVersion
            existingSheet.versions.push(sheet.version);
            existingSheet.currentVersion++;
        }
        
        sheets[sheetId] = existingSheet;

        await SheetService.update(sheetId, existingSheet);

        const roomName = `sheet/${sheetId}`;

        const sheetToReturn = {
            ...sheets[sheetId],
            versions: [],
            version: sheets[sheetId].versions[sheets[sheetId].currentVersion],
            versionCount: sheets[sheetId].versions.length,
        };

        console.log(sheetToReturn);

        broadcastToRoom(ws, roomName, {
            type: 'sheetUpdated',
            sheetId: sheetId,
            sheet: sheetToReturn,
            timestamp: new Date().toISOString()
        }, userId);
    }


    async function handleCursorMove(userId, sheetId, position, ws) {
        const roomName = `sheet/${sheetId}`;

        // Check if room exists
        if (!rooms.has(roomName)) {
            console.log(`Room not found: ${roomName}`);
            return;
        }

        // Initialize cursor positions for this sheet if needed
        if (!cursorPositions.has(sheetId)) {
            cursorPositions.set(sheetId, new Map());
        }

        // Store the user's cursor position
        cursorPositions.get(sheetId).set(userId, position);

        // Broadcast cursor position to all users in the room
        broadcastToRoom(ws, roomName, {
            type: 'cursorUpdated',
            userId,
            sheetId,
            position,
            timestamp: new Date().toISOString()
        }, userId);
    }


    // Helper function to send formatted JSON messages
    function send(ws, data) {
        ws.send(JSON.stringify(data));
    }

    // Helper function to broadcast to a room
    function broadcastToRoom(ws, roomName, data, excludeuserId = null) {
        const roomMembers = rooms.get(roomName);
        if (!roomMembers) return;

        roomMembers.forEach(userId => {
            // Skip the sender if specified
            // if (excludeuserId && userId === excludeuserId) return;

            // const client = connectedUsers.get(userId);
            send(ws, data);
            // send(client, data);
        });
    }

    // Generate a unique client ID
    function generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }
}