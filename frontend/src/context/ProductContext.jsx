// ProductsContext.jsx

import React, { createContext, useContext, useEffect, useState, useReducer } from "react";
import axios from "axios";

const ProductsContext = createContext();

export const productsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload
      }
    case 'CREATE_PRODUCTS':
      return {
        ...state,
        products: [action.payload, ...state.products]
      }
    default:
      return state
  }
}

export function ProductsContextProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(""); // Add category state
  const [cachedData, setCachedData] = useState({}); // Cache fetched data
  // Initialize state with useReducer
  const [state, dispatch] = useReducer(productsReducer, {
    products: null
  })

  const fetchProducts = async (category) => {
    if (category === cachedData.category) {
      // If the category is already in cache, use the cached data
      setProducts(cachedData.products);
      setFilteredProducts(cachedData.products);
    } else {
      try {
        const response = await axios.get(
          category === "all"
            ? "http://localhost:4000/api/products"
            : `http://localhost:4000/api/products?category=${category}`
        );

        if (response.status === 200) {
          console.log(`Fetched data for ${category}`, response.data);

          // Cache the fetched data for this category
          setCachedData({
            category,
            products: response.data,
          });

          setProducts(response.data);
          setFilteredProducts(response.data);
          dispatch({ type: 'SET_PRODUCTS', payload: response.data });
        }
      } catch (error) {
        console.error(`Error fetching products:`, error);
      }
    }
  };

  const filterProducts = (query) => {
    const filteredResults = products.filter((product) =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filteredResults);
  };

  useEffect(() => {
    // Fetch products based on the category when the category changes
    fetchProducts(category);
  }, [category]);

  return (
    <ProductsContext.Provider
      value={{
        state,
        products,
        filteredProducts,
        filterProducts,
        fetchProducts: setCategory, // Set the category when fetching
      }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
