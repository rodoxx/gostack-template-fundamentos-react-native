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
      // await AsyncStorage.clear();
      const storedProducts = await AsyncStorage.getItem(
        '@gomarketplace:products',
      );
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(item => item.id === product.id);
      let newList: Product[] = [];
      if (index < 0) {
        newList = [
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ];
        setProducts(newList);
        await AsyncStorage.setItem(
          '@gomarketplace:products',
          JSON.stringify(newList),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newList = products.map(product => {
        if (product.id === id) {
          // eslint-disable-next-line no-param-reassign
          product.quantity += 1;
        }
        return product;
      });

      setProducts(newList);
      await AsyncStorage.setItem(
        '@gomarketplace:products',
        JSON.stringify(newList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newList = products.map(product => {
        if (product.id === id) {
          // eslint-disable-next-line no-param-reassign
          product.quantity -= 1;
        }
        return product;
      });

      setProducts(newList);
      await AsyncStorage.setItem(
        '@gomarketplace:products',
        JSON.stringify(newList),
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
