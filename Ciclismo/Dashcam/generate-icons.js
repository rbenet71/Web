// Crear esta carpeta y archivo si quieres generar iconos automáticamente
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [192, 512];

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fondo
    ctx.fillStyle = '#0096c7';
    ctx.fillRect(0, 0, size, size);
    
    // Icono de cámara
    ctx.fillStyle = 'white';
    const padding = size * 0.2;
    const bodyWidth = size - padding * 2;
    const bodyHeight = bodyWidth * 0.7;
    
    // Cuerpo de la cámara
    ctx.fillRect(padding, padding + bodyHeight * 0.2, bodyWidth, bodyHeight * 0.6);
    
    // Lente
    ctx.beginPath();
    ctx.arc(
        size / 2,
        padding + bodyHeight * 0.2 + bodyHeight * 0.3,
        bodyHeight * 0.25,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    
    // Punto de grabación
    if (size === 512) {
        ctx.beginPath();
        ctx.arc(size * 0.8, size * 0.2, size * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#e63946';
        ctx.fill();
    }
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icons/icon-${size}.png`, buffer);
});

console.log('Iconos generados en la carpeta icons/');