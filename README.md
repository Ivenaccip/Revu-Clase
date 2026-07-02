# Revu Clase

Landing page de **REVU** — el cohort de 8 semanas donde dueños de PyMEs B2B construyen su propio sistema de ventas con infraestructura de IA, guiados por expertos con trayectoria comprobada.

## Ver la página

Es un sitio estático sin dependencias de build.

**Con Node** (recomendado — es como corre en producción):

```bash
npm start
# abre http://localhost:3000
```

El servidor escucha en `process.env.PORT` (o `3000` en local) y soporta HTTP Range,
así que el video del hero hace streaming y seek correctamente.

**Opción rápida sin Node:** abre `index.html` directamente en el navegador.

## Despliegue en Hostinger (Node.js app)

El proyecto está listo para Hostinger como aplicación Node:

- `package.json` → script `start`: `node server.js`.
- `server.js` → servidor estático **sin dependencias** (solo módulos nativos de Node),
  escucha en `process.env.PORT` y sirve todos los estáticos con soporte de Range.

En el panel de Hostinger: crea una app Node.js, apunta al repo, comando de inicio
`npm start` (o `node server.js`). No hay `npm install` obligatorio porque no hay dependencias.

## Estructura

- `index.html` — la landing implementada (HTML/CSS/JS puro, sin frameworks).
- `assets/` — fotos de los mentores (Thomas, Andres, Guillermo).
- `uploads/` — video del hero (`transicion.mp4`) e imágenes de fondo.
- `REVU.dc.html` + `support.js` — diseño original exportado desde Claude Design (prototipo de referencia).

## Secciones

Navbar fijo · Hero con video · Problema · Solución · Cómo funciona · Autoridad · Mentores · Testimonios · Pricing · Footer.

## Notas de implementación

La landing se recreó pixel-perfect a partir del prototipo de Claude Design (`REVU.dc.html`), pero **desacoplada del runtime propietario** (`dc-runtime` / React). Las interacciones se tradujeron a estándares web:

- `style-hover` → reglas CSS `:hover`.
- Reveal al hacer scroll → `IntersectionObserver`.
- Nav responsivo → media query (`≥860px`).
- Parallax de fondo y loop reverse del video → JavaScript vanilla.
- Soporte de `prefers-reduced-motion`.
