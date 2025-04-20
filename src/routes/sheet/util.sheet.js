// IGNORE - NOT DOING ROPE STRUCTURE FOR DEMO
//  websocket util for shape updates

async function handleShapeUpdateEvent(message, client, canvasId) {
    try {
        if (!isValidShapeUpdate(message)) {
            return { error: "Invalid shape update format" };
        }

        const { shapeId, properties, timestamp, clientId, version } = message;

        const conflicts = await detectConflicts(shapeId, version, canvasId);
        if (conflicts.hasConflicts) {
            
            const resolution = await resolveConflicts(conflicts, message, canvasId);
            if (resolution.error) {
                return resolution;
            }

            return await applyShapeUpdate(resolution.operation, canvasId);
        }

        return await applyShapeUpdate(message, canvasId);
    } catch (error) {
        console.error("Error handling shape update:", error);
        return { error: "Internal server error" }; // todo: better errors
    }
}

function isValidShapeUpdate(message) {
    return (
        message &&
        typeof message === 'object' &&
        typeof message.shapeId === 'string' &&
        typeof message.properties === 'object' &&
        typeof message.timestamp === 'number' &&
        typeof message.clientId === 'string' &&
        typeof message.version === 'number'
    );
}

async function detectConflicts(shapeId, version, canvasId) {
    const shapeNode = await RopeNode.findByShapeId(canvasId, shapeId);

    if (!shapeNode) {
        return {
            hasConflicts: true,
            type: 'SHAPE_NOT_FOUND',
            currentState: null
        };
    }

    if (shapeNode.metadata.version > version) {
        return {
            hasConflicts: true,
            type: 'VERSION_CONFLICT',
            clientVersion: version,
            serverVersion: shapeNode.metadata.version,
            currentState: shapeNode
        };
    }

    return { hasConflicts: false };
}

async function applyShapeUpdate(operation, canvasId) {
    const { shapeId, properties, timestamp, clientId, version } = operation;

    const shapeNode = await RopeNode.findById(shapeId);

    if (!shapeNode) {
        return { error: `Shape with ID ${shapeId} not found` };
    }

    // update the props - keep old ones and add new ones
    const updatedProps = {
        ...shapeNode.shapeProps.toObject(),
        ...properties
    };

    const updatedShape = await RopeNode.findByIdAndUpdate(
        shapeId,
        {
            $set: {
                'shapeProps': updatedProps,
                'metadata.lastModified': new Date(timestamp),
                'metadata.lastModifiedBy': clientId,
                'metadata.version': version
            }
        },
        { new: true }
    );

    if (!updatedShape) {
        return { error: "Failed to update shape" };
    }

    await OperationLog.create({
        type: 'SHAPE_UPDATE',
        canvasId,
        shapeId,
        position: shapeNode.position,
        properties,
        clientId,
        version,
        timestamp: new Date(timestamp)
    });

    return {
        success: true,
        shape: updatedShape
    };
}

async function resolveConflicts(conflicts, incomingOperation, canvasId) {
    if (conflicts.type === 'SHAPE_NOT_FOUND') {
        return {
            error: `Cannot update shape ${incomingOperation.shapeId}: shape not found`
        };
    }

    if (conflicts.type === 'VERSION_CONFLICT') {
        return await applyOperationalTransform(
            incomingOperation,
            conflicts.currentState,
            canvasId
        );
    }

    return { error: `Unknown conflict type: ${conflicts.type}` };
}

