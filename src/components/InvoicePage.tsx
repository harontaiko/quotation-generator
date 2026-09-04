import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { DiscountType, DocumentType, Invoice, MyProduct, ProductLine } from '../data/types'
import { applyDocumentType, initialInvoice, initialProductLine, normalizeInvoice } from '../data/initialData'
import EditableInput from './EditableInput'
import EditableSelect from './EditableSelect'
import EditableTextarea from './EditableTextarea'
import EditableCalendarInput from './EditableCalendarInput'
import EditableFileImage from './EditableFileImage'
import countryList from '../data/countryList'
import Document from './Document'
import Page from './Page'
import View from './View'
import Text from './Text'
import Icon from './Icon'
import { Font } from '@react-pdf/renderer'
import Download from './DownloadPDF'
import format from 'date-fns/format'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 },
  ],
})

const currencyOptions = [
  'KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS', 'RWF', 'ZAR',
  'NGN', 'GHS', 'INR', 'AED', 'CAD', 'AUD', 'JPY', 'CNY',
]

interface Props {
  data?: Invoice
  pdfMode?: boolean
  categories?: string[]
  onChange?: (invoice: Invoice) => void
  onShowCategoryModal: () => void
}

const readMyProducts = (): MyProduct[] => {
  try {
    const stored = JSON.parse(window.localStorage.getItem('myProducts') || '[]')
    return Array.isArray(stored) ? stored : []
  } catch (_e) {
    return []
  }
}

