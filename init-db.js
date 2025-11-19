// init-db.js - Inicialización de base de datos mejorada
const { query, testConnection } = require('./database');

async function initializeDatabase() {
    try {
        console.log('🔄 Inicializando base de datos...');
        
        // Probar conexión primero
        const connectionOk = await testConnection();
        if (!connectionOk) {
            throw new Error('No se pudo conectar a la base de datos');
        }

        // Verificar si las tablas ya existen
        const tablesExist = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            )
        `);

        if (tablesExist.rows[0].exists) {
            console.log('✅ Las tablas ya existen, saltando creación...');
            
            // Verificar datos de ejemplo
            const userCount = await query('SELECT COUNT(*) FROM users');
            if (parseInt(userCount.rows[0].count) === 0) {
                console.log('📝 Insertando datos de ejemplo...');
                await insertSampleData();
            }
            
            return;
        }

        console.log('📊 Creando tablas...');

        // Tabla de usuarios
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
                talento VARCHAR(20) CHECK (talento IN ('deportivo', 'musical', 'matematico', 'linguistico', 'tecnologico', 'artistico')),
                active BOOLEAN DEFAULT true,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de artículos
        await query(`
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(20) NOT NULL CHECK (category IN ('deportivo', 'musical', 'matematico', 'linguistico', 'tecnologico', 'artistico')),
                chapter VARCHAR(20) NOT NULL CHECK (chapter IN ('portafolios', 'experiencias', 'posicionamiento')),
                content TEXT NOT NULL,
                author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                image_url VARCHAR(500),
                status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
                rejection_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP,
                
                CONSTRAINT valid_publication_date 
                    CHECK (published_at IS NULL OR status = 'published')
            )
        `);

        // Tabla de comentarios
        await query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
                author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
            )
        `);

        // Tabla de notificaciones
        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
                read BOOLEAN DEFAULT false,
                link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT non_empty_notification_content CHECK (length(trim(content)) > 0)
            )
        `);

        // Tabla de estadísticas de juegos
        await query(`
            CREATE TABLE IF NOT EXISTS game_stats (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('sudoku', 'memory', 'crossword')),
                played INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                best_time INTEGER,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(user_id, game_type),
                
                CONSTRAINT valid_played_count CHECK (played >= 0),
                CONSTRAINT valid_completed_count CHECK (completed >= 0 AND completed <= played),
                CONSTRAINT valid_best_score CHECK (best_score >= 0)
            )
        `);

        // Crear índices para mejor rendimiento
        await query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
        await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
        await query('CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status)');
        await query('CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at) WHERE status = \'published\'');
        await query('CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)');
        await query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');

        // Insertar datos de ejemplo
        await insertSampleData();

        console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
        throw error;
    }
}

async function insertSampleData() {
    try {
        console.log('📝 Insertando datos de ejemplo...');
        
        // Insertar usuarios de ejemplo
        await query(`
            INSERT INTO users (username, password, name, role, talento) VALUES
            ('admin', 'admin', 'Administrador Principal', 'admin', NULL),
            ('docente1', '123', 'María González', 'teacher', NULL),
            ('estudiante1', '123', 'Juan Pérez', 'student', 'artistico'),
            ('estudiante2', '123', 'Ana López', 'student', 'musical'),
            ('padre1', '123', 'Carlos Rodríguez', 'parent', NULL)
            ON CONFLICT (username) DO NOTHING
        `);

        // Insertar artículos de ejemplo
        await query(`
            INSERT INTO articles (title, category, chapter, content, author_id, status, published_at) VALUES
            ('Nuestro equipo de fútbol gana el torneo regional', 'deportivo', 'portafolios', 'El equipo de fútbol del Colegio San Francisco IED ha logrado una victoria histórica en el torneo regional...', 3, 'published', NOW() - INTERVAL '5 days'),
            ('Concierto de primavera del coro estudiantil', 'musical', 'portafolios', 'El coro estudiantil presentó un emotivo concierto de primavera con canciones tradicionales...', 4, 'published', NOW() - INTERVAL '3 days'),
            ('Taller de robótica educativa', 'tecnologico', 'experiencias', 'El programa Talentos implementó un taller de robótica educativa donde los estudiantes aprendieron programación...', 2, 'published', NOW() - INTERVAL '2 days')
            ON CONFLICT DO NOTHING
        `);

        console.log('✅ Datos de ejemplo insertados correctamente');
    } catch (error) {
        console.error('❌ Error insertando datos de ejemplo:', error);
    }
}

module.exports = { initializeDatabase, insertSampleData };