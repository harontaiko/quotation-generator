# Quotation and Invoice Generator

This is a simple web app for creating quotations and invoices. You can edit company details, customer details, items, dates, tax, notes, and terms. You can also add a logo and download the document as a PDF.

## Run the app

You need Node.js 24 and npm.

```bash
npm install
npm start
```

Open the local address shown in the terminal.

## Save documents

Your current document is saved automatically in your browser. It is kept on this device only.

Use **Save a copy** in the left sidebar to keep a named quotation or invoice. Select a saved file to open it again. Use the plus button to start a new document.

Saved documents are stored in browser local storage. Clearing browser data will remove them. They are not uploaded to a server.

## Test and build

```bash
npm test -- --watchAll=false
npm run vercel-build
```

The production files are created in the `build` folder.

## Deploy

The GitHub Actions workflow tests and builds the app with Node.js 24. A push to `master` deploys the app to Vercel. Pull requests create a Vercel preview.

Set these GitHub secrets before deployment:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`