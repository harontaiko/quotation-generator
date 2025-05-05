import React, { FC, useEffect, useState } from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Invoice } from '../data/types'
import InvoicePage from './InvoicePage'

interface Props {
  data: Invoice
}

const Download: FC<Props> = ({ data }) => {
  const [show, setShow] = useState<boolean>(false)

  const [showCategoryModal, setShowCategoryModal] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 

  const onCategoriesSelected = (categories: string[]) => {
    setSelectedCategories(categories);
    setShowCategoryModal(false);
  };

  const onShowCategoryModal = () => {
    setShowCategoryModal(true);
  };

  useEffect(() => {
    setShow(false)

    const timeout = setTimeout(() => {
      setShow(true)
    }, 500)

    return () => clearTimeout(timeout)
  }, [data])

  return (
    <div className={'download-pdf' + (!show ? 'loading' : '')} title="Save PDF">
      {show && (
        <PDFDownloadLink className='download-btn'
          document={<InvoicePage onShowCategoryModal={onShowCategoryModal}  categories={selectedCategories}  pdfMode={true} data={data} />}
          fileName={`${data.invoiceTitle ? data.invoiceTitle.toLowerCase() : 'invoice'}.pdf`}
          aria-label="Save PDF"
        >Download
        </PDFDownloadLink>
      )}
    </div>
  )
}

export default Download
