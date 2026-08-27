# Quotation and Invoice Generator

A web app for creating quotations and invoices. Edit company details, customer
details, items, dates, tax, notes and terms, add a logo, then download the
document as a PDF. Everything is stored in your browser — nothing is uploaded.

## Run the app

You need Node.js 24 and npm.

```bash
npm install
npm start
```

Open the local address shown in the terminal.

## Working on a document

The editor toolbar above the page holds everything you need while writing:

- **Quotation / Invoice** switch — swaps the heading and the date labels. Any
  wording you have typed yourself is left untouched.
- **Live total** — the item count and running total, always visible.
- **Options** — the panel of document settings described below.
- **Print** — prints just the document sheet, without the app around it.
- **Download PDF** — saves the document, named after its number or client.

### Line items

Each line has controls for **move up**, **move down**, **duplicate** and
**remove**. On a mouse they appear in the page margin as you hover a line; on a
touch screen they sit under the line. **Add from my items** drops a saved item
straight onto the document.

### Options panel

- **Currency** — pick from a list, or type any code directly on the total row.
- **Tax / VAT** — turn on or off, rename the label, set the rate as a number.
- **Discount** — a percentage or a fixed amount, applied before tax.
- **Shipping / other charge** — a named extra added after tax.
- **Payment details** — a block for bank or mobile money details.
- **Signature block** — a name and signature line at the foot of the document.
- **Manage saved items** — reopens the item catalogue.

Totals are calculated as: subtotal − discount, then tax on that amount, then
shipping.

## Screens

The layout adapts to the screen it is on. On a phone the saved-files list
becomes a slide-in drawer and each line item becomes a labelled card; on a
tablet and up the document keeps its normal table layout beside the sidebar.

## Save documents

Your current document is saved automatically in your browser, on this device
only.

Use **Save a copy** in the sidebar to keep a named quotation or invoice. Select
a saved file to open it again, then **Update** to save changes back to it. You
can also rename, delete or duplicate a saved document, and **Export as file** /
**Import a file** move a document between devices as JSON.

Saved documents live in browser local storage. Clearing browser data removes
them. They are not uploaded to a server.

## Saved items

On the first visit you are asked which categories you sell in, and can then
save items with a name, price and category. Saved items can be added to any
document in one click. This step is optional — skip it and type items straight
onto the document instead.

## Test and build

```bash
npm test -- --passWithNoTests --watchAll=false
npm run vercel-build
```

The production files are created in the `build` folder.

## Deploy

The GitHub Actions workflow tests and builds the app with Node.js 24. A push to
`master` deploys the app to Vercel. Pull requests create a Vercel preview.

Set these GitHub secrets before deployment:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
