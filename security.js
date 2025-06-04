const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const argon2 = require('argon2');

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const PASSWORDS_PATH = path.join(DATA_DIR, 'passwords.json');

// Asegura que la carpeta 'data' exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

function generateIV() {
  return crypto.randomBytes(16);
}

function encryptData(data, key) {
  const iv = generateIV();
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    data: encrypted
  };
}

function decryptData({ iv, data }, key) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
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

module.exports = {
  validateMasterKey,
  CONFIG_PATH,
  PASSWORDS_PATH,
  encryptData,
  decryptData,
};
