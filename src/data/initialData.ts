import { ProductLine, Invoice, DocumentType } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  quantity: '1',
  rate: '0.00',
}

export const initialInvoice: Invoice = {
  documentType: 'quotation',
  logo: '',
  logoWidth: 100,
  title: 'QUOTATION',
  companyName: '',
  name: '',
  companyAddress: '',
  companyAddress2: '',
  companyCountry: 'Kenya',
  billTo: 'Bill To:',
  clientName: '',
  clientAddress: '',
  clientAddress2: '',
  clientCountry: 'Kenya',
  invoiceTitleLabel: 'Quotation#',
  invoiceTitle: '',
  invoiceDateLabel: 'Date',
  invoiceDate: '',
  invoiceDueDateLabel: 'Valid Until',
  invoiceDueDate: '',
  productLineDescription: 'Item Description',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityAmount: 'Amount',
  productLines: [
    {
      description: 'Sample Item',
      quantity: '1',
      rate: '0',
    },
  ],
  subTotalLabel: 'Sub Total',
  taxEnabled: true,
  taxLabel: 'VAT',
  taxRate: '12',
  discountEnabled: false,
  discountLabel: 'Discount',
  discountRate: '0',
  discountType: 'percent',
  shippingEnabled: false,
  shippingLabel: 'Shipping',
  shippingAmount: '0',
  totalLabel: 'TOTAL',
  currency: 'KES',
  notesLabel: 'Notes',
  notes: 'Write your note here.',
  termLabel: 'Terms of Service',
  term: 'Your Terms and other details here',
  paymentEnabled: false,
  paymentLabel: 'Payment Details',
  paymentDetails: '',
  signatureEnabled: false,
  signatureLabel: 'Authorised Signature',
  signatureName: '',
}


export const documentTypeLabels: Record<DocumentType, Pick<Invoice, 'title' | 'invoiceTitleLabel' | 'invoiceDateLabel' | 'invoiceDueDateLabel'>> = {
  quotation: {
    title: 'QUOTATION',
    invoiceTitleLabel: 'Quotation#',
    invoiceDateLabel: 'Date',
    invoiceDueDateLabel: 'Valid Until',
  },
  invoice: {
    title: 'INVOICE',
    invoiceTitleLabel: 'Invoice#',
    invoiceDateLabel: 'Invoice Date',
    invoiceDueDateLabel: 'Due Date',
  },
}

const isSwitchableLabel = (field: keyof typeof documentTypeLabels['quotation'], value: string) =>
  value === '' ||
  value === documentTypeLabels.quotation[field] ||
  value === documentTypeLabels.invoice[field] ||
  // wording used by older versions of the app
  (field === 'title' && value === 'QUOT NAME') ||
  (field === 'invoiceTitleLabel' && value === 'Invoice#')

export const applyDocumentType = (invoice: Invoice, documentType: DocumentType): Invoice => {
  const labels = documentTypeLabels[documentType]
  const next: Invoice = { ...invoice, documentType }

  ;(Object.keys(labels) as (keyof typeof labels)[]).forEach((field) => {
    if (isSwitchableLabel(field, invoice[field])) {
      next[field] = labels[field]
    }
  })

  return next
}

export const normalizeInvoice = (raw: unknown): Invoice => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Partial<Invoice> & {
    taxLabel?: string
  }

  const invoice: Invoice = { ...initialInvoice, ...source }

  invoice.productLines =
    Array.isArray(source.productLines) && source.productLines.length > 0
      ? source.productLines.map((productLine) => ({ ...initialProductLine, ...productLine }))
      : [{ ...initialProductLine }]

  if (typeof source.taxRate === 'undefined' && typeof source.taxLabel === 'string') {
    const match = source.taxLabel.match(/([\d.]+)\s*%/)

    if (match) {
      invoice.taxRate = match[1]
      invoice.taxLabel = source.taxLabel.replace(/\(?\s*[\d.]+\s*%\s*\)?/, '').trim() || 'VAT'
    }
  }

  if (typeof source.documentType === 'undefined') {
    invoice.documentType = /invoice/i.test(source.title || '') ? 'invoice' : 'quotation'
  }

  return invoice
}
