# ✅ SERVIDOR UNIFICADO - Frontend + Backend en UN puerto

## 🎯 La Solución

En lugar de dos servidores separados (frontend en 3000, backend en 3001):

**UN SOLO servidor Node.js que sirve TODO:**
- ✅ Frontend compilado (archivos estáticos)
- ✅ Backend API (rutas Express)
- ✅ Puerto único: 3000

---

## 📋 Cómo Funciona

```
http://localhost:3000  (Servidor Express único)
├── / → Frontend (index.html compilado)
├── /styles → CSS compilado
├── /js → JavaScript compilado
└── /api/analyze-media → Backend API (POST)
```

---

## 🚀 Instalación (4 pasos)

### Paso 1: Descarga archivos

```
server-unified.js     (NUEVO)
claudeService.ts      (ACTUALIZADO)
+ otros 11 archivos
```

### Paso 2: Instala

```bash
npm install
```

### Paso 3: Compila frontend

```bash
npm run build
```

Crea carpeta `dist/` con:
- index.html
- assets/
- etc.

### Paso 4: Ejecuta

```bash
node server-unified.js
```

O si quieres script en package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "server": "node server-unified.js",
    "start": "npm run build && node server-unified.js"
  }
}
```

Entonces:
```bash
npm start
```

---

## 🎯 Flujo Completo

```
1. npm run build
   ↓
   Compila React → dist/

2. node server-unified.js
   ↓
   🚀 Servidor levanta en puerto 3000

3. Usuario abre: http://localhost:3000
   ↓
   Express sirve dist/index.html (frontend)

4. Usuario pega API Key en modal
   ↓
   Frontend lo guarda en localStorage

5. Usuario sube imagen + describe
   ↓
   Click "Generate Prompt"

6. Frontend envía POST a /api/analyze-media
   (URL relativa, mismo servidor)
   ↓

7. Express recibe en:
   POST /api/analyze-media
   (handler en server-unified.js)

8. Backend procesa con Claude
   ↓

9. Retorna JSON

10. Frontend muestra resultado
    ↓
11. ✅ FUNCIONA PERFECTAMENTE
```

---

## 📊 Comparación

### DOS SERVIDORES (Anterior)
```
Terminal 1: npm run server      (localhost:3001)
Terminal 2: npm run dev         (localhost:3000)
Desarrollo: 2 terminales
Producción: 2 procesos
Complejidad: Alta ⚠️
```

### UN SERVIDOR (Nuevo)
```
Terminal 1: npm start           (localhost:3000)
Desarrollo: 1 terminal
Producción: 1 proceso
Complejidad: Baja ✅
```

---

## ✨ Ventajas

✅ **UN solo puerto (3000)**
✅ **UN solo proceso**
✅ **Más simple**
✅ **Más fácil desplegar**
✅ **Funciona en servidor estático que ejecute Node.js**
✅ **Sin problemas de CORS**
✅ **URL relativa /api/... (no hardcoded localhost:3001)**

---

## 🌐 Desplegar en Producción

Puedes desplegar en cualquier plataforma que soporte Node.js:

### Vercel
```bash
vercel deploy
```

### Heroku
```bash
heroku create
git push heroku main
```

### Railway
```bash
railway link
railway deploy
```

### Servidor propio (VPS)
```bash
npm install
npm run build
npm start
```

Luego: https://tudominio.com

---

## 🧪 Testing Local

```bash
# 1. Compila
npm run build

# 2. Ejecuta
node server-unified.js

# 3. Abre browser
http://localhost:3000

# 4. Prueba completa
- Modal API Key
- Sube imagen
- Genera prompt
- ✅ Funciona
```

---

## 📁 Estructura Final

```
moga-studio-v2-final/
├── server-unified.js    (UN servidor para todo)
├── claudeService.ts     (usa URL relativa /api/...)
├── App.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
├── ... otros archivos
├── dist/                (generado por npm run build)
│   ├── index.html
│   ├── assets/
│   └── ...
└── node_modules/        (npm install)
```

---

## 🔧 package.json Recomendado

```json
{
  "name": "moga-studio",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server-unified.js",
    "start": "npm run build && node server-unified.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "lucide-react": "^0.474.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.1",
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^4.2.1",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

---

## 🎯 Respuesta a tu pregunta

**¿Puedo ponerlo en un servidor estático?**

**Corta:** NO completamente

**Opciones:**
1. **Servidor estático puro** → Frontend SÍ, Backend NO
2. **Servidor Node.js** → Todo funciona (server-unified.js)
3. **Plataforma como Vercel/Heroku** → Todo funciona automático

**Recomendación:** Usa `server-unified.js` que sirve todo en UN servidor Node.js

---

## ✅ Conclusión

Con `server-unified.js`:

✅ Un solo servidor
✅ Un solo puerto (3000)
✅ Frontend + Backend integrados
✅ Fácil de desplegar
✅ Funciona en producción
✅ **Responde a tu pregunta: SÍ funciona normal**

---

## 📥 Descargar

```
server-unified.js     (NUEVO)
claudeService.ts      (ACTUALIZADO)
+ 11 otros archivos
```

---

## 🚀 Quick Start

```bash
npm install
npm run build
npm start
```

**Abre:** `http://localhost:3000`

**¡FUNCIONA PERFECTAMENTE!** ✨
