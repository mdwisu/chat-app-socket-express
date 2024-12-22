const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const secretKey = process.env.JWT_SECRET;

// Middleware untuk memverifikasi token JWT
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Mengambil token dari header Authorization

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token tidak tersedia, akses ditolak" });
  }

  try {
    const decoded = jwt.verify(token, secretKey); // Verifikasi token
    req.user = decoded; // Menyimpan data user yang di-decode
    next(); // Lanjut ke middleware berikutnya
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}

module.exports = { authenticate };
