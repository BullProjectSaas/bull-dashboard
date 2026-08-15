# 🐂 Bull Partners™ Dashboard

Dashboard multi-cliente en React que lee datos directamente desde Google Sheets (sin backend, sin auth) y se hostea en GitHub Pages.

## Multi-cliente

El Sheet ID se lee desde el parámetro `?sheet=` de la URL. Si no está presente, se usa el Sheet ID por defecto.

```
https://bullprojectsaas.github.io/bull-dashboard                         → cliente por defecto
https://bullprojectsaas.github.io/bull-dashboard?sheet=ID_DEL_CLIENTE_2  → otro cliente
```

Para un cliente nuevo alcanza con compartir la URL con su `?sheet=ID_DEL_SHEET`, sin tocar el código.

## Fuente de datos

El Sheet debe estar compartido públicamente ("Cualquier persona con el enlace puede ver") y contener estas hojas, con estos nombres exactos:

- `01 - Data Ventas Form`
- `02 - Métricas Anuncios`
- `03 - Tally leads`

Los datos se leen vía la Google Visualization API (`gviz`), sin necesidad de API key.

## Desarrollo

```bash
npm install
npm run dev
```

## Build y deploy a GitHub Pages

```bash
npm run build
npm run deploy
```

`npm run deploy` publica el contenido de `dist/` en la rama `gh-pages` usando [gh-pages](https://www.npmjs.com/package/gh-pages). Asegurate de tener GitHub Pages configurado para servir desde esa rama en la configuración del repositorio.