const toNumber = (value: string) => {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const OptionToggle: FC<ToggleProps> = ({ label, checked, onChange, children }) => (
  <div className={'option' + (checked ? ' option--on' : '')}>
    <label className="option__switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="option__track" aria-hidden="true" />
      <span className="option__label">{label}</span>
    </label>
    {checked && children ? <div className="option__body">{children}</div> : null}
  </div>
)

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange, onShowCategoryModal, categories }) => {
  const [invoice, setInvoice] = useState<Invoice>(() =>
    data ? normalizeInvoice(data) : { ...initialInvoice }
  )
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [myProducts, setMyProducts] = useState<MyProduct[]>(readMyProducts)

  const dateFormat = 'MMM dd, yyyy'
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.invoiceDueDate !== ''
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.invoiceDueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30)
  }

  // The saved-item catalogue lives in local storage and can be edited in the
  // items modal, so it is re-read whenever that modal has been used.
  useEffect(() => {
    setMyProducts(readMyProducts())
  }, [categories])

  const handleChange = useCallback(<K extends keyof Invoice>(name: K, value: Invoice[K]) => {
    setInvoice((previous) => ({ ...previous, [name]: value }))
  }, [])

  const handleDocumentType = (documentType: DocumentType) => {
    setInvoice((previous) => applyDocumentType(previous, documentType))
  }

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    setInvoice((previous) => ({
      ...previous,
      productLines: previous.productLines.map((productLine, i) => {
        if (i !== index) {
          return { ...productLine }
        }

        const newProductLine = { ...productLine }

        if (name === 'description') {
          newProductLine[name] = value
        } else if (
          value === '' ||
          value[value.length - 1] === '.' ||
          (value[value.length - 1] === '0' && value.includes('.'))
        ) {
          newProductLine[name] = value
        } else {
          newProductLine[name] = toNumber(value).toString()
        }

        return newProductLine
      }),
    }))
  }

  const handleRemove = (index: number) => {
    setInvoice((previous) => ({
      ...previous,
      productLines: previous.productLines.filter((_productLine, i) => i !== index),
    }))
  }

  const handleAdd = () => {
    setInvoice((previous) => ({
      ...previous,
      productLines: [...previous.productLines, { ...initialProductLine }],
    }))
  }

  const handleDuplicate = (index: number) => {
    setInvoice((previous) => {
      const productLines = [...previous.productLines]
      productLines.splice(index + 1, 0, { ...productLines[index] })
      return { ...previous, productLines }
    })
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    setInvoice((previous) => {
      const target = index + direction

      if (target < 0 || target >= previous.productLines.length) {
        return previous
      }

      const productLines = [...previous.productLines]
      const [moved] = productLines.splice(index, 1)
      productLines.splice(target, 0, moved)

      return { ...previous, productLines }
    })
  }

  const handleProductSelect = (productId: string) => {
    const product = myProducts.find((item) => String(item.id) === productId)

    if (!product) return

    setInvoice((previous) => ({
      ...previous,
      productLines: [
        ...previous.productLines,
        {
          description: product.name,
          quantity: '1',
          rate: String(product.price ?? 0),
        },
      ],
    }))
  }

  const formatNumber = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  const formatAmount = (amount: number) => {
    const currencyValue = invoice.currency || ''
    const currency = currencyValue.trim().toUpperCase()

    if (!currency) {
      return formatNumber(amount)
    }

    if (/^[A-Z]{3}$/.test(currency)) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          currencyDisplay: 'code',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      } catch {
      }
    }

    return `${currencyValue.trim()} ${formatNumber(amount)}`
  }

  const lineAmount = (quantity: string, rate: string) => toNumber(quantity) * toNumber(rate)

  const subTotal = useMemo(
    () =>
      invoice.productLines.reduce(
        (total, productLine) => total + lineAmount(productLine.quantity, productLine.rate),
        0
      ),
    [invoice.productLines]
  )

  const discount = useMemo(() => {
    if (!invoice.discountEnabled) return 0

    const value = toNumber(invoice.discountRate)
    const amount = invoice.discountType === 'percent' ? (subTotal * value) / 100 : value

    return Math.min(Math.max(amount, 0), subTotal)
  }, [invoice.discountEnabled, invoice.discountRate, invoice.discountType, subTotal])

  const taxableAmount = subTotal - discount

  const saleTax = useMemo(
    () => (invoice.taxEnabled ? (taxableAmount * toNumber(invoice.taxRate)) / 100 : 0),
    [invoice.taxEnabled, invoice.taxRate, taxableAmount]
  )

  const shipping = invoice.shippingEnabled ? toNumber(invoice.shippingAmount) : 0

  const total = taxableAmount + saleTax + shipping

  useEffect(() => {
    if (onChange) {
      onChange(invoice)
    }
  }, [onChange, invoice])

  const taxRowLabel = `${invoice.taxLabel} (${invoice.taxRate || 0}%)`
  const discountRowLabel =
    invoice.discountType === 'percent'
      ? `${invoice.discountLabel} (${invoice.discountRate || 0}%)`
      : invoice.discountLabel

  const documentBody = (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        <View className="flex flex-stack" pdfMode={pdfMode}>
          <View className="w-50" pdfMode={pdfMode}>
            <EditableFileImage
              className="logo"
              placeholder="Your Logo"
              value={invoice.logo}
              width={invoice.logoWidth}
              pdfMode={pdfMode}
              onChangeImage={(value) => handleChange('logo', value)}
              onChangeWidth={(value) => handleChange('logoWidth', value)}
            />
            <EditableInput
              className="fs-20 bold"
              placeholder="Your Company"
              value={invoice.companyName}
              onChange={(value) => handleChange('companyName', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Your Name"
              value={invoice.name}
              onChange={(value) => handleChange('name', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Company's Address"
              value={invoice.companyAddress}
              onChange={(value) => handleChange('companyAddress', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="City, State Zip"
              value={invoice.companyAddress2}
              onChange={(value) => handleChange('companyAddress2', value)}
              pdfMode={pdfMode}
            />
            <EditableSelect
              options={countryList}
              value={invoice.companyCountry}
              onChange={(value) => handleChange('companyCountry', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-50" pdfMode={pdfMode}>
            <EditableInput
              className="fs-45 right bold document-title"
              placeholder="Quotation"
              value={invoice.title}
              onChange={(value) => handleChange('title', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        <View className="flex flex-stack mt-40" pdfMode={pdfMode}>
          <View className="w-55" pdfMode={pdfMode}>
            <EditableInput
              className="bold dark mb-5"
              value={invoice.billTo}
              onChange={(value) => handleChange('billTo', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Your Client's Name"
              value={invoice.clientName}
              onChange={(value) => handleChange('clientName', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Client's Address"
              value={invoice.clientAddress}
              onChange={(value) => handleChange('clientAddress', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="City, State Zip"
              value={invoice.clientAddress2}
              onChange={(value) => handleChange('clientAddress2', value)}
              pdfMode={pdfMode}
            />
            <EditableSelect
              options={countryList}
              value={invoice.clientCountry}
              onChange={(value) => handleChange('clientCountry', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-45" pdfMode={pdfMode}>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceTitleLabel}
                  onChange={(value) => handleChange('invoiceTitleLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableInput
                  placeholder={invoice.documentType === 'invoice' ? 'INV-12' : 'QUO-12'}
                  value={invoice.invoiceTitle}
                  onChange={(value) => handleChange('invoiceTitle', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDateLabel}
                  onChange={(value) => handleChange('invoiceDateLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDate, dateFormat)}
                  selected={invoiceDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : ''
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDueDateLabel}
                  onChange={(value) => handleChange('invoiceDueDateLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDueDate, dateFormat)}
                  selected={invoiceDueDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDueDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : ''
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-30 bg-dark flex table-head" pdfMode={pdfMode}>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineDescription}
              onChange={(value) => handleChange('productLineDescription', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange('productLineQuantity', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) => handleChange('productLineQuantityRate', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) => handleChange('productLineQuantityAmount', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === '' ? null : (
            <View key={i} className="row flex" pdfMode={pdfMode}>
              {!pdfMode && (
                <button
                  type="button"
                  className="row__remove-button icon-button icon-button--danger"
                  aria-label={`Remove item ${i + 1}`}
                  title="Remove row"
                  disabled={invoice.productLines.length === 1}
                  onClick={() => handleRemove(i)}
                >
                  <Icon name="close" />
                </button>
              )}
              <View className="w-48 p-4-8 pb-10 cell" pdfMode={pdfMode}>
                {!pdfMode && <span className="cell__label">{invoice.productLineDescription}</span>}
                <EditableTextarea
                  className="dark"
                  rows={2}
                  placeholder="Enter item name/description"
                  value={productLine.description}
                  onChange={(value) => handleProductLineChange(i, 'description', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10 cell" pdfMode={pdfMode}>
                {!pdfMode && <span className="cell__label">{invoice.productLineQuantity}</span>}
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) => handleProductLineChange(i, 'quantity', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10 cell" pdfMode={pdfMode}>
                {!pdfMode && <span className="cell__label">{invoice.productLineQuantityRate}</span>}
                <EditableInput
                  className="dark right"
                  value={productLine.rate}
                  onChange={(value) => handleProductLineChange(i, 'rate', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10 cell" pdfMode={pdfMode}>
                {!pdfMode && (
                  <span className="cell__label">{invoice.productLineQuantityAmount}</span>
                )}
                <Text className="dark right" pdfMode={pdfMode}>
                  {formatAmount(lineAmount(productLine.quantity, productLine.rate))}
                </Text>
              </View>
              {!pdfMode && (
                <div className="row__actions">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Move item ${i + 1} up`}
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => handleMove(i, -1)}
                  >
                    <Icon name="arrow-up" />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Move item ${i + 1} down`}
                    title="Move down"
                    disabled={i === invoice.productLines.length - 1}
                    onClick={() => handleMove(i, 1)}
                  >
                    <Icon name="arrow-down" />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Duplicate item ${i + 1}`}
                    title="Duplicate"
                    onClick={() => handleDuplicate(i)}
                  >
                    <Icon name="copy" />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    aria-label={`Remove item ${i + 1}`}
                    title="Remove"
                    disabled={invoice.productLines.length === 1}
                    onClick={() => handleRemove(i)}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              )}
            </View>
          )
        })}

        <View className="flex flex-stack totals-row" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <div className="line-actions">
                <button type="button" className="button button--ghost" onClick={handleAdd}>
                  <Icon name="plus" />
                  <span>Add line item</span>
                </button>
                {myProducts.length > 0 && (
                  <select
                    className="catalogue-picker"
                    value=""
                    onChange={(e) => handleProductSelect(e.target.value)}
                    aria-label="Add a saved item to this document"
                  >
                    <option value="">Add from my items…</option>
                    {myProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {product.price}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </View>
          <View className="w-50 mt-20 totals" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange('subTotalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {formatAmount(subTotal)}
                </Text>
              </View>
            </View>

            {invoice.discountEnabled && (
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  {pdfMode ? (
                    <Text pdfMode={pdfMode}>{discountRowLabel}</Text>
                  ) : (
                    <div className="rate-field">
                      <EditableInput
                        value={invoice.discountLabel}
                        onChange={(value) => handleChange('discountLabel', value)}
                      />
                      <input
                        className="rate-field__value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoice.discountRate}
                        aria-label="Discount value"
                        onChange={(e) => handleChange('discountRate', e.target.value)}
                      />
                      <span className="rate-field__unit">
                        {invoice.discountType === 'percent' ? '%' : invoice.currency}
                      </span>
                    </div>
                  )}
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right bold dark" pdfMode={pdfMode}>
                    {`- ${formatAmount(discount)}`}
                  </Text>
                </View>
              </View>
            )}

            {invoice.taxEnabled && (
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  {pdfMode ? (
                    <Text pdfMode={pdfMode}>{taxRowLabel}</Text>
                  ) : (
                    <div className="rate-field">
                      <EditableInput
                        value={invoice.taxLabel}
                        onChange={(value) => handleChange('taxLabel', value)}
                      />
                      <input
                        className="rate-field__value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoice.taxRate}
                        aria-label="Tax rate percentage"
                        onChange={(e) => handleChange('taxRate', e.target.value)}
                      />
                      <span className="rate-field__unit">%</span>
                    </div>
                  )}
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right bold dark" pdfMode={pdfMode}>
                    {formatAmount(saleTax)}
                  </Text>
                </View>
              </View>
            )}

            {invoice.shippingEnabled && (
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <EditableInput
                    value={invoice.shippingLabel}
                    onChange={(value) => handleChange('shippingLabel', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right bold dark" pdfMode={pdfMode}>
                    {formatAmount(shipping)}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex bg-gray p-5 total-line" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange('totalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right currency-input"
                  value={invoice.currency}
                  onChange={(value) => handleChange('currency', value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {formatNumber(total)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.notesLabel}
            onChange={(value) => handleChange('notesLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            placeholder="Anything the client should know"
            value={invoice.notes}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          />
        </View>

        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange('termLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            placeholder="Payment window, validity, warranty…"
            value={invoice.term}
            onChange={(value) => handleChange('term', value)}
            pdfMode={pdfMode}
          />
        </View>

        {invoice.paymentEnabled && (
          <View className="mt-20" pdfMode={pdfMode}>
            <EditableInput
              className="bold w-100"
              value={invoice.paymentLabel}
              onChange={(value) => handleChange('paymentLabel', value)}
              pdfMode={pdfMode}
            />
            <EditableTextarea
              className="w-100"
              rows={2}
              placeholder="Bank name, account number, mobile money details…"
              value={invoice.paymentDetails}
              onChange={(value) => handleChange('paymentDetails', value)}
              pdfMode={pdfMode}
            />
          </View>
        )}

        {invoice.signatureEnabled && (
          <View className="mt-40 flex signature-row" pdfMode={pdfMode}>
            <View className="w-50" pdfMode={pdfMode} />
            <View className="w-50 signature" pdfMode={pdfMode}>
              <EditableInput
                className="w-100"
                placeholder="Name of signatory"
                value={invoice.signatureName}
                onChange={(value) => handleChange('signatureName', value)}
                pdfMode={pdfMode}
              />
              <View className="signature__line" pdfMode={pdfMode}>
                <EditableInput
                  className="w-100 bold"
                  value={invoice.signatureLabel}
                  onChange={(value) => handleChange('signatureLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
          </View>
        )}
      </Page>
    </Document>
  )

  if (pdfMode) {
    return documentBody
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <div className="segmented" role="group" aria-label="Document type">
          <button
            type="button"
            className={'segmented__item' + (invoice.documentType === 'quotation' ? ' is-active' : '')}
            aria-pressed={invoice.documentType === 'quotation'}
            onClick={() => handleDocumentType('quotation')}
          >
            Quotation
          </button>
          <button
            type="button"
            className={'segmented__item' + (invoice.documentType === 'invoice' ? ' is-active' : '')}
            aria-pressed={invoice.documentType === 'invoice'}
            onClick={() => handleDocumentType('invoice')}
          >
            Invoice
          </button>
        </div>

        <div className="editor-toolbar__summary">
          <span className="editor-toolbar__count">
            {invoice.productLines.length} {invoice.productLines.length === 1 ? 'item' : 'items'}
          </span>
          <span className="editor-toolbar__total" title="Document total">
            {formatAmount(total)}
          </span>
        </div>

        <div className="editor-toolbar__actions">
          <button
            type="button"
            className={'button button--ghost' + (showOptions ? ' is-active' : '')}
            aria-expanded={showOptions}
            onClick={() => setShowOptions((value) => !value)}
          >
            <Icon name="settings" />
            <span>Options</span>
          </button>
          <button type="button" className="button button--ghost" onClick={() => window.print()}>
            <Icon name="print" />
            <span>Print</span>
          </button>
          <Download data={invoice} />
        </div>
      </div>

      {showOptions && (
        <div className="editor-options">
          <div className="editor-options__grid">
            <div className="option">
              <span className="option__label">Currency</span>
              <div className="option__body">
                <select
                  value={currencyOptions.includes(invoice.currency) ? invoice.currency : ''}
                  aria-label="Currency"
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  {!currencyOptions.includes(invoice.currency) && (
                    <option value="">{invoice.currency || 'Custom'}</option>
                  )}
                  {currencyOptions.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <OptionToggle
              label="Tax / VAT"
              checked={invoice.taxEnabled}
              onChange={(checked) => handleChange('taxEnabled', checked)}
            >
              <input
                type="text"
                value={invoice.taxLabel}
                aria-label="Tax label"
                onChange={(e) => handleChange('taxLabel', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.taxRate}
                aria-label="Tax rate percentage"
                onChange={(e) => handleChange('taxRate', e.target.value)}
              />
            </OptionToggle>

            <OptionToggle
              label="Discount"
              checked={invoice.discountEnabled}
              onChange={(checked) => handleChange('discountEnabled', checked)}
            >
              <select
                value={invoice.discountType}
                aria-label="Discount type"
                onChange={(e) => handleChange('discountType', e.target.value as DiscountType)}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed amount</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.discountRate}
                aria-label="Discount value"
                onChange={(e) => handleChange('discountRate', e.target.value)}
              />
            </OptionToggle>

            <OptionToggle
              label="Shipping / other charge"
              checked={invoice.shippingEnabled}
              onChange={(checked) => handleChange('shippingEnabled', checked)}
            >
              <input
                type="text"
                value={invoice.shippingLabel}
                aria-label="Shipping label"
                onChange={(e) => handleChange('shippingLabel', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.shippingAmount}
                aria-label="Shipping amount"
                onChange={(e) => handleChange('shippingAmount', e.target.value)}
              />
            </OptionToggle>

            <OptionToggle
              label="Payment details"
              checked={invoice.paymentEnabled}
              onChange={(checked) => handleChange('paymentEnabled', checked)}
            />

            <OptionToggle
              label="Signature block"
              checked={invoice.signatureEnabled}
              onChange={(checked) => handleChange('signatureEnabled', checked)}
            />

            <div className="option">
              <span className="option__label">My items</span>
              <div className="option__body">
                <button type="button" className="button button--ghost" onClick={onShowCategoryModal}>
                  <Icon name="catalogue" />
                  <span>Manage saved items</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="editor-canvas">{documentBody}</div>
    </div>
  )
}

export default InvoicePage
