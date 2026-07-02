# Revu Clase

Landing page de **REVU** — el cohort de 8 semanas donde dueños de PyMEs B2B construyen su propio sistema de ventas con infraestructura de IA, guiados por expertos con trayectoria comprobada.

## Ver la página

Es un sitio estático sin dependencias de build. Puedes abrirlo de dos formas:

**Opción rápida:** abre `index.html` directamente en el navegador.

**Con servidor local** (recomendado, para que el video y las imágenes carguen bien):

```bash
python -m http.server 8000
# luego abre http://127.0.0.1:8000/index.html
```

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
