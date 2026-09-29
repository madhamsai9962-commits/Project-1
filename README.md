# Student Management System

A browser-based app to add, edit, delete and search students, with automated Jest tests and a GitHub Actions CI pipeline. Data is saved in the browser's `localStorage`.

## Project structure

```
student-management-system/
├── index.html              # App markup
├── style.css               # Styling (light + dark)
├── script.js               # StudentManager logic + UI wiring
├── test.js                 # Jest tests
├── package.json            # Jest configuration
├── .gitignore
└── .github/workflows/ci.yml
```

## Run the app

Open `index.html` in any browser. No build step is needed.

## Run the tests locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm test
```

## Push to GitHub

1. Create an empty repository on GitHub (no README or .gitignore).
2. In the project folder, run:

```bash
git init
git add .
git commit -m "Add Student Management System with CI"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Check the CI run

1. Open your repository on GitHub and click the **Actions** tab.
2. Select the **CI** workflow. It runs on every push and pull request to `main`, on Node 18 and 20.
3. A green check means all tests passed. Open a run to see the Jest output and coverage.

## Optional: host it on GitHub Pages

Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. The app will be live at `https://<your-username>.github.io/<your-repo>/`.

## How it works

- `StudentManager` in `script.js` holds all logic (validation, add, update, remove, search, average) with no DOM dependency, so Jest can test it in Node.
- The UI code runs only when `document` exists, and `module.exports` is set only under Node.
- `package.json` points Jest at `test.js`.
