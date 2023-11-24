import React, { useState, useEffect } from 'react';
import ItemModal from './ItemModal'; 

interface CategoryModalProps {
  onCategoriesSelected: (categories: string[]) => void;
  onDone: () => void;
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
  'Other'
];

const CategoryModal: React.FC<CategoryModalProps> = ({ onCategoriesSelected, onDone }) => {
  const storedCategories = JSON.parse(localStorage.getItem('selectedCategories') || '[]');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(storedCategories);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  const handleCheckboxChange = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);
  };

  const handleNextClick = () => {
    if (selectedCategories.length > 0) {
      setShowItemModal(true);
    } else {
      alert('Please select at least one category before proceeding.');
    }
  };

  const onBack = () => {
    setShowItemModal(false);
  };

  const handleDoneClick = () => {
    onDone();
  };

  const handleCategoriesSelected = (categories: string[]) => {
    onCategoriesSelected(categories);
    setShowItemModal(false);
  };

  return (
    <div className="modal-container">
      <div className={`category-modal ${showItemModal ? 'hidden' : ''}`}>
        <h2>Categories of Items you Sell?</h2>
        <div className="category-list">
          {categories.map((category) => (
            <div key={category} className="category-item">
              <input
                type="checkbox"
                id={category}
                checked={selectedCategories.includes(category)}
                onChange={() => handleCheckboxChange(category)}
              />
              <label htmlFor={category}>{category}</label>
            </div>
          ))}
        </div>
        <button onClick={handleNextClick}>Next</button>
      </div>

      {showItemModal && (
        <ItemModal selectedCategories={selectedCategories}  onBack={onBack} onDone={onDone}/>
      )}
    </div>
  );
};

export default CategoryModal;
