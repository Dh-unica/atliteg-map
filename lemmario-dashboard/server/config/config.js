/**
 * Configuration centrale per backend API
 */

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys (separati da virgola)
  frontendApiKeys: (process.env.FRONTEND_API_KEYS || 'default_dev_key').split(','),
  
  // Admin credentials
  // Trim difensivo: i secret GitHub possono arrivare con trailing whitespace
  // o newline, e un confronto stretto fallirebbe silenziosamente.
  adminUsername: (process.env.ADMIN_USERNAME || 'admin').trim(),
  // Supporta sia password in chiaro (ADMIN_PASSWORD) che hash (ADMIN_PASSWORD_HASH)
  adminPassword: process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : undefined,
  adminPasswordHash: (process.env.ADMIN_PASSWORD_HASH || '$2b$10$wqM4/4h7tknyFoihM8wLCuLTv9Ndbs3V1rQ70hsSQtOwa2k47wnQW').trim(), // default: "admin"
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
  jwtExpiresIn: '24h',
  
  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:9000').split(','),
  
  // Rate limiting
  rateLimit: {
    dataApi: {
      windowMs: 15 * 60 * 1000, // 15 minuti
      max: 100 // 100 richieste per finestra
    },
    uploadApi: {
      windowMs: 60 * 60 * 1000, // 1 ora
      max: 5 // 5 upload per ora
    }
  },
  
  // Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ['text/csv', 'application/csv', 'application/vnd.ms-excel']
  }
};
