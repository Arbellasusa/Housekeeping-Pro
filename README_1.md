# 🏨 HK Pro Enterprise v3
### Arbellas House Hotel. Florida

> **Sistema operativo completo para Housekeeping y Almacén.**  
> PWA instalable en iPhone y Android como app nativa. Firebase en tiempo real.  
> Roles diferenciados · Fotos/Video · WhatsApp Business API · Registro diario permanente

**🔗 App en producción:** https://arbellasusa.github.io/Housekeeping-Pro/

---

## ¿Qué hace esta app?

| Quién | Qué puede hacer |
|-------|----------------|
| 🧹 **Camarera** | Solicitar materiales, registrar habitaciones listas con fotos y video, reportar incidencias con foto |
| 📦 **Almacenero** | Ver feed en tiempo real, gestionar inventario, Kardex, entradas de stock, exportar reportes |
| 👔 **Supervisor** | Ver todas las hab. listas, resolver incidencias, historial diario, aprobar solicitudes |
| ⚙️ **Admin** | Todo lo anterior + crear usuarios, configurar WhatsApp, ver auditoría |

---

## Novedades v3 vs versiones anteriores

| Función | v1.x | v2.x | **v3** |
|---------|:----:|:----:|:------:|
| Login seguro (Firebase Auth) | ❌ | ❌ | ✅ |
| Datos en Firestore (tiempo real) | ❌ | parcial | ✅ |
| Fotos y videos (Firebase Storage) | ❌ | ❌ | ✅ |
| Habitaciones listas con evidencia | ❌ | ❌ | ✅ |
| Incidencias con foto | ❌ | ❌ | ✅ |
| WhatsApp Business API automático | ❌ | ❌ | ✅ |
| Registro diario historial | ❌ | ❌ | ✅ |
| Roles y seguridad por usuario | ❌ | ❌ | ✅ |
| QR de descarga integrado | ❌ | ❌ | ✅ |
| Sincronización en tiempo real | ❌ | básica | ✅ |

---

## Archivos del repositorio

```
Housekeeping-Pro/
├── index.html              ← App completa (todo-en-uno, 106 KB)
├── sw.js                   ← Service Worker (PWA, caché offline)
├── manifest.json           ← Config instalación iPhone/Android
├── firestore.rules         ← Reglas de seguridad Firestore
├── storage.rules           ← Reglas de seguridad Storage
├── firebase.json           ← Config deploy Firebase
├── firestore.indexes.json  ← Índices para queries
├── DEPLOYMENT.md           ← Guía técnica completa
├── README.md               ← Este archivo
└── functions/
    └── index.js            ← Firebase Functions (WhatsApp API seguro)
```

> ⚠️ **Ya no hay carpeta `icons/` ni `generate_icons.py`** — los iconos están embebidos en el `manifest.json`.

---

## Instalación — GitHub Pages

### Paso 1 — Subir los archivos al repositorio

**Desde el navegador (más fácil):**

1. Ve a **github.com/Arbellasusa/Housekeeping-Pro**
2. Haz clic en **"Add file" → "Upload files"**
3. Arrastra estos 3 archivos:
   - `index.html`
   - `sw.js`
   - `manifest.json`
4. Haz clic en **"Commit changes"**

**Desde Git:**

```bash
git add index.html sw.js manifest.json
git commit -m "HK Pro v3 Enterprise"
git push origin main
```

---

### Paso 2 — Activar GitHub Pages

1. Tu repositorio → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. **Save**

✅ En 2 minutos la app está en:  
**`https://arbellasusa.github.io/Housekeeping-Pro/`**

---

### Paso 3 — Configurar Firebase

La app v3 requiere Firebase. Proyecto ya creado: **hk-pro-housekeeping**

#### 3.1 — Activar Authentication

