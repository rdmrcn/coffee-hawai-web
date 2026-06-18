# Coffee Hawai — Mini Catalog (Web)

**Student:** Reha Demircan  
**Project:** Flutter Mini Catalog — Coffee Hawai coffee shop catalog  
**Platform:** Web (Chrome mobile view) — approved by instructor

Hawaiian-themed coffee catalog with home, menu, product detail, cart, and locations.

## Quick Start

```bash
npx serve -l 8080 .
```

Open: **http://localhost:8080**

> Do not open `index.html` directly. A local server is required.

## Chrome Mobile View (for review)

1. `F12` → `Ctrl + Shift + M`
2. Select **iPhone 14**
3. Browse: Home → Menu → Detail → Cart

## Project Structure

```
index.html
styles.css
app.js
assets/
  products.json       12 coffee items (JSON simulation)
  coffees/            12 product images
screenshots/          App screenshots for submission
```

## Features (PDF requirements)

| Requirement | Status |
|---|---|
| Home page | ✅ |
| Product list (GridView-style grid) | ✅ |
| Product detail | ✅ |
| Page navigation | ✅ |
| JSON + model data (`products.json`) | ✅ |
| Search & filter | ✅ |
| Cart state (add, qty, total) | ✅ |
| Asset management (images + JSON) | ✅ |
| Screenshots | 📁 Add to `screenshots/` |

## Tech

- HTML, CSS, JavaScript
- No build step required
- Node.js only for local server (`npx serve`)

## Author

owned by Reha Demircan — Coffee Hawai, since 2012
