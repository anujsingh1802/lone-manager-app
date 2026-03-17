import mongoose from 'mongoose';

const connectionStateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let listenersAttached = false;

function attachConnectionListeners() {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.log('[db] MongoDB connected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[db] MongoDB reconnected');
  });

  mongoose.connection.on('disconnected', () => {
    console.error('[db] MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[db] MongoDB error:', error.message);
  });
}

export async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  attachConnectionListeners();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseHealth() {
  return {
    status: connectionStateLabels[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || '',
    name: mongoose.connection.name || '',
    readyState: mongoose.connection.readyState,
  };
}
