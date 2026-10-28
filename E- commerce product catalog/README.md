# Forma: Objects for Living

A responsive homewares catalog built with React and Vite. Product data is fetched from `public/products.json` when the app loads.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run build
npm run lint
```

## Catalog data

Edit `public/products.json` to add or update products. Each product has an `id`, `order`, `name`, `category`, `price`, `detail`, `image`, and `imageAlt`; `label` is optional. Product images are loaded from their image URLs.

The catalog supports text search, category filters, sorting, favorites, and a quantity-adjustable shopping bag.
