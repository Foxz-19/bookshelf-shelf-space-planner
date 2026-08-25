# Shelfwise

A browser-only bookshelf shelf-space planner. Set a shelf width, add book spine widths, and see remaining capacity immediately.

## Run

Open `index.html` with a local static server, or run:

```bash
npm install
npm start
```

## Verify

`npm test` runs TypeScript checking, Node tests, and the Playwright browser smoke test. The browser test requires Python 3, then:

```bash
pip install -r requirements-dev.txt
playwright install chromium
```
