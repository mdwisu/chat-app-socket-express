const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const secretKey = process.env.JWT_SECRET;

// Membuat JWT token
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, secretKey, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// Verifikasi JWT token
function verifyToken(token) {
  return jwt.verify(token, secretKey);
}

// Hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Verifikasi password
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = { generateToken, verifyToken, hashPassword, verifyPassword };
