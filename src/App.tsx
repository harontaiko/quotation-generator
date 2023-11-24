import React, { useState } from 'react';
import InvoicePage from './components/InvoicePage';
import CategoryModal from './components/CategoryModal'; 
import { Invoice } from './data/types';

interface AppProps {}

function App(props: AppProps) {
  const savedInvoice = window.localStorage.getItem('invoiceData')
  let data = null

  try {
    if (savedInvoice) {
      data = JSON.parse(savedInvoice);
    }
  } catch (_e) {}

  const [showCategoryModal, setShowCategoryModal] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 

  const onCategoriesSelected = (categories: string[]) => {
    setSelectedCategories(categories);
    setShowCategoryModal(false);
  };

  const onInvoiceUpdated = (invoice: Invoice) => {
    window.localStorage.setItem('invoiceData', JSON.stringify(invoice));
  };

  const onShowCategoryModal = () => {
    setShowCategoryModal(true);
  };


  const onDone = () => {
    setShowCategoryModal(false);
  };

  return (
    <div className="app">
      <h1 className="center fs-30 text-responsive">Quotation & Invoice Generator</h1>
      {showCategoryModal ? (
        <CategoryModal onCategoriesSelected={onCategoriesSelected} onDone={onDone} />
      ) : (
        <InvoicePage onShowCategoryModal={onShowCategoryModal}  data={data} categories={selectedCategories} onChange={onInvoiceUpdated} />
      )}
    </div>
  );
}

export default App;
