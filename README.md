# HK Pro — Housekeeping & Almacén PWA

Sistema completo de gestión de housekeeping y almacén para hotel.
Instalable en iPhone como app nativa desde Safari.

## Instalación en GitHub Pages (gratis)

### Paso 1 — Crear repositorio en GitHub
1. Ve a [github.com](https://github.com) → **Sign up** (gratis)
2. Pulsa **New repository**
3. Nombre: `housekeeping-app` (o el que quieras)
4. Marca **Public**
5. Pulsa **Create repository**

### Paso 2 — Subir los archivos
**Opción A — Desde el navegador (más fácil):**
1. En el repositorio recién creado, pulsa **uploading an existing file**
2. Arrastra todos estos archivos a la vez:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - La carpeta `icons/` con todas las imágenes
3. Pulsa **Commit changes**

**Opción B — Con Git:**
```bash
git init
git add .
git commit -m "HK Pro PWA inicial"
git remote add origin https://github.com/TU_USUARIO/housekeeping-app.git
git push -u origin main
```

### Paso 3 — Activar GitHub Pages
1. Ve a **Settings** del repositorio
2. Sección **Pages** (menú izquierdo)
3. En **Source** selecciona: `Deploy from a branch`
4. Branch: `main` / `/ (root)`
5. Pulsa **Save**
6. En 1-2 minutos tu app estará en:
   `https://TU_USUARIO.github.io/housekeeping-app/`

---

## Instalar en iPhone (almacenero)

1. En el iPhone, abrir **Safari** (no Chrome, debe ser Safari)
2. Escribir la URL: `https://TU_USUARIO.github.io/housekeeping-app/`
3. Pulsar el botón de **Compartir** (cuadrado con flecha arriba ↑)
4. Bajar en el menú → **"Añadir a pantalla de inicio"**
5. Nombre: `HK Pro` → **Añadir**
6. ¡Listo! Aparece el icono en la pantalla como una app real

---

## Estructura de archivos

```
housekeeping-app/
├── index.html          ← App completa (todo-en-uno)
├── manifest.json       ← Configuración PWA
├── sw.js               ← Service Worker (offline + notificaciones)
├── generate_icons.py   ← Script para regenerar iconos
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-180.png     ← Icono principal iPhone
    ├── icon-192.png
    ├── icon-512.png
    └── splash.png
```

---

## Flujo de uso con WhatsApp

### Camarera → Sistema
La camarera usa el panel "Solicitudes" en su móvil (la misma URL).
Al registrar, el sistema genera automáticamente el mensaje para WhatsApp.

### Sistema → Almacenero iPhone
1. El almacenero tiene la app instalada en su iPhone
2. En "Alertas" ve los productos con stock bajo en tiempo real
3. Cada alerta tiene botón **"Avisar por WhatsApp"** que abre WhatsApp
   con el mensaje completo ya redactado
4. Puede enviar al grupo de housekeeping o al responsable directamente

### Número del almacenero
Para enviar directamente al almacenero, edita en `index.html`:
```javascript
// Busca la línea que dice:
window.open('https://wa.me/?text=...')
// Cámbiala por:
window.open('https://wa.me/34XXXXXXXXX?text=...')
// Donde 34XXXXXXXXX es el número con código de país (España = 34)
```

---

## Configuración del número de WhatsApp del almacén

En `index.html`, busca y reemplaza el número:
```
NUMERO_ALMACEN = '+34612345678'  ← cambia por el real
```

O busca todas las ocurrencias de `wa.me/?text=` y añade el número:
`wa.me/34612345678?text=`

---

## Actualizar la app

Cada vez que edites `index.html` y hagas commit en GitHub,
la app se actualiza automáticamente en todos los iPhones
en la siguiente apertura (el Service Worker descarga los cambios en background).

Para forzar actualización manual: cambiar la versión en `sw.js`:
```javascript
const CACHE_NAME = 'hkpro-v1.3';  ← incrementar versión
```

---

## Soporte y compatibilidad

- ✅ iPhone (Safari) — iOS 14+
- ✅ Android (Chrome) — Android 8+  
- ✅ Desktop Chrome / Edge
- ✅ Funciona sin conexión (datos en caché local)
- ⚠️ Los datos se guardan localmente en el dispositivo
  Para sincronización real entre dispositivos → contactar para integración con backend

---

*HK Pro v1.2 — Generado con Claude AI*
