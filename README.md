# UPSC ZONE AI — GitHub Pages-ready static website

This project is a frontend-only multi-page website built with HTML, CSS and JavaScript. It does not require Node.js, a backend, a database, or environment variables.

## Pages included
- `index.html` — homepage
- `preparation.html` — subjects, resources and daily checklist
- `current-affairs.html` — searchable illustrative briefing cards
- `world-affairs.html` — regional and international-relations study themes
- `practice.html` — interactive quiz with explanations and score
- `syllabus.html` — searchable syllabus checklist
- `previous-year-questions.html` — practice questions with filters and explanations
- `subjects/` — Polity, History, Geography, Economy, Environment and Ethics pages

## Deploy on GitHub Pages
1. Extract this ZIP.
2. Create a new repository on GitHub.
3. Upload **all files and folders inside this project folder** to the repository's root. Make sure `index.html` is directly in the root, not inside an extra nested folder.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/(root)`, then click **Save**.
7. Wait for the Pages deployment to finish. Open the published URL shown in **Settings → Pages**.

The included `.nojekyll` file helps GitHub Pages serve the project as a plain static site. You can also test locally by opening `index.html` or using VS Code Live Server.

## Study Mentor limitations
The floating “Ask Study Mentor” widget is frontend-only and uses built-in demo guidance and sample questions. It is **not a live generative AI chatbot**. A real AI model requires a remote AI service or backend; putting a private API key in browser JavaScript would expose it publicly, so this version intentionally does not do that.

## Other notes
- No login/account system or database is included.
- Checklist/progress data is saved in the current browser using local storage; it does not sync across devices.
- Current-affairs cards are illustrative examples, not live news.
- Practice questions are examples and are not represented as verbatim official UPSC past-paper questions.
- Verify official syllabus and exam information against the current UPSC notification.
