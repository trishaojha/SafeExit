# SafeExit 🛡️

A discreet web app for domestic violence survivors — disguised as a homework planner.

## Features

| Feature | How it works |
|---|---|
| **Panic disguise** | One tap hides the real app and shows a fake "StudyTrack" homework planner |
| **Shelter locator** | Enter a zip code → shows nearby DV shelters from a built-in database |
| **Safety checklist** | Interactive checklist of documents & essentials to prepare |
| **Encrypted log** | PIN-protected incident log stored **only on the device** — never uploaded |
| **Emergency info** | National DV Hotline (1-800-799-7233) shown prominently |

## Setup (GitHub Pages)

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your app will be live at `https://YOUR_USERNAME.github.io/safeexit/`

No build step. No server. No dependencies except Google Fonts (CDN).

## Privacy

- **Zero server communication.** All data (PIN, checklist, log entries) lives in `localStorage` on the user's device.
- Clearing browser data or using a private/incognito window leaves no trace.
- The disguise button instantly switches the visual to an innocent homework tracker.

## Extending the Shelter Database

Edit the `SHELTER_DB` object in `app.js`. Keys are the first 3 digits of a zip code:

```js
"123": [
  { name: "Shelter Name", city: "City, ST", phone: "(555) 000-0000", tags: ["Open 24/7"] },
]
```

## Resources

- [National DV Hotline](https://www.thehotline.org) — 1-800-799-7233
- [Crisis Text Line](https://www.crisistextline.org) — Text HOME to 741741
- [WomensLaw.org](https://www.womenslaw.org) — Legal resources by state
