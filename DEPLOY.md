# Getting this live — no terminal needed

## 1. Create the GitHub repo (~2 minutes)

1. Go to **github.com/new** (you'll be logged in as Roy481977).
2. Repository name: `rain-gib-model` · set it to **Private** · click **Create repository**.
3. On the empty-repo page, click the small **"uploading an existing file"** link.
4. Drag **all the files in this folder** into the upload area — including the `api` folder
   (drag the folder itself; GitHub keeps the structure). Files: `index.html`, `middleware.js`,
   `package.json`, `README.md`, `DEPLOY.md`, `rain-gib-defaults-baseline.json`, and `api/defaults.js`.
5. Click **Commit changes**.

## 2. Deploy on Vercel (~2 minutes)

1. Go to **vercel.com** and log in (same account as luckymay-model).
2. Click **Add New… → Project**.
3. Find `rain-gib-model` in the repo list and click **Import**.
   (If it doesn't appear: click "Adjust GitHub App Permissions" and grant access to the new repo.)
4. Leave every setting as-is (no framework, no build command) and click **Deploy**.
5. Done — you'll get a URL like `rain-gib-model.vercel.app`.

## 3. Two small settings

- **Password**: the site is gated by a shared password, currently `123456`.
  Change it in `middleware.js`, line 2 (`const PASSWORD = '...'`) — edit the file
  directly on GitHub (pencil icon) and commit; Vercel redeploys automatically.
- **"Save as default" button** (optional): to make saved assumption sets persist,
  in Vercel open the project → **Storage** tab → **Create Database → Blob** → connect it
  to this project. That's it — the app works fine without this; it just won't remember
  saved defaults between visits until the Blob store is connected.

## Updating the model later

Edit any file on GitHub (or ask Claude for a new version and re-upload) — every commit
auto-deploys to the same URL.
