'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useContext, useEffect } from 'react';
import { Search, Image as ImageIcon, Loader2, Mail } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import EmailModal from '@/components/EmailModal';

const CATEGORIES = [
  'Singing bowls',
  'Candle holders',
  'Crystal candle holders',
  'Decorative glassware and home decor',
  'Votive candle holders'
];

const ALASKA_LOCATIONS = [
  'Anchorage, Alaska', 'Wasilla, Alaska', 'Palmer, Alaska', 'Kenai, Alaska', 'Soldotna, Alaska',
  'Homer, Alaska', 'Juneau, Alaska', 'Sitka, Alaska', 'Ketchikan, Alaska', 'Skagway, Alaska',
  'Wrangell, Alaska', 'Fairbanks, Alaska', 'North Pole, Alaska', 'Delta Junction, Alaska',
  'Nenana, Alaska', 'Nome, Alaska', 'Bethel, Alaska', 'Dillingham, Alaska', 'Unalaska, Alaska',
  'Utqiagvik, Alaska'
];

const SEARCH_KEYWORDS = [
  'All', 'candle holders', 'candle holder', 'decorative candle holders', 'metal candle holders',
  'handmade candle holders', 'decorative candle holder', 'tabletop candle holders',
  'home decor candle holders', 'candle holder store', 'home decor store', 'gift shop',
  'gift store', 'home accessories store', 'decor store', 'candle shop', 'candle retailer',
  'home decor boutique', 'wholesale candle holders', 'candle holder wholesaler',
  'home decor wholesaler', 'giftware wholesaler'
];

