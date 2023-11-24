import { ProductLine, Invoice } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  quantity: '1',
  rate: '0.00',
}

export const initialInvoice: Invoice = {
  logo: '',
  logoWidth: 100,
  title: 'QUOT NAME',
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
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: '',
  invoiceDueDateLabel: 'Due Date',
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
  taxLabel: 'VAT (12%)',
  totalLabel: 'TOTAL',
  currency: 'KES',
  notesLabel: 'Notes',
  notes: 'Write your note here.',
  termLabel: 'Terms of Service',
  term: 'Your Terms and other details here',
}
