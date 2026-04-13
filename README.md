# Silly Sort

Silly Sort is a split-screen coding game: you get a randomly generated nonsense “sorting” rule and implement it in Python. Your code runs safely in-browser using Pyodide and the app validates whether you followed the rules.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

## Add new “silly sorts”

Add a new entry in `frontend/src/utils/sillySorts.ts`.

Each sort is defined like:

```ts
{
  name: "Communist Sort",
  description: "...",
  validator: (input, output) => boolean
}
```