const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300";
const labelClasses = "text-sm font-medium text-gray-300 mb-2 block";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function SearchForm() {
  const [mode, setMode] = useState('search'); // 'search' or 'direct'

  const [productCategory, setProductCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState(ALASKA_LOCATIONS);
  
  // Direct email specific fields
  const [directEmail, setDirectEmail] = useState('');
  const [showDirectModal, setShowDirectModal] = useState(false);

  const [sellerName, setSellerName] = useState('Chaitanya');
  const [sellerEmail, setSellerEmail] = useState('techcompanymarketing@gmail.com');
  const [businessName, setBusinessName] = useState('Om Enterprises');
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initiating search...');
  
  useEffect(() => {
    if (!isLoading) {
      setLoadingText('Initiating search...');
      return;
    }
    
    const phrases = [
      'Scanning OpenStreetMap for businesses...',
      'Checking TomTom Maps for storefronts...',
      'Gathering contact information...',
      'Scraping business websites for emails...',
      'Filtering out invalid addresses...',
      'Wrapping things up...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phrases.length;
      setLoadingText(phrases[i]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (location && location.length >= 2) {
        try {
          const res = await fetch(`/api/places-autocomplete?q=${encodeURIComponent(location)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              // Combine the dynamic data with the static ALASKA_LOCATIONS
              setLocationSuggestions(Array.from(new Set([...data, ...ALASKA_LOCATIONS])));
            } else {
              setLocationSuggestions(ALASKA_LOCATIONS);
            }
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setLocationSuggestions(ALASKA_LOCATIONS);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [location]);
  
  const { setSellerInfo, setSearchResults } = useContext(AppContext);
  const router = useRouter();
  const { addToast } = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!sellerName) newErrors.sellerName = 'Name is required';
    if (!sellerEmail) {
      newErrors.sellerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(sellerEmail)) {
      newErrors.sellerEmail = 'Email is invalid';
    }
    if (!businessName) newErrors.businessName = 'Business Name is required';
    if (!location) newErrors.location = 'Location is required';

    if (mode === 'search') {
      if (!productCategory) newErrors.productCategory = 'Category is required';
      if (!searchKeyword) newErrors.searchKeyword = 'Keyword is required';
    } else {
      if (!productCategory) newErrors.productCategory = 'Category is required';
      if (!directEmail) {
        newErrors.directEmail = 'Buyer Email is required';
      } else if (!/\S+@\S+\.\S+/.test(directEmail)) {
        newErrors.directEmail = 'Email is invalid';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSellerInfo({
      name: sellerName,
      email: sellerEmail,
      businessName: businessName,
      productCategory: productCategory,
      searchKeyword: mode === 'search' ? searchKeyword : '',
      location: location,
    });

    if (mode === 'direct') {
      // Split location into City and State if possible, or just pass it directly
      const [city = location, state = ''] = location.split(',').map(s => s.trim());
      
      const directBuyer = {
        id: `direct-${Date.now()}`,
        name: 'Direct Buyer', // We don't have a name field, default to a generic one
        email: directEmail,
        city: city,
        state: state,
        category: productCategory,
        source: 'manual'
      };
      setSearchResults([directBuyer]); // optional, just to have it in context
      setShowDirectModal(true);
      return;
    }
    
    // Search Mode Logic below
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/find-buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: searchKeyword, location }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch buyers');
      }
      
      const data = await response.json();
      setSearchResults(data.buyers || []);
      router.push('/results');
    } catch (error) {
      addToast('Error fetching buyers. Please try again.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center max-w-md text-center p-8 bg-gray-900/90 rounded-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
              <motion.h3 
                className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4"
              >
                Finding Buyers
              </motion.h3>
              <div className="h-8 flex items-center justify-center">
                <motion.p 
                  key={loadingText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-gray-300 text-lg"
                >
                  {loadingText}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex mb-8 bg-white/5 p-1 rounded-xl border border-white/10 w-full"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={() => setMode('search')}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${mode === 'search' ? 'bg-purple-500/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Search Buyers
        </button>
        <button
          type="button"
          onClick={() => setMode('direct')}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${mode === 'direct' ? 'bg-cyan-500/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Direct Send
        </button>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <label className={labelClasses}>Seller Name</label>
          <input
            type="text"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            className={inputClasses}
            placeholder="John Doe"
          />
          {errors.sellerName && <p className="text-red-500 text-xs mt-1">{errors.sellerName}</p>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className={labelClasses}>Seller Email</label>
          <input
            type="email"
            value={sellerEmail}
            onChange={(e) => setSellerEmail(e.target.value)}
            className={inputClasses}
            placeholder="john@example.com"
          />
          {errors.sellerEmail && <p className="text-red-500 text-xs mt-1">{errors.sellerEmail}</p>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className={labelClasses}>Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={inputClasses}
            placeholder="Decor Creations Inc."
          />
          {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className={labelClasses}>Product Category</label>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className={`${inputClasses} appearance-none`}
          >
            <option value="" disabled className="bg-gray-900">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
            ))}
          </select>
          {errors.productCategory && <p className="text-red-500 text-xs mt-1">{errors.productCategory}</p>}
        </motion.div>

        {mode === 'search' ? (
          <motion.div variants={itemVariants}>
            <label className={labelClasses}>Target Keyword</label>
            <select
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={`${inputClasses} appearance-none`}
            >
              <option value="" disabled className="bg-gray-900">Select a search keyword</option>
              {SEARCH_KEYWORDS.map(kw => (
                <option key={kw} value={kw} className="bg-gray-900">{kw}</option>
              ))}
            </select>
            {errors.searchKeyword && <p className="text-red-500 text-xs mt-1">{errors.searchKeyword}</p>}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <label className={labelClasses}>Buyer Email</label>
            <input
              type="email"
              value={directEmail}
              onChange={(e) => setDirectEmail(e.target.value)}
              className={inputClasses}
              placeholder="buyer@example.com"
            />
            {errors.directEmail && <p className="text-red-500 text-xs mt-1">{errors.directEmail}</p>}
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <label className={labelClasses}>Target Location</label>
          <input
            type="text"
            list="alaska-locations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClasses}
            placeholder="e.g., Anchorage, Alaska or New York, NY"
          />
          <datalist id="alaska-locations">
            {locationSuggestions.map(loc => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className={labelClasses}>Product Image (Optional)</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="product-image"
            />
            <label 
              htmlFor="product-image"
              className="flex items-center justify-center w-full bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-6 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-md" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">Click to upload image</span>
                </div>
              )}
            </label>
          </div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : mode === 'search' ? (
            <>
              <Search className="w-5 h-5" />
              Search for Buyers
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Send Direct Email
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Render the Email Modal right here for Direct Send mode */}
      <AnimatePresence>
        {showDirectModal && (() => {
          const [city = location, state = ''] = location.split(',').map(s => s.trim());
          return (
            <EmailModal
              buyers={[{
                id: `direct-${Date.now()}`,
                name: 'Direct Buyer',
                email: directEmail,
                city: city,
                state: state,
                category: productCategory,
                source: 'manual'
              }]}
              sellerInfo={{
                name: sellerName,
                email: sellerEmail,
                businessName: businessName,
                productCategory: productCategory,
                searchKeyword: '',
                location: location,
              }}
              onClose={() => setShowDirectModal(false)}
            />
          );
        })()}
      </AnimatePresence>
    </>
  );
}
