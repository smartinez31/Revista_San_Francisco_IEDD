// config.js - Configuración centralizada para producción
require('dotenv').config();

const config = {
    // Base de datos
    database: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 20,
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
        }
    },
    
    // Servidor
    server: {
        port: parseInt(process.env.PORT) || 10000,
        nodeEnv: process.env.NODE_ENV || 'development',
        host: '0.0.0.0'
    },
    
    // Seguridad
    security: {
        jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_revista_csf_2025',
        sessionSecret: process.env.SESSION_SECRET || 'fallback_session_secret_2025',
        corsOrigins: [
            'http://localhost:3000',
            'http://localhost:5500', 
            'https://revista-digital-csf.onrender.com'
        ]
    },
    
    // Aplicación
    app: {
        name: process.env.APP_NAME || 'Revista Digital CSF',
        version: process.env.APP_VERSION || '2.0.0',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
        uploadPath: process.env.UPLOAD_PATH || './uploads'
    }
};

// Validar configuraciones críticas en producción
if (process.env.NODE_ENV === 'production') {
    if (!config.database.connectionString) {
        throw new Error('DATABASE_URL es requerida en producción');
    }
    
    if (config.security.jwtSecret.includes('fallback')) {
        console.warn('⚠️  JWT_SECRET no está definida, usando valor por defecto (NO SEGURO PARA PRODUCCIÓN)');
    }
}

module.exports = config;