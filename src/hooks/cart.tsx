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
      await AsyncStorage.getItem('@GoMarket:item');
      console.log(AsyncStorage.getItem('@GoMarket:item'));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, title, price, image_url, quantity = 1 }: Product) => {
      const productIndex = products.findIndex(item => item.id === id);

      if (productIndex >= 0) {
        const updatedProducts = [...products];
        updatedProducts[productIndex].quantity += 1;

        await AsyncStorage.setItem(
          '@GoMarket:item',
          JSON.stringify(updatedProducts),
        );
        setProducts(updatedProducts);
      } else {
        setProducts([...products, { id, title, price, image_url, quantity }]);
        await AsyncStorage.setItem('@GoMarket:item', JSON.stringify(products));
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      if (productIndex >= 0) {
        const updatedProducts = [...products];
        updatedProducts[productIndex].quantity += 1;

        setProducts(updatedProducts);
        await AsyncStorage.setItem(
          '@GoMarket:item',
          JSON.stringify(updatedProducts),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      if (productIndex >= 0) {
        const updatedProducts = [...products];

        if (updatedProducts[productIndex].quantity >= 2) {
          updatedProducts[productIndex].quantity -= 1;
        } else {
          updatedProducts.splice(productIndex, 1);
        }

        setProducts(updatedProducts);
        await AsyncStorage.setItem(
          '@GoMarket:item',
          JSON.stringify(updatedProducts),
        );
      }
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
