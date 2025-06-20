const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const argon2 = require('argon2');
const { v4: uuidv4  } = require('uuid');
const { app } = require('electron');
require('dotenv').config();

// Ruta hardcodeada a la NAS
const HARDCODED_PATH = 'Z:\\DAVID\\Secure';

// Verificamos si existe
let DATA_DIR;
if (fs.existsSync(HARDCODED_PATH)) {
  console.log('✅ Usando ruta en NAS:', HARDCODED_PATH);
  DATA_DIR = HARDCODED_PATH;
} else {
  // Fallback si no está disponible (ej. VPN caída)
  DATA_DIR = path.join(app.getPath('userData'), 'data');
  console.warn('⚠️ NAS no disponible, usando ruta local:', DATA_DIR);

  // Aseguramos que exista
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Rutas finales
const CONFIG_PATH = path.join(DATA_DIR, 'master.json');
const PASSWORDS_PATH = path.join(DATA_DIR, 'passwords.json');

// Asegura que la carpeta 'data' exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

function deriveKey(key) {
  // Crea un hash SHA-256 de la clave maestra
  return crypto.createHash('sha256').update(key).digest();
}

function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

function generateIV() {
  return crypto.randomBytes(16);
}

function encryptData(data, key) {
  const derivedKey = deriveKey(key); // Ahora derivedKey es Buffer de 32 bytes
  const iv = generateIV();
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    data: encrypted
  };
}

function decryptData({ iv, data }, key) {
  const derivedKey = deriveKey(key);
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function validateMasterKey(inputPassword) {
  if (!fs.existsSync(CONFIG_PATH)) {
    // Primera vez: genera y guarda hash
    const salt = generateSalt();
    const hash = await argon2.hash(inputPassword + salt);

    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ salt, masterKeyHash: hash }, null, 2));

    return {
      exists: false,
      success: true,
      message: 'Primera vez. Configuración creada.',
    };
  }

  const { salt, masterKeyHash } = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const isValid = await argon2.verify(masterKeyHash, inputPassword + salt);

  return {
    exists: true,
    success: isValid,
    message: isValid ? 'Clave válida.' : 'Clave incorrecta.'
  };
}

function loadPasswords() {
  if (!fs.existsSync(PASSWORDS_PATH)) {
    fs.writeFileSync(PASSWORDS_PATH, JSON.stringify({ accounts: [] }, null, 2));
  }

  return JSON.parse(fs.readFileSync(PASSWORDS_PATH, 'utf-8'));
}

function savePasswords(data) {
  fs.writeFileSync(PASSWORDS_PATH, JSON.stringify(data, null, 2));
}

function getDecryptedPasswords(masterKey) {
  const { accounts } = loadPasswords();
  return accounts.map(entry => {
    const decrypted = decryptData(entry, masterKey);
    return JSON.parse(decrypted);
  });
}

function addPassword(accountData, masterKey) {
  const raw = { id: uuidv4(), ...accountData };
  const encrypted = encryptData(JSON.stringify(raw), masterKey);

  const db = loadPasswords();
  db.accounts.push(encrypted);
  savePasswords(db);
  return raw;
}

function deletePassword(id, masterKey) {
  let db = loadPasswords();
  db.accounts = db.accounts.filter(entry => {
    const decrypted = JSON.parse(decryptData(entry, masterKey));
    return decrypted.id !== id;
  });
  savePasswords(db);
}

function updatePassword(id, newData, masterKey) {
  const db = loadPasswords();
  db.accounts = db.accounts.map(entry => {
    const decrypted = JSON.parse(decryptData(entry, masterKey));
    if (decrypted.id === id) {
      const updated = { ...decrypted, ...newData };
      return encryptData(JSON.stringify(updated), masterKey);
    }
    return entry;
  });
  savePasswords(db);
}

function generatePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$*_';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

module.exports = {
  validateMasterKey,
  encryptData,
  decryptData,
  CONFIG_PATH,
  PASSWORDS_PATH,
  getDecryptedPasswords,
  addPassword,
  deletePassword,
  updatePassword,
  generatePassword,
};