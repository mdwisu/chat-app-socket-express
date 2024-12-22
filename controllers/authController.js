const {
  generateToken,
  hashPassword,
  verifyPassword,
} = require("../helpers/authHelper");

// Simulasi database user
const users = [
  {
    id: 1,
    email: "user1@example.com",
    password: "$2b$10$aDFd/su9UbGVutD0XwHoNebph6pKg1YPCNFEy.JxY4W1MY7U2Jn5y",
  }, // Password yang di-hash
  {
    id: 2,
    email: "user2@example.com",
    password: "$2b$10$aDFd/su9UbGVutD0XwHoNebph6pKg1YPCNFEy.JxY4W1MY7U2Jn5y",
  }, // Password yang di-hash
];

// Controller Login
async function login(req, res) {
  const { email, password } = req.body;

  // Cari user di "database"
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  // Verifikasi password
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Password salah" });
  }

  // Generate token JWT
  const token = generateToken(user);
  res.json({ token });
}

function getMe(req, res) {
  res.json(req.user);
}

// Protected Route
function protectedRoute(req, res) {
  res.json({
    message: `Halo ${req.user.email}, Anda berhasil mengakses protected route!`,
  });
}

module.exports = { login, protectedRoute, getMe };
