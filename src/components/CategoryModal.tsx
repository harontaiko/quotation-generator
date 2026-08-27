import React, { useEffect, useState } from 'react'
import ItemModal from './ItemModal'
import Icon from './Icon'

interface CategoryModalProps {
  onCategoriesSelected: (categories: string[]) => void
  onDone: () => void
}

const categories = [
  'Cutlery',
  'Stationery',
  'Clothing',
  'Electronics',
  'Furniture',
  'Beauty Products',
  'Sports Equipment',
  'Home Decor',
  'Books',
  'Toys and Games',
  'Health and Wellness',
  'Outdoor Gear',
  'Art and Crafts',
  'Tech Gadgets',
  'Other',
]

const CategoryModal: React.FC<CategoryModalProps> = ({ onCategoriesSelected, onDone }) => {
  const storedCategories: string[] = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('selectedCategories') || '[]')
      return Array.isArray(stored) ? stored : []
    } catch (_e) {
      return []
    }
  })()

  const [selectedCategories, setSelectedCategories] = useState<string[]>(storedCategories)
  const [showItemModal, setShowItemModal] = useState(storedCategories.length > 0)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories))
  }, [selectedCategories])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDone()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onDone])

  const handleToggle = (category: string) => {
    setError('')
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((c) => c !== category)
        : [...previous, category]
    )
  }

  const handleNextClick = () => {
    if (selectedCategories.length === 0) {
      setError('Pick at least one category to continue.')
      return
    }

    setShowItemModal(true)
  }

  return (
    <div className="modal-container" role="dialog" aria-modal="true" aria-label="Set up your item catalogue">
      {showItemModal ? (
        <ItemModal
          selectedCategories={selectedCategories}
          onBack={() => setShowItemModal(false)}
          onDone={() => {
            onCategoriesSelected(selectedCategories)
            onDone()
          }}
        />
      ) : (
        <div className="modal">
          <div className="modal__header">
            <div>
              <p className="modal__eyebrow">Step 1 of 2</p>
              <h2>What do you sell?</h2>
              <p className="modal__hint">
                Pick the categories you work with. They group the items you save for reuse on any
                quotation or invoice.
              </p>
            </div>
            <button type="button" className="icon-button" onClick={onDone} aria-label="Skip setup">
              <Icon name="close" />
            </button>
          </div>

          <div className="chip-grid">
            {categories.map((category) => {
              const checked = selectedCategories.includes(category)

              return (
                <label key={category} className={'chip' + (checked ? ' chip--on' : '')}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(category)}
                  />
                  <span>{category}</span>
                </label>
              )
            })}
          </div>

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__footer">
            <button type="button" className="button button--ghost" onClick={onDone}>
              Skip for now
            </button>
            <button type="button" className="button button--primary" onClick={handleNextClick}>
              <span>Next</span>
              <Icon name="arrow-down" className="ui-icon--rotate" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryModal
