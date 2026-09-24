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

const copyOptions = [1, 2, 3, 4, 5]

const Download: FC<Props> = ({ data }) => {
  const [show, setShow] = useState<boolean>(false)
  const [copies, setCopies] = useState<number>(1)

  useEffect(() => {
    setShow(false)

    const timeout = setTimeout(() => {
      setShow(true)
    }, 500)

    return () => clearTimeout(timeout)
  }, [data, copies])

  const baseName =
    slugify(data.invoiceTitle) ||
    slugify(data.clientName) ||
    (data.documentType === 'invoice' ? 'invoice' : 'quotation')
  const fileName = copies > 1 ? `${baseName}-${copies}-copies.pdf` : `${baseName}.pdf`

  return (
    <div className={'download-pdf' + (!show ? ' download-pdf--loading' : '')}>
      <select
        className="download-pdf__copies"
        value={copies}
        onChange={(e) => setCopies(Number(e.target.value))}
        aria-label="Number of copies in the PDF"
        title="Number of copies in the PDF"
      >
        {copyOptions.map((count) => (
          <option key={count} value={count}>
            {count === 1 ? '1 copy' : `${count} copies`}
          </option>
        ))}
      </select>
      {show ? (
        <PDFDownloadLink
          className="button button--primary"
          document={
            <InvoicePage
              onShowCategoryModal={() => undefined}
              categories={[]}
              pdfMode={true}
              copies={copies}
              data={data}
            />
          }
          fileName={fileName}
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
