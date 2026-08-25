# Testing

Install the project and browser-test dependency once:

```sh
npm install
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
```

Run every check with:

```sh
npm run build
npm run test:all
```
