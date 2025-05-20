import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import Header from '../components/Header';
import { FiHeart, FiX, FiChevronLeft, FiChevronRight, FiStar, FiShoppingCart } from 'react-icons/fi';
import { useSwipeable } from 'react-swipeable';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const controls = useDragControls();
  const modalRef = useRef();

  // Load favorites and cart from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setFavorites(savedFavorites);
    setCart(savedCart);
  }, []);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://fakestoreapi.com/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
        
        // Simulate heavy loading for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
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
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered.sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortOrder, searchQuery]);

  // Find related products when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      const related = products
        .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
      setCurrentImageIndex(0);
    }
  }, [selectedProduct, products]);

  // Toggle favorite status
  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Add to cart
  const addToCart = (product, e) => {
    e.stopPropagation();
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show cart temporarily
    setIsCartOpen(true);
    setTimeout(() => setIsCartOpen(false), 90000);
  };

  // Remove from cart
  const removeFromCart = (productId, e) => {
    e.stopPropagation();
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Modal navigation
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % 2); // Assuming max 2 images for demo
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + 2) % 2);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openModal = (product) => {
    document.body.style.overflow = 'hidden';
    setSelectedProduct(product);
  };

  const closeModal = () => {
    document.body.style.overflow = 'auto';
    setSelectedProduct(null);
  };

  // Calculate total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gray-700">
      <Header cartCount={cart.reduce((count, item) => count + item.quantity, 0)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-8 mb-8 mt-14 text-white"
        >
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Welcome to LuxeShop</h1>
            <p className="text-xl mb-6">Discover premium products at unbeatable prices</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow-lg"
            >
              Shop Now
            </motion.button>
          </div>
        </motion.div>

        {/* Filters and Search Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="men's clothing">Men's Clothing</option>
              <option value="women's clothing">Women's Clothing</option>
              <option value="jewelery">Jewelry</option>
            </select>
            <select
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            >
              <option value="desc">Price: Low to High</option>
              <option value="asc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="bg-gray-200 rounded-xl h-80"
              />
            ))}
          </motion.div>
        )}

        {/* Product Grid */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openModal(product)}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 cursor-pointer relative"
                  layout
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className={`absolute top-2 right-2 p-2 rounded-full shadow-md ${
                        favorites.includes(product.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <FiHeart className={`${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </motion.button>
                    {product.rating?.rate > 4.5 && (
                      <div className="absolute top-2 left-2 bg-yellow-600 text-xs font-bold px-2 py-1 rounded flex items-center">
                        <FiStar className="mr-1" /> Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-black">{product.title}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                      <div className="flex items-center text-yellow-400">
                        <FiStar className="fill-current" />
                        <span className="text-gray-600 ml-1">{product.rating?.rate || '4.5'}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ backgroundColor: '#4f46e5' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => addToCart(product, e)}
                      className="w-full bg-indigo-500 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <FiShoppingCart className="mr-2" /> Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-200">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          >
            <useSwipeable onSwipedLeft={nextImage} onSwipedRight={prevImage}>
              <motion.div
                ref={modalRef}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                dragControls={controls}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row text-black"
              >
                <div className="relative md:w-1/2 bg-gray-100">
                  <div className="relative h-64 md:h-full">
                    <motion.img
                      key={currentImageIndex}
                      src={currentImageIndex === 0 ? selectedProduct.image : `${selectedProduct.image}?${selectedProduct.id}`}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain p-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                  >
                    <FiChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {[0, 1].map((index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-6 md:w-1/2 overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`${i < Math.floor(selectedProduct.rating?.rate || 0) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {selectedProduct.rating?.rate || '4.5'} ({selectedProduct.rating?.count || '120'} reviews)
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-indigo-600">${selectedProduct.price}</span>
                    {selectedProduct.price > 100 && (
                      <span className="ml-2 text-green-600">Free Shipping</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Category: {selectedProduct.category}</h3>
                    <div className="flex space-x-2">
                      <span className="bg-gray-200 px-2 py-1 rounded text-sm">Premium</span>
                      {selectedProduct.price < 50 && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Sale</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-4 mb-6">
                    <motion.button
                      whileHover={{ backgroundColor: '#4f46e5' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => addToCart(selectedProduct, e)}
                      className="flex-1 bg-indigo-500 text-white py-3 rounded-lg flex items-center justify-center"
                    >
                      <FiShoppingCart className="mr-2" /> Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => toggleFavorite(selectedProduct.id, e)}
                      className={`p-3 rounded-lg border flex items-center justify-center ${
                        favorites.includes(selectedProduct.id)
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <FiHeart
                        className={`mr-2 ${
                          favorites.includes(selectedProduct.id) ? 'fill-current' : ''
                        }`}
                      />
                      {favorites.includes(selectedProduct.id) ? 'Saved' : 'Save'}
                    </motion.button>
                  </div>
                  {relatedProducts.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-semibold mb-4">You may also like</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {relatedProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedProduct(product);
                              setCurrentImageIndex(0);
                            }}
                            className="border rounded-lg p-2 cursor-pointer"
                          >
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-16 object-contain"
                            />
                            <p className="text-xs font-medium mt-1 line-clamp-1">{product.title}</p>
                            <p className="text-xs text-indigo-600 font-bold">${product.price}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </useSwipeable>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 text-black"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Cart ({cart.reduce((count, item) => count + item.quantity, 0)})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-3/4">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
                  <p className="text-gray-600">Start shopping to add items</p>
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="flex border-b py-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mr-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium line-clamp-1">{item.title}</h3>
                        <p className="text-indigo-600 font-bold">${item.price}</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border rounded flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border rounded flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={(e) => removeFromCart(item.id, e)}
                            className="ml-auto text-red-500"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <motion.button
                  whileHover={{ backgroundColor: '#4f46e5' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold"
                >
                  Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;