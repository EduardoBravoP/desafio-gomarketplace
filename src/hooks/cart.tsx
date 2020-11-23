import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedData = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedData) {
        setProducts([...JSON.parse(storagedData)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existProduct = products.filter(item => item.id === product.id)[0];

      if (!existProduct) {
        const productWithQuantity: Product = { ...product, quantity: 1 };
        setProducts([...products, productWithQuantity]);
        AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );

        return products;
      }
      const duplicatedProductIndex = products.indexOf(existProduct);
      const newProducts = products;

      newProducts[duplicatedProductIndex].quantity += 1;

      setProducts([...newProducts]);

      AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));

      return products;
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.filter(item => item.id === id)[0];
      const productIndex = products.indexOf(product);
      const newProducts = products;

      newProducts[productIndex].quantity += 1;

      setProducts([...newProducts]);
      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.filter(item => item.id === id)[0];
      const productIndex = products.indexOf(product);
      const newProducts = products;

      newProducts[productIndex].quantity -= 1;

      setProducts([...newProducts]);
      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
