# NEXO · copiloto financiero

Prototipo funcional en React + Vite pensado para celular. Los datos del usuario se guardan en su navegador (localStorage). El copiloto usa IA real a través de una función de servidor.

## Ejecutar en local
```bash
npm install
cp .env.example .env     # pega tu clave de Anthropic en ANTHROPIC_API_KEY
npm run dev
```
Sin clave todo funciona igual: el copiloto responde con cálculos locales y lo avisa en el chat.
Para verlo como celular: Chrome, F12, Ctrl + Shift + M.

## Qué incluye
- Onboarding según el Figma: carrusel que se puede saltar, ingreso exacto y primera meta obligatoria.
- Registro de gastos por formulario o por voz/frase libre ("gasté 15 mil en almuerzo", "ayer 12 mil en bus"), con opción Hoy/Ayer y atajo para repetir un gasto reciente.
- Corregir sin miedo: deshacer justo después de guardar, editar o eliminar cualquier gasto (la eliminación también se deshace) y aviso si un monto es mayor que tus ingresos.
- Ayuda en contexto: un "?" explica cómo se calcula "Puedes gastar al día" y qué es la racha.
- Metas con abonos, ajuste y celebración al cumplirlas.
- Racha de días y recompensas que se canjean (consejo personalizado, días de NEXO Pro).
- Copiloto: las cifras se calculan en el dispositivo y la IA las explica. Solo viajan números agregados, nunca las descripciones de los gastos.
- Comunidad: buscar, filtrar, preguntar, responder, marcar como útil, moderación por reglas y aviso simulado.
- Botón "Cargar datos de ejemplo" en Perfil para ensayar la presentación.
- Colores a elección del usuario (4 paletas) desde Perfil. Se guardan en su dispositivo.
- Las cifras se muestran con puntos (1.500.000), los campos aceptan hasta 10 dígitos y las cifras grandes se ajustan solas para no cortarse.

## Revisión de UX con Claude Code
En `.claude/skills/ux-expert/SKILL.md` está la skill `ux-expert`, que revisa pantallas con las 10 heurísticas de Nielsen. Úsala desde Claude Code abierto en la carpeta que contiene `.claude`:
```
/ux-expert revisa src/pages/Home.jsx
```

## Publicar (Vercel)
1. Sube el repo a GitHub.
2. En Vercel: Add New Project, elige el repo (detecta Vite solo).
3. En Settings, Environment Variables, agrega `ANTHROPIC_API_KEY`.
4. Deploy. La carpeta `api/` se publica sola como función de servidor.

## Seguridad y privacidad
- La clave de la IA vive solo en el servidor. Nunca uses una variable `VITE_*` para secretos.
- `.env` está en `.gitignore`. No lo subas.
- NEXO no pide credenciales bancarias.
- Límite básico de 20 consultas por minuto por IP en `api/copilot.js` (en serverless es de mejor esfuerzo).

## Pendiente para una versión real
- Cuentas y sincronización entre dispositivos (por ejemplo Supabase con reglas RLS).
- Foro multiusuario con moderación humana, reportes y notificaciones push.
- Dictado por voz fuera de Chrome y Safari.
- Revisar los nombres de modelo en la documentación de Anthropic (`ANTHROPIC_MODEL`, `ANTHROPIC_MODEL_PRO`).
