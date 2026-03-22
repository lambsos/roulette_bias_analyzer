# Roulette Bias Lab

Web app for **European roulette (0–36)**: record spins, explore uniformity and wheel-sequence patterns, see a frequency chart, and view **theoretical** bet rankings from a smoothed model. The UI labels this as **exploration only — not betting advice**.

Stack: **Nx** monorepo, **Angular** app `roulette-web`, analysis in `libs/roulette-analysis`.

## Run locally

```sh
npm ci
npx nx serve roulette-web
```

## Production build

```sh
npx nx build roulette-web --configuration=production
```

For GitHub Pages at `https://<user>.github.io/<repo>/`, build with a matching base href (see `.github/workflows/deploy-github-pages.yml`).

## GitHub Pages

On push to `main` or `master`, the workflow builds `roulette-web` and deploys `dist/apps/roulette-web/browser`. In the repo: **Settings → Pages → Source: GitHub Actions**.

## License

**Proprietary — all rights reserved.** See [`LICENSE`](LICENSE). There is **no** open-source grant: viewing the demo or this repo does **not** give permission to copy, fork, or reuse the code. For licensing or commercial use, contact the copyright holder named in `LICENSE`.

## Useful Nx commands

```sh
npx nx show project roulette-web
npx nx graph
```
