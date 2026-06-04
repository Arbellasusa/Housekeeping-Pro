# HK PRO ENTERPRISE v2
## Hyde House Hotel — 4111 South Ocean Drive, Hollywood FL
### Guía Completa de Producción

---

## ESTRUCTURA DE ARCHIVOS

```
hkpro-enterprise/
├── index.html              ← App completa (todo-en-uno)
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker (offline + push)
├── firestore.rules         ← Reglas de seguridad Firestore
├── src/
│   └── firebase.js         ← Constantes y helpers
├── public/
│   └── icons/              ← Iconos PWA (genera con script)
└── docs/
    └── DEPLOYMENT.md       ← Este archivo
```

---

## PASO 1 — FIREBASE CONSOLE

### 1.1 Activar Firestore
1. `console.firebase.google.com` → Tu proyecto **hk-pro-housekeeping**
2. **Firestore Database** → Crear base de datos
3. Seleccionar **modo de producción**
4. Región: `us-east1` (más cercana a Florida)

### 1.2 Aplicar reglas de seguridad
1. Firestore → **Rules**
2. Copiar el contenido de `firestore.rules`
3. **Publicar**

### 1.3 Activar Authentication
1. **Authentication** → Comenzar
2. Habilitar:
   - **Email/Contraseña** ✓
   - **Google** ✓
3. Authorized domains: añadir tu dominio de GitHub Pages

### 1.4 Activar Realtime Database
1. **Realtime Database** → Crear base de datos
2. Modo de producción
3. En Rules, poner temporalmente:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## PASO 2 — GITHUB PAGES

### 2.1 Crear repositorio
```bash
# En GitHub.com:
# New repository → housekeeping-pro → Public → Create
```

### 2.2 Subir archivos
Arrastra al repositorio:
- `index.html`
- `manifest.json`
- `sw.js`
- La carpeta `public/` con los iconos

### 2.3 Activar GitHub Pages
1. Settings → Pages
2. Source: **Deploy from branch**
3. Branch: `main` / `/ (root)`
4. Save

URL: `https://arbellasusa.github.io/housekeeping-pro/`

### 2.4 Añadir dominio a Firebase Auth
1. Authentication → Settings → Authorized domains
2. Añadir: `arbellasusa.github.io`

---

## PASO 3 — PRIMER USUARIO ADMIN

1. Abrir la app en el navegador
2. Registrarse con tu correo
3. En Firebase Console → Firestore → users → busca tu documento
4. Editar el campo `role` → cambiar a `admin`
5. Recargar la app

---

## PASO 4 — CONFIGURAR EL HOTEL

1. Entrar como admin
2. Config → Hotel
3. Configurar:
   - Nombre: **Hyde House Hotel**
   - Pisos: **41**
   - Habitaciones por piso: **10** (o las que correspondan)
   - Habitación inicial: **101**
4. Guardar

---

## PASO 5 — NÚMEROS WHATSAPP

Config → WhatsApp → Editar:
```
Almacenero:    +1809XXXXXXX
Supervisor:    +1809XXXXXXX
Mantenimiento: +1809XXXXXXX
Recepción:     +1809XXXXXXX
Grupo HK Team: +1809XXXXXXX ó https://chat.whatsapp.com/...
```

---

## PASO 6 — INVENTARIO INICIAL

1. Ir a **Almacén** → **Inventario** → **+ Añadir**
2. Para cada producto ingresar:
   - SKU (código interno)
   - Nombre en español e inglés
   - Categoría
   - Unidad
   - **Existencia inicial** (lo que hay físicamente hoy)
   - Mínimo (nivel de alerta)
   - Máximo
   - Precio unitario (USD)
   - Proveedor

El sistema calculará automáticamente:
```
Existencia Final = Existencia Inicial + Entradas - Salidas
```

---

## PASO 7 — AGREGAR EMPLEADOS

