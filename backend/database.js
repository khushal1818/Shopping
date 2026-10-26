const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, 'data');
const jsonFilePath = path.join(dataDir, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure JSON file exists
if (!fs.existsSync(jsonFilePath)) {
  fs.writeFileSync(jsonFilePath, JSON.stringify([], null, 2), 'utf-8');
}

let isMongoConnected = false;

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);

// JSON File Helper
function readJsonUsers() {
  try {
    const raw = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON users file:', err.message);
    return [];
  }
}

function writeJsonUsers(users) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON users file:', err.message);
  }
}

async function initDb(uri) {
  try {
    if (uri) {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500
      });
      isMongoConnected = true;
      console.log(' Connected to MongoDB at:', uri);
    }
  } catch (err) {
    isMongoConnected = false;
    console.warn(' MongoDB connection skipped or failed (' + err.message + '). Falling back to persistent local storage in data/users.json');
  }
}

async function findUserByEmail(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (isMongoConnected) {
    try {
      const user = await MongoUser.findOne({ email: normalizedEmail });
      if (user) {
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt
        };
      }
    } catch (err) {
      console.warn('Mongo find error, falling back to local file:', err.message);
    }
  }

  const users = readJsonUsers();
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

async function findUserById(id) {
  if (isMongoConnected) {
    try {
      const user = await MongoUser.findById(id);
      if (user) {
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        };
      }
    } catch (err) {
      console.warn('Mongo findById error, falling back to local file:', err.message);
    }
  }

  const users = readJsonUsers();
  const user = users.find((u) => u.id === id);
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }
  return null;
}

async function createUser({ name, email, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const trimmedName = (name || '').trim();

  if (isMongoConnected) {
    try {
      const newUser = await MongoUser.create({
        name: trimmedName,
        email: normalizedEmail,
        password
      });

      return {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      };
    } catch (err) {
      console.warn('Mongo create error, saving to local file:', err.message);
    }
  }

  const users = readJsonUsers();
  const id = crypto.randomUUID();
  const newUser = {
    id,
    name: trimmedName,
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJsonUsers(users);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt
  };
}

module.exports = {
  initDb,
  findUserByEmail,
  findUserById,
  createUser
};
