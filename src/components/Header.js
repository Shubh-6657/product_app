'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Search, User, ChevronDown } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef(null);
  const searchRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Swipe handlers for mobile menu
  const handlers = useSwipeable({
    onSwipedRight: () => setIsOpen(true),
    onSwipedLeft: () => setIsOpen(false),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  // Categories with dropdown support
  const categories = [
    {
      name: 'Electronics',
      href: '/category/electronics',
      subcategories: [
        { name: 'Phones', href: '/category/phones' },
        { name: 'Laptops', href: '/category/laptops' },
        { name: 'Accessories', href: '/category/accessories' },
      ]
    },
    {
      name: 'Men',
      href: "/category/men's clothing",
      subcategories: [
        { name: 'Shirts', href: '/category/mens-shirts' },
        { name: 'Pants', href: '/category/mens-pants' },
        { name: 'Shoes', href: '/category/mens-shoes' },
      ]
    },
    {
      name: 'Women',
      href: "/category/women's clothing",
      subcategories: [
        { name: 'Dresses', href: '/category/womens-dresses' },
        { name: 'Tops', href: '/category/womens-tops' },
        { name: 'Accessories', href: '/category/womens-accessories' },
      ]
    },
    {
      name: 'Home & Living',
      href: '/category/home',
      subcategories: [
        { name: 'Furniture', href: '/category/furniture' },
        { name: 'Decor', href: '/category/decor' },
        { name: 'Kitchen', href: '/category/kitchen' },
      ]
    }
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg text-gray-800' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}
    >
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`${isScrolled ? 'text-indigo-600' : 'text-white'}`}
            >
              CommerceEdge
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <div key={category.name} className="relative group">
                <Link 
                  href={category.href} 
                  className="flex items-center font-medium hover:text-indigo-300 transition-colors"
                >
                  {category.name}
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Link>
                
                {/* Dropdown */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-20 hidden group-hover:block"
                >
                  {category.subcategories.map((sub) => (
                    <Link 
                      key={sub.name} 
                      href={sub.href}
                      className="block px-4 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </motion.div>
              </div>
            ))}
          </nav>

          {/* Icons Group */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Desktop */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:block"
              aria-label="Search"
            >
              <Search className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
            </motion.button>

            {/* Cart with badge */}
            <Link href="/cart" className="relative">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1 ${isScrolled ? 'text-gray-800' : 'text-white'}`}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden block"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              {...handlers}
              ref={navRef}
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`md:hidden absolute top-full left-0 w-full ${isScrolled ? 'bg-white shadow-lg' : 'bg-indigo-600'} z-50`}
              style={{ touchAction: 'pan-y' }}
            >
              <ul className="py-4 px-6 space-y-4">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-2 font-medium ${isScrolled ? 'text-gray-800 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && (
                      <ul className="ml-4 mt-2 space-y-2">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className={`block py-1 text-sm ${isScrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-indigo-100 hover:text-white'}`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
                <li className="border-t pt-4">
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center py-2 ${isScrolled ? 'text-gray-800 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}
                  >
                    <User className="w-5 h-5 mr-2" /> My Account
                  </Link>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Search Bar - Mobile */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              ref={searchRef}
            >
              <div className="p-4 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar - Desktop */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="hidden md:block absolute top-full left-0 w-full bg-white shadow-md z-40"
            ref={searchRef}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-4 text-gray-400" />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;