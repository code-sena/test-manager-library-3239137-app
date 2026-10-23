# test-manager-library-3239137-app

Frontend de **Manager Library** en React. Son las pantallas de operación: lo que
usan el administrador y el bibliotecario.

## Puesta en marcha

```bash
cp .env.example .env     # VITE_API_URL apunta a la API
npm install
npm run dev              # http://localhost:5173
```

Con `infra` levantado no hace falta nada de esto: el compose construye y sirve
este repositorio.

## Pantallas

| Ruta | Qué resuelve | Rol |
|---|---|---|
| `/entrar` | Inicio de sesión | público |
| `/libros` | Catálogo: búsqueda, filtro, alta, edición, baja y portada | ver todos; mantener solo admin |
| `/socios` | Lista, búsqueda y alta de socios | admin y bibliotecario |
| `/prestar` | Elegir socio y hasta 3 libros, registrar el préstamo | admin y bibliotecario |
| `/prestamos` | Filtrar por fecha y estado, devolver línea por línea | admin y bibliotecario |
| `/vencidos` | Qué libro, qué socio y cuántos días de retraso | admin y bibliotecario |
| `/reporte` | Libros más prestados por rango de fechas | solo admin |

## Cómo está organizado

```
src/
├── api.js          <- el único sitio que conoce la URL y el token
├── App.jsx         <- rutas, menú y guardia por rol
├── components/     <- Banner, Pager, Cover
└── pages/          <- una pantalla por archivo
```

## Decisiones

- **La autorización de verdad está en la API.** El menú esconde el reporte a
  quien no es admin, pero el 403 lo da el backend: el frontend no es la puerta,
  solo evita un clic que iba a fallar.
- **Los errores se muestran como vienen.** El backend manda un cuerpo único
  `{ code, message, details }` ya en español, así que `Banner` lo pinta tal cual
  en vez de inventar textos por código de estado.
- **Las portadas se piden con el token.** Un `<img src>` no puede enviar la
  cabecera `Authorization`, así que `Cover` trae el binario y lo convierte en
  una URL de objeto, que libera al desmontarse.
- **Sin librería de componentes.** Siete pantallas con tablas y formularios no
  justifican arrastrar un sistema de diseño entero.
