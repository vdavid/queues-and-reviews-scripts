This is a project to automate things around my Queues and Reviews sheet in Google Sheets.

## Environment

Uses these inputs from script properties:

- aylienApplicationID
- aylienApplicationKey
- existUsername
- existPassword
- goodreadsApiKey
- omdbApiKey

The target spreadsheet is [here](https://docs.google.com/spreadsheets/d/15ccFkUaWRUZtLk0C0dT8EN9qYWf_1aah0WoD4ii5rpQ/edit#).

## Development

Use `yarn watch` to develop.

Use `yarn push` for a single deploy.

- Known issue: need to manually delete `.eslintrc.gs` and `tsconfig.gs`. `.claspignore` should ignore it but it's [broken](https://github.com/google/clasp/issues/66).
- Go to the [script](https://script.google.com/home/projects/1PG2YTlZFJUzIvlgZOqXoK0RzmpLKs8jT-9XJuJXZnN6toD8FBoN4eQMS/edit) to run it
