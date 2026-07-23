# EVLE Calendar V3.5 GitHub Pages

This build is based on V3.4 and adds automatic GitHub publishing when an event is saved or deleted.

## Files
- `index.html`
- `styles.css`
- `app.js`
- `events.csv`
- `.nojekyll`
- `README.md`

## Change in V3.5
When a user saves or deletes an event, the app now:

1. Saves the event locally in the browser.
2. Refreshes the calendar immediately.
3. Automatically calls the existing GitHub save routine if GitHub settings are present.

If GitHub settings are not present, the event still saves locally and the status message tells the user to add GitHub settings.

## Required GitHub settings
In the sidebar, enter:
- Owner / Org
- Repository
- Branch
- CSV path, usually `events.csv`
- Fine-grained GitHub token with Contents read/write permission for the repository

## Existing features retained
- Current-month default view
- Previous / Next month navigation
- 1 Month view
- 3 Months view
- Sidebar event editor
- Fixed category dropdown
- Category legend and colors
- CSV load/download/import
- Manual Save to GitHub button
- localStorage for local draft edits

## Token note
Do not hard-code the token into the files. The website stores the token only in the browser localStorage.
