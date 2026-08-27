import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InvoicePage from './components/InvoicePage'
import CategoryModal from './components/CategoryModal'
import Icon from './components/Icon'
import { Invoice, SavedInvoice } from './data/types'
import { normalizeInvoice } from './data/initialData'

interface AppProps {}

const savedInvoicesKey = 'savedInvoices'
const currentInvoiceKey = 'invoiceData'
const categoriesKey = 'selectedCategories'

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch (_e) {
    return fallback
  }
}

const readSavedInvoices = (): SavedInvoice[] => {
  const stored = readJson<SavedInvoice[]>(savedInvoicesKey, [])

  return Array.isArray(stored)
    ? stored.map((saved) => ({ ...saved, invoice: normalizeInvoice(saved.invoice) }))
    : []
}

const readCurrentInvoice = (): Invoice | undefined => {
  const stored = readJson<Invoice | null>(currentInvoiceKey, null)
  return stored ? normalizeInvoice(stored) : undefined
}

const defaultName = (invoice?: Invoice) =>
  (invoice &&
    (invoice.invoiceTitle || invoice.clientName || invoice.companyName)) ||
  'Untitled document'

function App(_props: AppProps) {
  const [data, setData] = useState<Invoice | undefined>(readCurrentInvoice)
  const [editorKey, setEditorKey] = useState(0)
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(readSavedInvoices)
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    readJson<string[]>(categoriesKey, [])
  )
  // The item catalogue is opt-in: it only greets first-time visitors.
  const [showCategoryModal, setShowCategoryModal] = useState(
    () => readJson<string[]>(categoriesKey, []).length === 0
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [naming, setNaming] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [query, setQuery] = useState('')
  const importInput = useRef<HTMLInputElement>(null)

  const onCategoriesSelected = (categories: string[]) => {
    setSelectedCategories(categories)
    setShowCategoryModal(false)
  }

  const onInvoiceUpdated = useCallback((invoice: Invoice) => {
    setData(invoice)
    window.localStorage.setItem(currentInvoiceKey, JSON.stringify(invoice))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(savedInvoicesKey, JSON.stringify(savedInvoices))
  }, [savedInvoices])

  useEffect(() => {
    document.body.classList.toggle('has-drawer-open', drawerOpen)
    return () => document.body.classList.remove('has-drawer-open')
  }, [drawerOpen])

  const activeSaved = savedInvoices.find((saved) => saved.id === activeSavedId)

  const startSaving = () => {
    setSaveName(defaultName(data))
    setNaming(true)
  }

  const confirmSave = (event: React.FormEvent) => {
    event.preventDefault()

    if (!data || !saveName.trim()) return

    const savedInvoice: SavedInvoice = {
      id: Date.now().toString(),
      name: saveName.trim(),
      updatedAt: new Date().toISOString(),
      invoice: data,
    }

    setSavedInvoices((invoices) => [savedInvoice, ...invoices])
    setActiveSavedId(savedInvoice.id)
    setNaming(false)
    setSaveName('')
  }

  const updateActive = () => {
    if (!data || !activeSavedId) return

    setSavedInvoices((invoices) =>
      invoices.map((saved) =>
        saved.id === activeSavedId
          ? { ...saved, invoice: data, updatedAt: new Date().toISOString() }
          : saved
      )
    )
  }

  const openInvoice = (savedInvoice: SavedInvoice) => {
    const invoice = normalizeInvoice(savedInvoice.invoice)

    setData(invoice)
    setActiveSavedId(savedInvoice.id)
    setEditorKey((key) => key + 1)
    setDrawerOpen(false)
    window.localStorage.setItem(currentInvoiceKey, JSON.stringify(invoice))
  }

  const renameInvoice = (savedInvoice: SavedInvoice) => {
    const name = window.prompt('Rename this document', savedInvoice.name)

    if (!name || !name.trim()) return

    setSavedInvoices((invoices) =>
      invoices.map((saved) => (saved.id === savedInvoice.id ? { ...saved, name: name.trim() } : saved))
    )
  }

  const deleteInvoice = (savedInvoice: SavedInvoice) => {
    if (!window.confirm(`Delete “${savedInvoice.name}”? This cannot be undone.`)) return

    setSavedInvoices((invoices) => invoices.filter((saved) => saved.id !== savedInvoice.id))

    if (activeSavedId === savedInvoice.id) {
      setActiveSavedId(null)
    }
  }

  const newInvoice = () => {
    setData(undefined)
    setActiveSavedId(null)
    setNaming(false)
    setEditorKey((key) => key + 1)
    setDrawerOpen(false)
    window.localStorage.removeItem(currentInvoiceKey)
  }

  const duplicateCurrent = () => {
    if (!data) return

    const savedInvoice: SavedInvoice = {
      id: Date.now().toString(),
      name: `${activeSaved ? activeSaved.name : defaultName(data)} (copy)`,
      updatedAt: new Date().toISOString(),
      invoice: data,
    }

    setSavedInvoices((invoices) => [savedInvoice, ...invoices])
    setActiveSavedId(savedInvoice.id)
  }

  const exportCurrent = () => {
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${(activeSaved ? activeSaved.name : defaultName(data))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'document'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const invoice = normalizeInvoice(JSON.parse(String(reader.result)))

        setData(invoice)
        setActiveSavedId(null)
        setEditorKey((key) => key + 1)
        setDrawerOpen(false)
        window.localStorage.setItem(currentInvoiceKey, JSON.stringify(invoice))
      } catch (_e) {
        window.alert('That file could not be read as a saved document.')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const visibleInvoices = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) return savedInvoices

    return savedInvoices.filter((saved) => saved.name.toLowerCase().includes(term))
  }, [savedInvoices, query])

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="button button--ghost app-header__drawer-toggle"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open saved documents"
        >
          <Icon name="menu" />
          <span>Documents</span>
        </button>
        <div className="app-header__brand">
          <h1>Quotation &amp; Invoice Generator</h1>
          <p>Build it, price it, send it as a PDF — everything stays on your device.</p>
        </div>
      </header>

      {showCategoryModal ? (
        <CategoryModal
          onCategoriesSelected={onCategoriesSelected}
          onDone={() => setShowCategoryModal(false)}
        />
      ) : (
        <div className="workspace">
          <div
            className={'drawer-scrim' + (drawerOpen ? ' is-visible' : '')}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className={'saved-sidebar' + (drawerOpen ? ' is-open' : '')}
            aria-label="Saved quotations and invoices"
          >
            <div className="saved-sidebar__header">
              <div>
                <p className="saved-sidebar__eyebrow">Your documents</p>
                <h2>Saved files</h2>
              </div>
              <button
                type="button"
                className="icon-button saved-sidebar__close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close saved documents"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="saved-sidebar__actions">
              <button type="button" className="button button--primary" onClick={newInvoice}>
                <Icon name="plus" />
                <span>New document</span>
              </button>

              {naming ? (
                <form className="save-form" onSubmit={confirmSave}>
                  <input
                    autoFocus
                    type="text"
                    value={saveName}
                    placeholder="Name this document"
                    aria-label="Document name"
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                  <div className="save-form__buttons">
                    <button type="submit" className="button button--primary" disabled={!saveName.trim()}>
                      <Icon name="check" />
                      <span>Save</span>
                    </button>
                    <button type="button" className="button button--ghost" onClick={() => setNaming(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={startSaving}
                  disabled={!data}
                >
                  <Icon name="save" />
                  <span>Save a copy</span>
                </button>
              )}

              {activeSaved && !naming && (
                <button type="button" className="button button--ghost" onClick={updateActive}>
                  <Icon name="check" />
                  <span>Update “{activeSaved.name}”</span>
                </button>
              )}
            </div>

            <p className="saved-sidebar__status">Your current draft saves automatically.</p>

            {savedInvoices.length > 2 && (
              <label className="saved-search">
                <Icon name="search" />
                <input
                  type="search"
                  value={query}
                  placeholder="Search documents"
                  aria-label="Search saved documents"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}

            <div className="saved-list">
              {savedInvoices.length === 0 ? (
                <p className="saved-list__empty">Saved copies will appear here.</p>
              ) : visibleInvoices.length === 0 ? (
                <p className="saved-list__empty">No document matches “{query}”.</p>
              ) : (
                visibleInvoices.map((savedInvoice) => (
                  <div
                    className={
                      'saved-item' + (savedInvoice.id === activeSavedId ? ' saved-item--active' : '')
                    }
                    key={savedInvoice.id}
                  >
                    <button
                      className="saved-item__open"
                      type="button"
                      onClick={() => openInvoice(savedInvoice)}
                    >
                      <strong>{savedInvoice.name}</strong>
                      <span>
                        {savedInvoice.invoice.documentType === 'invoice' ? 'Invoice' : 'Quotation'} ·{' '}
                        {new Date(savedInvoice.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                    <div className="saved-item__actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => renameInvoice(savedInvoice)}
                        aria-label={`Rename ${savedInvoice.name}`}
                        title="Rename"
                      >
                        <Icon name="file" />
                      </button>
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        onClick={() => deleteInvoice(savedInvoice)}
                        aria-label={`Delete ${savedInvoice.name}`}
                        title="Delete"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="saved-sidebar__footer">
              <button
                type="button"
                className="button button--ghost"
                onClick={duplicateCurrent}
                disabled={!data}
              >
                <Icon name="copy" />
                <span>Duplicate current</span>
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={exportCurrent}
                disabled={!data}
              >
                <Icon name="download" />
                <span>Export as file</span>
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => importInput.current && importInput.current.click()}
              >
                <Icon name="file" />
                <span>Import a file</span>
              </button>
              <input
                ref={importInput}
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={importDocument}
              />
            </div>
          </aside>

          <main className="workspace__main">
            <InvoicePage
              key={editorKey}
              onShowCategoryModal={() => setShowCategoryModal(true)}
              data={data}
              categories={selectedCategories}
              onChange={onInvoiceUpdated}
            />
          </main>
        </div>
      )}
    </div>
  )
}

export default App
