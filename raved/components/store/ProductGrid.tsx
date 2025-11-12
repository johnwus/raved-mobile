import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import { StoreItem } from '../../types';
import { useStoreStore } from '../../store/storeStore';

interface ProductGridProps {
  products: StoreItem[];
  onProductPress?: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
}) => {
  const { savedItems, addToCart, saveProduct, unsaveProduct } = useStoreStore();

  const handleSave = (productId: string) => {
    if (savedItems.includes(productId)) {
      unsaveProduct(productId);
    } else {
      saveProduct(productId);
    }
  };

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          isSaved={savedItems.includes(item.id)}
          onSave={() => handleSave(item.id)}
          onAddToCart={() => addToCart(item.id, 1)}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
});

