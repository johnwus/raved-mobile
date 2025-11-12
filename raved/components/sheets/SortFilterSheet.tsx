import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

interface SortFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  onApply: (opts: { category: string; sort: SortOption }) => void;
  sort: SortOption;
}

const categories = [
  { id: 'all', label: 'All Items' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'shoes', label: 'Shoes' },
];

export const SortFilterSheet: React.FC<SortFilterSheetProps> = ({ visible, onClose, category, sort, onApply }) => {
  const [localCategory, setLocalCategory] = useState(category);
  const [localSort, setLocalSort] = useState<SortOption>(sort);

  React.useEffect(() => {
    if (visible) {
      setLocalCategory(category);
      setLocalSort(sort);
    }
  }, [visible, category, sort]);

  return (
    <BottomSheet visible={visible} onClose={onClose} height="75%" allowCollapse>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sort & Filter</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.chipsRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setLocalCategory(cat.id)}
                  style={[styles.chip, localCategory === cat.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, localCategory === cat.id && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <View style={styles.list}>
              {([
                { id: 'newest', label: 'Newest' },
                { id: 'popular', label: 'Popular' },
                { id: 'price_asc', label: 'Price: Low to High' },
                { id: 'price_desc', label: 'Price: High to Low' },
              ] as { id: SortOption; label: string }[]).map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.row}
                  onPress={() => setLocalSort(opt.id)}
                >
                  <Text style={styles.rowText}>{opt.label}</Text>
                  {localSort === opt.id && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              onApply({ category: localCategory, sort: localSort });
              onClose();
            }}
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: { padding: theme.spacing[1] },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[6],
  },
  section: { gap: theme.spacing[3] },
  sectionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
  chip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  chipActive: { backgroundColor: theme.colors.primary + '1A' },
  chipText: {
    fontSize: theme.typography.fontSize[12],
    color: '#374151',
  },
  chipTextActive: { color: theme.colors.primary },
  list: { backgroundColor: '#FFFFFF', borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: '#E5E7EB' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowText: { fontSize: theme.typography.fontSize[14], color: '#111827' },
  footer: { padding: theme.spacing[4], borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  applyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[3],
    alignItems: 'center',
  },
  applyText: { color: 'white', fontSize: theme.typography.fontSize[14], fontWeight: theme.typography.fontWeight.semibold },
});
