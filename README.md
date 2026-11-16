# PsikoLatih

Static Astro 7 site, deployed to Cloudflare Pages (Pages Functions handle login and progress). Content was migrated from the Claude artifact "PsikoLatih" (psikotest practice app).

Production: https://psikotest-747.pages.dev (Pages project `psikotest`, KV namespace `psikotest-data`).

## 1. Quick start

1. Install dependencies: `npm install`
2. Create `.dev.vars` with `SESSION_SECRET=<any long random string>`
3. Start the dev server: `npm run dev`
4. Test the production build locally (with Functions and KV): `npm run preview`

## 2. Deploy

First-time setup (once):

1. `npx wrangler login`
2. `npx wrangler kv namespace create psikotest-data` (the name `DATA` is taken by sap-learn on this account; the binding stays `DATA`), then paste the printed id into `wrangler.jsonc` (`kv_namespaces[0].id`)
3. `npx wrangler pages project create psikotest --production-branch main`
4. `npx wrangler pages secret put SESSION_SECRET --project-name psikotest`

After that, deploys happen on push to `main` (see CI/CD). `npm run deploy` is only a manual fallback. Deploy from `main` only.

### Login & admin

- Sign-up needs an invite code. An admin creates one at `/admin` ("Buat kode baru"); each code works for one sign-up and expires after 30 minutes. Send the participant `/login?invite=<code>`.
- `/admin` also lists participants (tests taken, last score, last active) and shows each one's progress on tap. Admin only; there are no roles.
- Progress lives in localStorage (`psikolatih.v1`) and is synced per user to KV (binding `DATA`, key `progress:<name>`).
- Admins are users whose KV record `user:<name>` has `"admin": true`.
- **First admin bootstrap** (no admin exists yet to create an invite):
  1. Put a temporary invite: `npx wrangler kv key put invite:<code> '{"expires":<ms-epoch-in-future>}' --binding DATA --remote`
  2. Register at `/login?invite=<code>`.
  3. Read the record: `npx wrangler kv key get user:<name> --binding DATA --remote`
  4. Put it back with `"admin":true` added: `npx wrangler kv key put user:<name> '<json>' --binding DATA --remote`
- Local dev: add `--local` instead of `--remote` to the same commands.
- There is no login rate limiting yet.

### CI/CD

- **Deploy:** Cloudflare Pages is connected to this GitHub repo. A push to `main` builds (`npm run build`, output `dist`) and deploys production; every PR gets a preview URL posted by Cloudflare.
- **Checks:** `.github/workflows/ci.yml` runs `npm test` + `npm run build` on PRs and on `main`. No Cloudflare token is needed in GitHub.
- Build uses Node 24 (`.node-version`). KV binding comes from `wrangler.jsonc`; secret `SESSION_SECRET` lives in the Pages project settings.

## 3. Project layout

Generated from the artifact by `npm run sync`. **Do not hand-edit these files.** Re-sync instead.

- `src/styles/app.css`: styles
- `src/shell.html`: page shell (markup inside `<body>`)
- `public/app.js`: client script

Everything else (pages, `functions/`, config, scripts) is hand-maintained.

## 4. Updating from the artifact

Source: https://claude.ai/artifact/8sxk2rXZb73VQnKjuZoFMX

1. Ask Claude Code to read the artifact above and save its HTML to a local file, e.g. `artifact.html`.
2. Split the saved HTML into the generated files: `npm run sync -- artifact.html`
3. Review the changes: `git diff`
4. Commit the changes.
5. Deploy: `npm run deploy`

## 5. Git workflow (trunk-based)

`main` is the trunk. It is always deployable.

1. Branch from up-to-date `main`. Name it `<name>/<task>`, e.g. `andre/sync-artifact-2026-11-16`.
2. Keep the branch short-lived. Commit small and often.
3. Rebase on `main` before opening the PR: `git fetch && git rebase origin/main`
4. Open a PR into `main`.
5. Merge fast once it is reviewed and green.
6. Delete the branch after merging.
7. Deploy from `main`: `npm run deploy`
