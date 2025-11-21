// check-images.js - Script de diagnóstico
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE SISTEMA DE IMÁGENES');

// Verificar directorio public/images
const imagesDir = path.join(__dirname, 'public', 'images');
console.log('📁 Ruta de imágenes:', imagesDir);
console.log('📁 ¿Existe directorio?', fs.existsSync(imagesDir));

if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    console.log('📊 Archivos encontrados:', files.length);
    files.forEach(file => {
        console.log('   -', file);
    });
} else {
    console.log('❌ Directorio no existe. Creando...');
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('✅ Directorio creado');
}

// Verificar permisos
try {
    const testFile = path.join(imagesDir, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Permisos de escritura: OK');
} catch (error) {
    console.log('❌ Permisos de escritura: ERROR', error.message);
}