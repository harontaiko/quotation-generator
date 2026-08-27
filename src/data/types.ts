import { CSSProperties } from 'react'

export type DocumentType = 'quotation' | 'invoice'

export type DiscountType = 'percent' | 'fixed'

export interface ProductLine {
  description: string
  quantity: string
  rate: string
}

export interface Invoice {
  documentType: DocumentType

  logo: string
  logoWidth: number
  title: string
  companyName: string
  name: string
  companyAddress: string
  companyAddress2: string
  companyCountry: string

  billTo: string
  clientName: string
  clientAddress: string
  clientAddress2: string
  clientCountry: string

  invoiceTitleLabel: string
  invoiceTitle: string
  invoiceDateLabel: string
  invoiceDate: string
  invoiceDueDateLabel: string
  invoiceDueDate: string

  productLineDescription: string
  productLineQuantity: string
  productLineQuantityRate: string
  productLineQuantityAmount: string

  productLines: ProductLine[]

  subTotalLabel: string

  taxEnabled: boolean
  taxLabel: string
  taxRate: string

  discountEnabled: boolean
  discountLabel: string
  discountRate: string
  discountType: DiscountType

  shippingEnabled: boolean
  shippingLabel: string
  shippingAmount: string

  totalLabel: string
  currency: string

  notesLabel: string
  notes: string
  termLabel: string
  term: string

  paymentEnabled: boolean
  paymentLabel: string
  paymentDetails: string

  signatureEnabled: boolean
  signatureLabel: string
  signatureName: string
}

export interface SavedInvoice {
  id: string
  name: string
  updatedAt: string
  invoice: Invoice
}

export interface MyProduct {
  id: number
  name: string
  price: number
  category: string
}

export interface CSSClasses {
  [key: string]: CSSProperties
}
