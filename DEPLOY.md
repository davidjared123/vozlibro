# Guía de Despliegue para VozLibro

¡Tu aplicación está lista para salir al mundo! Sigue estos pasos para subirla a GitHub y desplegarla en Vercel (la mejor opción para Next.js).

## 1. Preparar el Repositorio Local

Primero, asegúrate de guardar todos tus cambios locales:

```bash
git add .
git commit -m "Versión lista para producción: VozLibro con persistencia y reproductor avanzado"
```

## 2. Crear el Repositorio en GitHub

1.  Ve a [GitHub.com](https://github.com) y crea un **New Repository**.
2.  Ponle un nombre (ej: `voz-libro`).
3.  **No** inicialices con README, .gitignore ni License (ya los tenemos).
4.  Copia la URL del repositorio (ej: `https://github.com/tu-usuario/voz-libro.git`).

## 3. Conectar y Subir

Ejecuta estos comandos en tu terminal (reemplaza la URL con la tuya):

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/voz-libro.git
git push -u origin main
```

## 4. Desplegar en Vercel

1.  Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
2.  Haz clic en **"Add New..."** -> **"Project"**.
3.  Importa tu repositorio `voz-libro`.
4.  **IMPORTANTE**: En la sección **Environment Variables**, añade las claves de Supabase que tienes en tu archivo `.env.local`:
    *   `NEXT_PUBLIC_SUPABASE_URL`: (Tu URL de Supabase)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Tu clave Anon de Supabase)
5.  Haz clic en **Deploy**.

¡Y listo! En unos minutos tendrás tu URL pública (ej: `voz-libro.vercel.app`).

## Notas Adicionales

*   **Base de Datos**: Asegúrate de que tu proyecto en Supabase esté configurado para aceptar conexiones desde el dominio de Vercel (normalmente no hace falta configuración extra si usas la API estándar).
*   **Políticas de Seguridad**: Recuerda revisar las políticas RLS en Supabase para producción si vas a tener usuarios reales.
