This is a project to automate things around my Queues and Reviews sheet in Google Sheets.

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

- Use `yarn watch` to start watching files.
- Go to the [script](https://script.google.com/home/projects/1PG2YTlZFJUzIvlgZOqXoK0RzmpLKs8jT-9XJuJXZnN6toD8FBoN4eQMS/edit) to run it

## Deployment

- Use `yarn push` for a single deploy. (This is included in `yarn watch`.)