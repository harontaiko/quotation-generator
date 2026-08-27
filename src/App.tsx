import React, { useEffect, useState } from 'react';
import InvoicePage from './components/InvoicePage';
import CategoryModal from './components/CategoryModal'; 
import { Invoice } from './data/types';

interface AppProps {}

interface SavedInvoice {
  id: string
  name: string
  updatedAt: string
  invoice: Invoice
}

const savedInvoicesKey = 'savedInvoices'

const readSavedInvoices = (): SavedInvoice[] => {
  try {
    return JSON.parse(window.localStorage.getItem(savedInvoicesKey) || '[]')
  } catch (_e) {
    return []
  }
}

function App(props: AppProps) {
  const savedInvoice = window.localStorage.getItem('invoiceData')
  let initialData: Invoice | undefined

  try {
    if (savedInvoice) {
      initialData = JSON.parse(savedInvoice);
    }
  } catch (_e) {}

  const [data, setData] = useState<Invoice | undefined>(initialData)
  const [editorKey, setEditorKey] = useState(0)
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(readSavedInvoices)
  const [showCategoryModal, setShowCategoryModal] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 

  const onCategoriesSelected = (categories: string[]) => {
    setSelectedCategories(categories);
    setShowCategoryModal(false);
  };

  const onInvoiceUpdated = (invoice: Invoice) => {
    setData(invoice)
    window.localStorage.setItem('invoiceData', JSON.stringify(invoice));
  };

  useEffect(() => {
    window.localStorage.setItem(savedInvoicesKey, JSON.stringify(savedInvoices))
  }, [savedInvoices])

  const saveInvoice = () => {
    if (!data) return

    const defaultName = data.invoiceTitle || data.clientName || data.companyName || 'Untitled document'
    const name = window.prompt('Name this quotation or invoice', defaultName)
    if (!name || !name.trim()) return

    const savedInvoice: SavedInvoice = {
      id: Date.now().toString(),
      name: name.trim(),
      updatedAt: new Date().toISOString(),
      invoice: data,
    }
    setSavedInvoices((invoices) => [savedInvoice, ...invoices])
  }

  const openInvoice = (savedInvoice: SavedInvoice) => {
    setData(savedInvoice.invoice)
    setEditorKey((key) => key + 1)
    window.localStorage.setItem('invoiceData', JSON.stringify(savedInvoice.invoice))
  }

  const deleteInvoice = (id: string) => {
    setSavedInvoices((invoices) => invoices.filter((invoice) => invoice.id !== id))
  }

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
        <div className="workspace">
          <aside className="saved-sidebar" aria-label="Saved quotations and invoices">
            <div className="saved-sidebar__header">
              <div>
                <p className="saved-sidebar__eyebrow">Your documents</p>
                <h2>Saved files</h2>
              </div>
              <button className="saved-sidebar__new" type="button" onClick={() => { setData(undefined); setEditorKey((key) => key + 1) }} aria-label="Create a new document">+</button>
            </div>
            <button className="saved-sidebar__save" type="button" onClick={saveInvoice} disabled={!data}>Save a copy</button>
            <p className="saved-sidebar__status">Your current draft saves automatically.</p>
            <div className="saved-list">
              {savedInvoices.length === 0 ? (
                <p className="saved-list__empty">Saved copies will appear here.</p>
              ) : savedInvoices.map((savedInvoice) => (
                <div className="saved-item" key={savedInvoice.id}>
                  <button className="saved-item__open" type="button" onClick={() => openInvoice(savedInvoice)}>
                    <strong>{savedInvoice.name}</strong>
                    <span>{new Date(savedInvoice.updatedAt).toLocaleDateString()}</span>
                  </button>
                  <button className="saved-item__delete" type="button" onClick={() => deleteInvoice(savedInvoice.id)} aria-label={`Delete ${savedInvoice.name}`}>&times;</button>
                </div>
              ))}
            </div>
          </aside>
          <InvoicePage key={editorKey} onShowCategoryModal={onShowCategoryModal} data={data} categories={selectedCategories} onChange={onInvoiceUpdated} />
        </div>
      )}
    </div>
  );
}

export default App;
