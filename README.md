# EVLE Calendar V3.6 GitHub Pages

This version is based on V3.5 and adds an in-page CSV table editor panel for event data.

## New in V3.6
- Calendar renders immediately on page load using starter events, then refreshes when `events.csv` loads.
- In-page CSV table editor panel.
- Add Row button.
- Apply Table Changes button.
- Per-row delete buttons.
- Category dropdowns in the table use the approved category list.
- Applying table changes updates the calendar and auto-saves to GitHub if settings are configured.

## Retained from V3.5
- Current-month default view.
- Previous / Next month navigation.
- 1 Month and 3 Months view.
- Sidebar event editor.
- Fixed category dropdown.
- Category legend and colors.
- CSV load/download/import.
- Manual Save to GitHub button.
- Automatic GitHub save after event saves/deletes.
- localStorage for local draft edits.

## GitHub token note
Use a fine-grained token limited to this repository with Contents read/write permission. Do not hard-code the token into the files.
