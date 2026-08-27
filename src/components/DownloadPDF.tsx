import React, { FC, useEffect, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Invoice } from '../data/types'
import InvoicePage from './InvoicePage'
import Icon from './Icon'

interface Props {
  data: Invoice
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const Download: FC<Props> = ({ data }) => {
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    setShow(false)

    const timeout = setTimeout(() => {
      setShow(true)
    }, 500)

    return () => clearTimeout(timeout)
  }, [data])

  const baseName =
    slugify(data.invoiceTitle) ||
    slugify(data.clientName) ||
    (data.documentType === 'invoice' ? 'invoice' : 'quotation')

  return (
    <div className={'download-pdf' + (!show ? ' download-pdf--loading' : '')}>
      {show ? (
        <PDFDownloadLink
          className="button button--primary"
          document={
            <InvoicePage
              onShowCategoryModal={() => undefined}
              categories={[]}
              pdfMode={true}
              data={data}
            />
          }
          fileName={`${baseName}.pdf`}
          aria-label="Download PDF"
        >
          <Icon name="download" />
          <span>Download PDF</span>
        </PDFDownloadLink>
      ) : (
        <span className="button button--primary button--busy" aria-live="polite">
          <Icon name="download" />
          <span>Preparing…</span>
        </span>
      )}
    </div>
  )
}

export default Download
