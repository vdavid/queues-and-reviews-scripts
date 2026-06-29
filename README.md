# Queues and Reviews scripts

This is a project to automate things around my Queues and Reviews sheet in Google Sheets.

It uses Google Apps Script, TypeScript, pnpm, and Jest. Node is pinned to 26 via mise (`.mise.toml`).

esbuild (with `esbuild-gas-plugin`) bundles everything into a single `dist/Code.js`, which clasp v3 pushes. The
bundler hoists every entry point (`onOpen`, `doGet`, the `fillMissing…` functions, `fillExistDiaryItems`, and
`checkLujzaSickness`) to the global scope that Google Apps Script needs for menus, triggers, and the web app. See
`build.mjs`.

## Environment

Uses these inputs from script properties:

- aylienApplicationID
- aylienApplicationKey
- existUsername
- existPassword
- goodreadsApiKey
- omdbApiKey
- geminiApiKey

The target spreadsheet is [here](https://docs.google.com/spreadsheets/d/15ccFkUaWRUZtLk0C0dT8EN9qYWf_1aah0WoD4ii5rpQ/edit#).

## Sections and features

### Articles

- Uses Aylien API to get the metadata for articles.
- Has a webapp deployed to make the article reviews available in JSON. See it [here](https://script.google.com/macros/s/AKfycby6iNqW8-KWFiudJqWZEiGR-nRa38sJ0uMDs7-Da4KFlZ4gRKM/exec). I dont think it's actually used, though. veszelovszki.com/r uses the Google Sheets API directly.

### Books

Uses Goodreads API to get the metadata for books.

### Diary

- Downloads the diary from Exist.io.
- Uses Gemini ([models/gemini-2.0-flash-exp](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.0-flash)) to parse some aspects of the diary.

### Movies

- Uses OMDB API to get the metadata for movies.

## Development

- Build the bundle with `pnpm build` (writes `dist/Code.js` and copies `appsscript.json`).
- Go to the [script](https://script.google.com/home/projects/1PG2YTlZFJUzIvlgZOqXoK0RzmpLKs8jT-9XJuJXZnN6toD8FBoN4eQMS/edit) to run it.
- Run `pnpm typecheck && pnpm lint:fix && pnpm test` to check everything before committing and pushing.

## Deployment

- Use `pnpm push` to build and push to Google Apps Script.
- Use `pnpm deploy` to build, push, and create a new versioned deployment.