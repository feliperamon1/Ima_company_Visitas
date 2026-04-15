# FieldOps — Gestión de Operaciones en Campo

## Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube el proyecto a GitHub:**
   ```bash
   cd fieldops-app
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create fieldops-app --public --push
   ```
   O crea el repositorio manualmente en github.com y sube los archivos.

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión
   - Click en **"Add New Project"**
   - Selecciona tu repositorio **fieldops-app**
   - Vercel detecta Vite automáticamente. Solo haz click en **"Deploy"**
   - ¡Listo! Tu app estará en `https://fieldops-app.vercel.app`

### Opción 2: Desde la terminal con Vercel CLI

1. **Instala Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Despliega:**
   ```bash
   cd fieldops-app
   npm install
   vercel
   ```
   Sigue las instrucciones en pantalla. Para producción:
   ```bash
   vercel --prod
   ```

## Credenciales Demo

| Rol         | Email                    | Contraseña |
|-------------|--------------------------|------------|
| Admin       | admin@fieldops.co        | admin      |
| Trabajador  | jcrodriguez@fieldops.co  | worker     |
| Trabajador  | matorres@fieldops.co     | worker     |
| Trabajador  | camejia@fieldops.co      | worker     |
