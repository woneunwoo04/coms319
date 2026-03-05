import { useState, useEffect } from 'react'
import './Admin.css'

const API_URL = 'http://localhost:3001/api'

function Admin() {
  const [products, setProducts] = useState({
    hotDrinks: [],
    coldDrinks: [],
    desserts: []
  })
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    category: 'hotDrinks',
    name: '',
    description: '',
    price: '',
    ingredients: '',
    image: ''
  })
  const [activeCategory, setActiveCategory] = useState('hotDrinks')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`)
      const data = await response.json()
      setProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = (product, category) => {
    setEditingProduct({ ...product, category })
    setFormData({
      category: category,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      ingredients: product.ingredients.join(', '),
      image: product.image
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchProducts()
        alert('Product deleted successfully!')
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const productData = {
      category: formData.category,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
      image: formData.image || '/images/placeholder.jpg'
    }

    try {
      let response
      if (editingProduct) {
        response = await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
      } else {
        response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
      }

      if (response.ok) {
        await fetchProducts()
        setShowAddForm(false)
        setEditingProduct(null)
        setFormData({
          category: 'hotDrinks',
          name: '',
          description: '',
          price: '',
          ingredients: '',
          image: ''
        })
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to save product'}`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingProduct(null)
    setFormData({
      category: 'hotDrinks',
      name: '',
      description: '',
      price: '',
      ingredients: '',
      image: ''
    })
  }

  const getCategoryLabel = (category) => {
    const labels = {
      hotDrinks: 'Hot Drinks',
      coldDrinks: 'Cold Drinks',
      desserts: 'Desserts'
    }
    return labels[category] || category
  }

  const currentProducts = products[activeCategory] || []

  if (loading) {
    return <div className="admin-container"><div className="loading">Loading products...</div></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel - Menu Management</h1>
        <p>Manage all menu items with full CRUD capabilities</p>
      </div>

      <div className="admin-controls">
        <div className="category-tabs">
          <button
            className={activeCategory === 'hotDrinks' ? 'active' : ''}
            onClick={() => setActiveCategory('hotDrinks')}
          >
            Hot Drinks
          </button>
          <button
            className={activeCategory === 'coldDrinks' ? 'active' : ''}
            onClick={() => setActiveCategory('coldDrinks')}
          >
            Cold Drinks
          </button>
          <button
            className={activeCategory === 'desserts' ? 'active' : ''}
            onClick={() => setActiveCategory('desserts')}
          >
            Desserts
          </button>
        </div>

        <button
          className="add-product-btn"
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              category: activeCategory,
              name: '',
              description: '',
              price: '',
              ingredients: '',
              image: ''
            })
            setShowAddForm(true)
          }}
        >
          + Add New Product
        </button>
      </div>

      {showAddForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="hotDrinks">Hot Drinks</option>
                  <option value="coldDrinks">Cold Drinks</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Classic Cappuccino"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe the product..."
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="e.g., 4.99"
                />
              </div>

              <div className="form-group">
                <label>Ingredients (comma-separated)</label>
                <input
                  type="text"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="e.g., Espresso, Milk, Sugar"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="/images/product.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-list">
        <h2>{getCategoryLabel(activeCategory)} ({currentProducts.length})</h2>
        
        {currentProducts.length === 0 ? (
          <p className="no-products">No products in this category. Click "Add New Product" to get started.</p>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Ingredients</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td className="description-cell">{product.description}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td className="ingredients-cell">
                      {product.ingredients.join(', ')}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(product, activeCategory)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin

