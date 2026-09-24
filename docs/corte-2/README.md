# Corte 2 — Nexo

Archivo de trabajo en Figma: [Nexo](https://www.figma.com/design/05HeitlDhNb8rproSvnQhR/Nexo)

## 01 · Flujogramas de usuario

Tres flujos: onboarding y registro de gastos, copiloto IA financiera, y foro de la comunidad. Incluyen los caminos felices y los no felices (en rojo).

![Flujogramas de usuario](flujograma/flujogramas-de-usuario.png)

## 02 · Pantallas en baja fidelidad

[Vista general de todas las pantallas](pantallas-baja/00-vista-general.png) · [Mapa de conexiones entre flujos](pantallas-baja/mapa-de-conexiones.png)

### Flujo 1 · Onboarding y registro de datos

Del carrusel de bienvenida al Dashboard, más el registro diario de gastos y la racha.

| 1. Carrusel | 2. Situación inicial | 2b. Campos pendientes | 3. Dashboard |
|---|---|---|---|
| ![](pantallas-baja/f1-01-carrusel-bienvenida.png) | ![](pantallas-baja/f1-02-ingresar-situacion-inicial.png) | ![](pantallas-baja/f1-02b-campos-pendientes-error.png) | ![](pantallas-baja/f1-03-dashboard.png) |

| 4. Registrar gasto | 4b. Error de registro | 5. Gasto guardado + racha |
|---|---|---|
| ![](pantallas-baja/f1-04-registrar-gasto.png) | ![](pantallas-baja/f1-04b-error-registro.png) | ![](pantallas-baja/f1-05-gasto-guardado-racha.png) |

### Flujo 2 · Copiloto IA financiera

Pregunta sobre su dinero, respuesta personalizada, ajuste de meta y recompensa de racha.

| 1. Chat con el Copiloto | 1b. Información insuficiente | 2. Respuesta + recomendación |
|---|---|---|
| ![](pantallas-baja/f2-01-chat-copiloto-ia.png) | ![](pantallas-baja/f2-01b-informacion-insuficiente.png) | ![](pantallas-baja/f2-02-respuesta-recomendacion.png) |

| 3. Meta ajustada o mantenida | 4. Progreso + recompensa |
|---|---|
| ![](pantallas-baja/f2-03-meta-ajustada.png) | ![](pantallas-baja/f2-04-progreso-recompensa.png) |

### Flujo 3 · Foro de la comunidad

Explorar preguntas, publicar una nueva (con validación de normas) y recibir respuestas.

| 1. Feed de preguntas | 2. Detalle de pregunta | 3. Escribir pregunta |
|---|---|---|
| ![](pantallas-baja/f3-01-feed-preguntas.png) | ![](pantallas-baja/f3-02-detalle-pregunta.png) | ![](pantallas-baja/f3-03-escribir-pregunta.png) |

| 3b. Pregunta no válida | 4. Pregunta publicada |
|---|---|
| ![](pantallas-baja/f3-03b-pregunta-no-valida.png) | ![](pantallas-baja/f3-04-pregunta-publicada.png) |

## 03 · Lluvia de ideas · Variaciones de estructura

Tres variaciones (A, B, C) para cinco pantallas clave: onboarding, dashboard, registro de gasto, copiloto y foro.

![Lluvia de ideas](lluvia-de-ideas/lluvia-de-ideas-variaciones.png)

## 04 · Referentes externos

Bancolombia (centro de ayuda) como referente para el foro; Copilot Money y Nequi para el dashboard, el registro de gastos y el tono.

![Referentes externos](referentes/referentes-externos.png)

## Pendiente

- `ui-kit/` — UI kit
- `pantallas-alta/` — pantallas en alta fidelidad
- `presentacion-proceso/` — presentación del proceso
