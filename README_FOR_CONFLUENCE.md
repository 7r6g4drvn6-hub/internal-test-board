# Bench Release Board - Publish Package

This folder is ready to be hosted as a static internal website.

## Files

- `index.html`: page entry
- `styles.css`: page styles
- `script.js`: page logic
- `.nojekyll`: disables Jekyll processing for GitHub Pages
- `package-info.json`: generated package metadata

## Recommended Confluence Usage

1. Host this `publish` folder on an internal static web location.
2. Use the generated HTTPS URL as the link target in Confluence.
3. Add this short description near the link:

```text
Bench Release Board
Maintainer: Xu Xuan
Update frequency: twice per week
Please use the request email section on the page for bench usage needs or bench status changes.
```

## Important Data Note

This page is a static browser page. Direct edits in the browser are saved locally in that browser.
To make updates visible to everyone, update the source page/package and republish this folder to the same URL.

Do not use `file://`, `localhost`, or a personal computer path as the Confluence link. Other users will not be able to open those.
