import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://fakestoreapi.com/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters, sorting, and search
  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'all') {
      filtered = products.filter((product) => product.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered.sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortOrder, searchQuery]);

  // Toggle favorite status
  const toggleFavorite = (productId) => {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Open modal with product details
  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        {/* Filters and Search Bar */}
        <div className="flex text-black space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded flex-grow"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="men's clothing">Men's Clothing</option>
            <option value="women's clothing">Women's Clothing</option>
          </select>
          <select
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">  
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => openModal(product)} // Open modal on product card click
              className="border p-4 rounded-lg relative shadow-lg cursor-pointer"
            >
              <img src={product.image} alt={product.title} className="w-full h-48 object-contain" />
              <h2 className="text-lg font-semibold mt-2">{product.title}</h2>
              <p className="text-gray-700">${product.price}</p>
              {/* <div className="absolute bottom-0"> */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the product card click event
                  toggleFavorite(product.id);
                }}
                className={`mt-2 px-4 py-2 rounded ${
                  favorites.includes(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {favorites.includes(product.id) ? 'Unfavorite' : 'Favorite'}
              </button>
              {/* </div> */}
             </div>
          ))}
        </div>

        {/* Modal */}
        {selectedProduct && (
          <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-48 object-contain" />
              <h2 className="text-xl font-bold mt-2">{selectedProduct.title}</h2>
              <p className="text-gray-700">${selectedProduct.price}</p>
              <p className="text-gray-600">{selectedProduct.description}</p>
              <button onClick={closeModal} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;