async function applyOperationalTransform(operation, currentState, canvasId) {
    const { shapeId, properties, timestamp, clientId, version } = operation;

    // get all ops since client version
    const subsequentOperations = await OperationLog.find({
        canvasId,
        shapeId,
        version: { $gt: version }
    }).sort({ version: 1 });

    if (subsequentOperations.length === 0) {
        return {
            operation: {
                ...operation,
                version: currentState.metadata.version + 1
            }
        };
    }

    const transformedProperties = { ...properties };

    for (const op of subsequentOperations) {
        const opProperties = op.properties.toObject();

        if ('x' in opProperties && 'x' in transformedProperties) {
            transformedProperties.x = resolvePositionConflict(
                transformedProperties.x,
                opProperties.x,
                currentState.shapeProps.x
            );
        }

        if ('y' in opProperties && 'y' in transformedProperties) {
            transformedProperties.y = resolvePositionConflict(
                transformedProperties.y,
                opProperties.y,
                currentState.shapeProps.y
            );
        }

        if ('width' in opProperties && 'width' in transformedProperties) {
            transformedProperties.width = resolvePositionConflict(
                transformedProperties.width,
                opProperties.width,
                currentState.shapeProps.width
            );
        }

        if ('height' in opProperties && 'height' in transformedProperties) {
            transformedProperties.height = resolvePositionConflict(
                transformedProperties.height,
                opProperties.height,
                currentState.shapeProps.height
            );
        }

        // COMBAK rotation is weird cause of the circle
        if ('rotation' in opProperties && 'rotation' in transformedProperties) {
            transformedProperties.rotation = resolveRotationConflict(
                transformedProperties.rotation,
                opProperties.rotation,
                currentState.shapeProps.rotation
            );
        }

        // PRIORITIZE LAST WRITER
        for (const prop of ['fill', 'stroke', 'strokeWidth']) {
            if (prop in opProperties && prop in transformedProperties) {
            }
        }

        if ('text' in opProperties && 'text' in transformedProperties) {
            // could do diff here
        }

        if (currentState.shapeProps.shapeType === 'circle' ||
            currentState.shapeProps.shapeType === 'ellipse') {
            if ('radius' in opProperties && 'radius' in transformedProperties) {
                transformedProperties.radius = resolvePositionConflict(
                    transformedProperties.radius,
                    opProperties.radius,
                    currentState.shapeProps.radius
                );
            }
            if ('radiusX' in opProperties && 'radiusX' in transformedProperties) {
                transformedProperties.radiusX = resolvePositionConflict(
                    transformedProperties.radiusX,
                    opProperties.radiusX,
                    currentState.shapeProps.radiusX
                );
            }
            if ('radiusY' in opProperties && 'radiusY' in transformedProperties) {
                transformedProperties.radiusY = resolvePositionConflict(
                    transformedProperties.radiusY,
                    opProperties.radiusY,
                    currentState.shapeProps.radiusY
                );
            }
        }

        if ('points' in opProperties && 'points' in transformedProperties) {
            transformedProperties.points = resolvePointsConflict(
                transformedProperties.points,
                opProperties.points,
                currentState.shapeProps.points
            );
        }

        if ('customAttrs' in opProperties && 'customAttrs' in transformedProperties) {
            // just merge together
            transformedProperties.customAttrs = {
                ...currentState.shapeProps.customAttrs,
                ...opProperties.customAttrs,
                ...transformedProperties.customAttrs
            };
        }
    }

    return {
        operation: {
            ...operation,
            properties: transformedProperties,
            version: currentState.metadata.version + 1
        }
    };
}

function resolveRotationConflict(clientValue, concurrentValue, originalValue) {
    const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

    const normalizedClient = normalizeAngle(clientValue);
    const normalizedConcurrent = normalizeAngle(concurrentValue);
    const normalizedOriginal = normalizeAngle(originalValue);

    let clientDelta = normalizedClient - normalizedOriginal;
    if (Math.abs(clientDelta) > 180) {
        clientDelta = clientDelta > 0 ? clientDelta - 360 : clientDelta + 360;
    }

    let concurrentDelta = normalizedConcurrent - normalizedOriginal;
    if (Math.abs(concurrentDelta) > 180) {
        concurrentDelta = concurrentDelta > 0 ? concurrentDelta - 360 : concurrentDelta + 360;
    }

    let newRotation = normalizedOriginal + clientDelta + concurrentDelta;

    return normalizeAngle(newRotation);
}

function resolvePointsConflict(clientPoints, concurrentPoints, originalPoints) {
    if (clientPoints.length !== originalPoints.length ||
        concurrentPoints.length !== originalPoints.length) {
        return clientPoints; // too hard for now just use client version
    }

    const result = [];
    for (let i = 0; i < clientPoints.length; i++) {
        if (i % 2 === 0) { // X coordinate
            const originalX = originalPoints[i];
            const clientDeltaX = clientPoints[i] - originalX;
            const concurrentDeltaX = concurrentPoints[i] - originalX;
            result.push(originalX + clientDeltaX + concurrentDeltaX);
        } else { // Y coordinate
            const originalY = originalPoints[i];
            const clientDeltaY = clientPoints[i] - originalY;
            const concurrentDeltaY = concurrentPoints[i] - originalY;
            result.push(originalY + clientDeltaY + concurrentDeltaY);
        }
    }

    return result;
}


/*
wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  ws.id = clientId;
  canvasState.clients.push(ws);
  
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.type === 'SHAPE_UPDATE') {
        const result = handleShapeUpdateEvent(parsedMessage, ws, canvasState);
        
        if (result.error) {
          ws.send(JSON.stringify({ 
            type: 'ERROR', 
            error: result.error 
          }));
        } else {
          canvasState = result;
        }
      }
      // Handle other message types...
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });
});
*/