Cada camarera, almacenero y supervisor debe:
1. Abrir la app en su iPhone/Android
2. Registrarse con correo y contraseña
3. Seleccionar su rol correcto
4. Usar el mismo **Código de hotel**: `HYDE_HOTEL`

---

## ROLES Y PERMISOS

| Rol          | Crear solicitudes | Aprobar | Gestionar inventario | Admin |
|--------------|:-----------------:|:-------:|:--------------------:|:-----:|
| Housekeeper  | ✅                | ❌       | ❌                   | ❌    |
| Almacenero   | ✅                | ✅       | ✅                   | ❌    |
| Supervisor   | ✅                | ✅       | ✅                   | ❌    |
| Gerente      | ✅                | ✅       | ✅                   | Parcial |
| Admin        | ✅                | ✅       | ✅                   | ✅    |

---

## CÓMO FUNCIONA EL INVENTARIO

### Fórmula de cálculo
```
Existencia Final = Existencia Inicial + Entradas - Salidas
```

### Descuento automático
Cuando una camarera solicita `2 toallas medianas`:
1. El sistema busca "Toalla mediana" en el inventario
2. Registra automáticamente una **salida de 2 unidades**
3. Recalcula la existencia final
4. Si queda bajo el mínimo → genera alerta automática

### Movimientos (Kardex)
Cada cambio queda registrado con:
- Fecha y hora
- Usuario que realizó el cambio
- Tipo: Entrada / Salida / Ajuste / Daño / Traslado
- Cantidad antes y después
- Referencia (nombre de la camarera, nº factura, etc.)

---

## ALERTAS AUTOMÁTICAS

| Alerta      | Cuándo              | Destino          |
|-------------|---------------------|------------------|
| Diaria      | 08:00 AM todos los días | Almacenero WA |
| Semanal     | Domingo 08:00 AM    | Almacenero WA    |
| Quincenal   | Día 15 08:00 AM     | Almacenero WA    |
| Mensual     | Último día 08:00 AM | Almacenero WA    |

Configuración en: **Config → Alertas**

---

## CHAT INTERNO

4 canales independientes con Firestore:
- 🧹 **Housekeeping** — todas las camareras
- 📦 **Almacén** — almacenero y supervisores
- 👔 **Supervisores** — solo supervisores y gerencia
- 🔧 **Mantenimiento** — equipo de mantenimiento

---

## EXPORTACIONES DISPONIBLES

| Formato | Período    | Contenido                        |
|---------|-----------|----------------------------------|
| PDF     | Cualquiera | Inventario + Movimientos + Alertas |
| CSV     | Instantáneo | Inventario completo para Excel   |
| WA      | Cualquiera | Texto optimizado para WhatsApp   |

---

## INSTALACIÓN EN iPHONE

Para cada camarera/almacenero:
1. Abrir **Safari** (no Chrome ni Firefox)
2. Escribir la URL de la app
3. Tocar el botón de compartir ↑
4. Desplazar hacia abajo → **"Añadir a pantalla de inicio"**
5. Nombre: `HK Pro` → **Añadir**
6. El icono aparece como app nativa

---

## SOPORTE Y MANTENIMIENTO

Para actualizar la app:
1. Editar `index.html`
2. Hacer commit en GitHub
3. GitHub Pages publica automáticamente en 1-2 minutos
4. Para forzar actualización en los iPhones:
   - Cambiar `CACHE_VERSION` en `sw.js`
   - Commit y push

---

## CAPACIDAD DEL SISTEMA

- **Usuarios simultáneos**: hasta 100+ (Firestore escala automáticamente)
- **Almacenamiento**: 1 GB gratis en Firestore + 1 GB en Realtime DB
- **Solicitudes diarias**: ilimitadas en el plan gratuito (Spark)
- **Para mayor capacidad**: actualizar a Firebase Blaze (~$0.06/100K lecturas)

---

*HK Pro Enterprise v2.0 — Desarrollado para Hyde House Hotel*
*Generado con Claude AI — Anthropic*