1. [console.firebase.google.com](https://console.firebase.google.com) → **hk-pro-housekeeping**
2. **Authentication → Get started**
3. **Sign-in method** → activar **Email/Password** → Save
4. También activar **Google** → Save
5. **Settings → Authorized domains** → **Add domain** → `arbellasusa.github.io`

#### 3.2 — Crear Firestore Database

1. **Firestore Database → Create database**
2. **Start in production mode** → Next
3. Región: **us-east1** (Florida)
4. **Enable**
5. Pestaña **Rules** → pegar contenido de `firestore.rules` → **Publish**

#### 3.3 — Activar Storage (fotos y videos)

1. **Storage → Get started**
2. **Start in production mode** → **us-east1** → Done
3. Pestaña **Rules** → pegar contenido de `storage.rules` → **Publish**

#### 3.4 — Crear índices Firestore

En **Firestore → Indexes → Add index:**

| Colección | Campo 1 | Campo 2 |
|-----------|---------|---------|
| `solicitudes` | `fecha` ASC | `ts` DESC |
| `habitaciones_listas` | `fecha` ASC | `uidUsuario` ASC |
| `habitaciones_listas` | `fecha` ASC | `ts` DESC |
| `incidencias` | `estadoInc` ASC | `ts` DESC |
| `registro_diario` | `fecha` ASC | `ts` DESC |

---

### Paso 4 — Crear el primer usuario Admin

1. Abre la app → pantalla de login → escribe tu email + contraseña → **Entrar**
2. Firebase crea la cuenta automáticamente con rol `housekeeper`
3. Ve a **Firebase Console → Firestore → colección `usuarios`**
4. Abre tu documento (busca por email o por UID)
5. Campo `rol` → editar → escribe `admin` → **Update**
6. Recarga la app — verás todos los paneles y el menú Admin

---

### Paso 5 — Crear el resto del equipo

El Admin puede crear cuentas directamente desde la app:

1. Entra como admin → **Config → ⚙️ Admin**
2. Rellena: Email, Nombre, Contraseña temporal, Rol
3. **"Crear usuario en Firebase"**

O desde **Firebase Console → Authentication → Add user**.

**Roles disponibles:**

| Rol | Descripción |
|-----|-------------|
| `housekeeper` | Camarera — ve solo su panel y sus datos |
| `almacenero` | Almacén — inventario, solicitudes, reportes |
| `supervisor` | Supervisión — todo + incidencias + historial |
| `admin` | Acceso total + gestión de usuarios |

---

## Instalar la app en iPhone

Para cada miembro del equipo:

1. Abrir **Safari** (obligatorio — no Chrome, no Firefox)
2. Ir a: `https://arbellasusa.github.io/Housekeeping-Pro/`
3. Tocar el botón **Compartir ↑** (cuadrado con flecha)
4. Desplazarse en el menú → **"Añadir a pantalla de inicio"**
5. Nombre: `HK Pro` → **Añadir**

El ícono aparece en la pantalla de inicio como una app nativa.  
Se abre sin barra de Safari, a pantalla completa, como cualquier app de la App Store.

---

## Instalar la app en Android

1. Abrir **Chrome**
2. Ir a la URL de la app
3. Menú ⋮ → **"Añadir a pantalla de inicio"**
4. O esperar el banner automático de instalación que aparece

---

## Flujo de uso con WhatsApp

### Camarera → Solicitud de material

```
Camarera en habitación
    │
    ▼
Abre HK Pro → Panel Inicio
    │
    ▼
"Solicitar" → selecciona hab. + producto + cantidad
    │
    ▼
Solicitud guardada en Firestore
    │
    ▼
Firebase Functions detecta la solicitud urgente
    │
    ▼
WA automático al almacenero: "🚨 URGENTE — Hab. 501 — Sábanas ×2"
```

### Camarera → Incidencia

```
Camarera detecta problema
    │
    ▼
Botón rojo "Reportar incidencia"
    │
    ▼
Foto + descripción + habitación
    │
    ▼
Firebase Functions → WA automático al supervisor y admin
```

### Stock bajo → Alerta automática

```
Sistema detecta producto bajo mínimo
    │
    ▼
Firebase Functions → WA al almacenero: "⚠️ Lejía — 3 litros (mín 4)"
    │                                   "🔴 AGOTADO — Papel higiénico"
    ▼
08:00 AM → Reporte diario automático por WA
Domingos → Reporte semanal automático por WA
```

---

## WhatsApp Business API — configuración segura

> ⚠️ En v1 y v2 los números de WhatsApp se editaban en `index.html`.  
> **En v3 el token NUNCA está en el frontend ni en GitHub.** Solo vive en Firebase Functions.

### Configurar los contactos WA (desde la app)

1. Entra como **admin**
2. **Config → 📱 WhatsApp → ✏️ Editar**
3. Introduce los números con código de país (ej. `+18095551234`)
4. El grupo puede ser un número o un link de invitación (`https://chat.whatsapp.com/...`)
5. **💾 Guardar** — se guardan en Firestore (colección `settings`)

### Activar envío automático (Firebase Functions)

```bash
# Instalar Firebase CLI (una sola vez)
npm install -g firebase-tools
firebase login

# Configurar token de Meta (una sola vez)
firebase functions:config:set \
  whatsapp.token="EAAG..." \
  whatsapp.phone_id="123456789"

# Desplegar Functions
firebase deploy --only functions
```

**Para obtener el token:**
1. [developers.facebook.com](https://developers.facebook.com) → crear App tipo Business
2. Añadir producto **WhatsApp**
3. Copiar **Phone Number ID** y **Access Token permanente**

---

## Actualizar la app

Cada vez que subas un nuevo `index.html` a GitHub:

```bash
git add index.html
git commit -m "v3.x — descripción del cambio"
git push
```

GitHub Pages publica en **1-2 minutos**.  
El Service Worker actualiza automáticamente todos los dispositivos en la siguiente apertura.

Para forzar actualización inmediata en todos los dispositivos, incrementa la versión en `sw.js`:

```js
const CACHE = 'hkpro-v3.1.0';  // ← cambiar número
```

---

## Seguridad

- 🔐 **Firebase Auth obligatorio** — sin cuenta verificada no hay acceso
- 🛡️ **Firestore Rules por rol** — cada usuario solo lee y escribe sus datos
- 📁 **Storage Rules** — fotos privadas, solo el dueño y supervisor+ pueden leerlas
- 🔑 **Token WA** solo en Firebase Functions — nunca en el código del cliente
- 📋 **Audit log** automático de todas las acciones en Firestore
- 🚫 Principio de mínimo privilegio en cada colección

---

## Compatibilidad

| Plataforma | Soporte |
|------------|---------|
| 📱 iPhone — Safari (iOS 14+) | ✅ Completo · instalable como app nativa |
| 🤖 Android — Chrome (8+) | ✅ Completo · instalable como app nativa |
| 💻 Desktop Chrome / Edge | ✅ Completo |
| 🦊 Firefox | ✅ Funcional |
| 🍎 Safari Mac | ✅ Funcional |
| ✈️ Sin conexión | ✅ Service Worker + caché local |
| 🔄 Tiempo real multidevice | ✅ Firebase Firestore listeners |

---

## Proyecto Firebase

| Dato | Valor |
|------|-------|
| Proyecto ID | `hk-pro-housekeeping` |
| Auth Domain | `hk-pro-housekeeping.firebaseapp.com` |
| Firestore | `us-east1` |
| Storage | `hk-pro-housekeeping.appspot.com` |
| RTDB | `hk-pro-housekeeping-default-rtdb.firebaseio.com` |

---

## Historial de versiones

| Versión | Cambios |
|---------|---------|
| **v3.0** | Firebase Auth + Firestore + Storage + Functions · Roles estrictos · Habitaciones listas con foto/video · Incidencias con foto + WA automático · Registro diario permanente · Autocomplete inventario · QR descarga · Seguridad por colección |
| v2.x | Firebase RTDB · Login simple nombre+rol · Inventario dinámico · Kardex · PDF/CSV |
| v1.2 | localStorage + BroadcastChannel · Sin backend · Edición manual de números WA |

---

*HK Pro Enterprise v3 — Hyde House Hotel, 4111 South Ocean Drive, Hollywood, FL*  
*Desarrollado con [Claude AI](https://claude.ai) — Anthropic*
