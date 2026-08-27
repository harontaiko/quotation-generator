import React, { useEffect, useMemo, useState } from 'react'
import { MyProduct } from '../data/types'
import Icon from './Icon'

interface ItemModalProps {
  selectedCategories: string[]
  onBack: () => void
  onDone: () => void
}

const readItems = (): MyProduct[] => {
  try {
    const stored = JSON.parse(localStorage.getItem('myProducts') || '[]')
    return Array.isArray(stored) ? stored : []
  } catch (_e) {
    return []
  }
}

const nextId = (items: MyProduct[]) =>
  items.reduce((highest, item) => Math.max(highest, Number(item.id) || 0), 0) + 1

const ItemModal: React.FC<ItemModalProps> = ({ selectedCategories, onBack, onDone }) => {
  const [items, setItems] = useState<MyProduct[]>(readItems)
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategory, setItemCategory] = useState(selectedCategories[0] || 'Other')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('myProducts', JSON.stringify(items))
  }, [items])

  const resetForm = () => {
    setItemName('')
    setItemPrice('')
    setItemCategory(selectedCategories[0] || 'Other')
    setEditingId(null)
    setError('')
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const price = parseFloat(itemPrice)

    if (!itemName.trim()) {
      setError('Give the item a name.')
      return
    }

    if (isNaN(price) || price < 0) {
      setError('Enter a price of zero or more.')
      return
    }

    setItems((previous) =>
      editingId === null
        ? [
            ...previous,
            { id: nextId(previous), name: itemName.trim(), price, category: itemCategory },
          ]
        : previous.map((item) =>
            item.id === editingId
              ? { ...item, name: itemName.trim(), price, category: itemCategory }
              : item
          )
    )

    resetForm()
  }

  const handleEdit = (item: MyProduct) => {
    setEditingId(item.id)
    setItemName(item.name)
    setItemPrice(String(item.price))
    setItemCategory(item.category)
    setError('')
  }

  const handleDelete = (item: MyProduct) => {
    if (!window.confirm(`Remove “${item.name}” from your saved items?`)) return

    setItems((previous) => previous.filter((saved) => saved.id !== item.id))

    if (editingId === item.id) {
      resetForm()
    }
  }

  const visibleItems = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [items, filter]
  )

  const categoryOptions = selectedCategories.length > 0 ? selectedCategories : ['Other']

  return (
    <div className="modal">
      <div className="modal__header">
        <div>
          <p className="modal__eyebrow">Step 2 of 2</p>
          <h2>Your saved items</h2>
          <p className="modal__hint">
            Save the things you sell once, then drop them onto any document in a click.
          </p>
        </div>
        <button type="button" className="icon-button" onClick={onDone} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <form className="item-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Item name</span>
          <input
            type="text"
            placeholder="e.g. Executive office chair"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Unit price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Category</span>
          <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <div className="item-form__actions">
          <button type="submit" className="button button--primary">
            <Icon name={editingId === null ? 'plus' : 'check'} />
            <span>{editingId === null ? 'Add item' : 'Save changes'}</span>
          </button>
          {editingId !== null && (
            <button type="button" className="button button--ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="modal__error">{error}</p>}

      {items.length > 0 && (
        <div className="item-list__toolbar">
          <span className="item-list__count">
            {items.length} saved {items.length === 1 ? 'item' : 'items'}
          </span>
          <label className="field field--inline">
            <span className="field__label">Filter</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <ul className="item-list">
        {visibleItems.length === 0 ? (
          <li className="item-list__empty">
            {items.length === 0
              ? 'Nothing saved yet. Add your first item above — or skip and type items straight onto the document.'
              : 'No items in this category yet.'}
          </li>
        ) : (
          visibleItems.map((item) => (
            <li key={item.id} className="item-row">
              <div className="item-row__body">
                <strong>{item.name}</strong>
                <span>
                  {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} · {item.category}
                </span>
              </div>
              <div className="item-row__actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => handleEdit(item)}
                  aria-label={`Edit ${item.name}`}
                  title="Edit"
                >
                  <Icon name="file" />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => handleDelete(item)}
                  aria-label={`Delete ${item.name}`}
                  title="Delete"
                >
                  <Icon name="trash" />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="modal__footer">
        <button type="button" className="button button--ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="button button--primary" onClick={onDone}>
          <Icon name="check" />
          <span>Done</span>
        </button>
      </div>
    </div>
  )
}

export default ItemModal
