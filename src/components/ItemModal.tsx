import React, { useState, useEffect } from 'react';

interface ItemModalProps {
  selectedCategories: string[];
  onBack: () => void;
  onDone: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ selectedCategories, onBack, onDone}) => {
  const [items, setItems] = useState<{ id: number; name: string; price: number; category: string }[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState(selectedCategories[0]);
  const [idCounter, setIdCounter] = useState(0);

  const handleAddItem = () => {
    if (itemName && itemPrice && itemCategory) {
      const newItem = {
        id: idCounter,
        name: itemName,
        price: parseFloat(itemPrice),
        category: itemCategory,
      };

      setItems((prevItems) => [...prevItems, newItem]);
      setItemName('');
      setItemPrice('');
      setIdCounter(idCounter + 1);
    }
  };

  const handleDoneClick = () => {
    onDone();
  };

  const handleDeleteItem = (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to proceed?");
  
    if (isConfirmed) {
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem('myProducts', JSON.stringify(updatedItems));
    } else {
      console.log("Deletion canceled.");
    }
  };
  

  const handleSaveItems = () => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems, {
        id: idCounter,
        name: itemName,
        price: parseFloat(itemPrice),
        category: itemCategory,
      }];
      localStorage.setItem('myProducts', JSON.stringify(updatedItems));
      setItemName('');
      setItemPrice('');
      setItemCategory(selectedCategories[0]);
      setIdCounter(idCounter + 1);
      return updatedItems;
    });
  };

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('myProducts') || '[]');
    setItems(savedItems);
  }, []);

  return (
    <div className="item-modal">
      <h2>Save Your Products</h2>
      {selectedCategories.length > 0 ? (
        <>
          <div className="item-inputs">
            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Item Price (KES)"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
              {selectedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button onClick={onBack}>Back</button>
            <button onClick={handleSaveItems}>Save Item</button>
          </div>
          <button className="done-button" onClick={handleDoneClick} >Done</button>
          <ul className="item-list">
          {items.map((item) => (
            <li key={`${item.id}-${item.category}`}>
                {item.name} - KES {item.price.toLocaleString()} - {item.category}
                <button onClick={() => handleDeleteItem(item.id)} className="delete-button">X</button>
            </li>
            ))}

          </ul>
        </>
      ) : (
        <p>Please select at least one category.</p>
      )}
    </div>
  );
};

export default ItemModal;
