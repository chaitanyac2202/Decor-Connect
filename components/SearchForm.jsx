'use client';

import { motion } from 'framer-motion';
import { useState, useContext } from 'react';
import { Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

const CATEGORIES = [
  'Wall Art',
  'Furniture',
  'Lighting',
  'Rugs',
  'Curtains',
  'Vases & Decor Pieces',
  'Mirrors',
  'Candles',
  'Garden Decor',
  'Other'
];

const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300";
const labelClasses = "text-sm font-medium text-gray-300 mb-2 block";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function SearchForm() {
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [location, setLocation] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
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
    if (!productCategory) newErrors.productCategory = 'Category is required';
    if (!productDescription) newErrors.productDescription = 'Description is required';
    if (!location) newErrors.location = 'Location is required';
    if (!sellerName) newErrors.sellerName = 'Name is required';
    if (!sellerEmail) {
      newErrors.sellerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(sellerEmail)) {
      newErrors.sellerEmail = 'Email is invalid';
    }
    if (!businessName) newErrors.businessName = 'Business Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      setSellerInfo({
        name: sellerName,
        email: sellerEmail,
        businessName: businessName
      });
      
      const response = await fetch('/api/find-buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: productCategory, location }),
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

      <motion.div variants={itemVariants}>
        <label className={labelClasses}>Product Description</label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className={`${inputClasses} min-h-[100px] resize-none`}
          placeholder="Describe your product..."
        />
        {errors.productDescription && <p className="text-red-500 text-xs mt-1">{errors.productDescription}</p>}
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className={labelClasses}>Target Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClasses}
          placeholder="e.g., New York, NY or California"
        />
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
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search for Buyers
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
