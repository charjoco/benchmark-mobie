import { forwardRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { BRANDS, SIZES, COLOR_BUCKETS, SORT_OPTIONS, COLOR_BUCKET_HEX, ALL_CATEGORIES } from "@/lib/constants";
import type { FilterState, ColorBucket, AppCategory } from "@/lib/types";

interface FilterSheetProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(
  function FilterSheet({ filters, onApply }, ref) {
    // Draft state — only committed on "Apply Filters"
    const [draft, setDraft] = useState<FilterState>(filters);

    // Reset draft when sheet opens with latest filters
    const handleSheetChange = useCallback(
      (index: number) => {
        if (index >= 0) {
          setDraft(filters);
        }
      },
      [filters]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
        />
      ),
      []
    );

    function setCategory(key: AppCategory | null) {
      setDraft((d) => ({ ...d, category: key }));
    }

    function toggleBrand(key: string) {
      setDraft((d) => ({
        ...d,
        brands: d.brands.includes(key)
          ? d.brands.filter((b) => b !== key)
          : [...d.brands, key],
      }));
    }

    function toggleSize(size: string) {
      setDraft((d) => ({
        ...d,
        sizes: d.sizes.includes(size)
          ? d.sizes.filter((s) => s !== size)
          : [...d.sizes, size],
      }));
    }

    function toggleColor(color: ColorBucket) {
      setDraft((d) => ({
        ...d,
        colors: d.colors.includes(color)
          ? d.colors.filter((c) => c !== color)
          : [...d.colors, color],
      }));
    }

    function apply() {
      onApply(draft);
      (ref as React.RefObject<BottomSheet>)?.current?.close();
    }

    function clearAll() {
      const cleared: FilterState = {
        category: null,
        feedMode: draft.feedMode,
        brands: [],
        colors: [],
        sizes: [],
        onSale: false,
        isNew: false,
        sortBy: "lastSeenAt",
      };
      setDraft(cleared);
    }

    const hasChanges = JSON.stringify(draft) !== JSON.stringify(filters);
    const hasDraftFilters =
      draft.category !== null ||
      draft.brands.length > 0 ||
      draft.colors.length > 0 ||
      draft.sizes.length > 0 ||
      draft.onSale ||
      draft.isNew ||
      draft.sortBy !== "lastSeenAt";

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["75%", "95%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            {hasDraftFilters && (
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sort */}
          <Section title="Sort">
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.row}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    sortBy: opt.value as FilterState["sortBy"],
                  }))
                }
              >
                <Text
                  style={[
                    styles.rowLabel,
                    draft.sortBy === opt.value && styles.rowLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {draft.sortBy === opt.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </Section>

          {/* Category */}
          <Section title="Category">
            <View style={styles.pillRow}>
              <Pill
                label="All"
                active={draft.category === null}
                onPress={() => setCategory(null)}
              />
              {ALL_CATEGORIES.map((cat) => (
                <Pill
                  key={cat.key}
                  label={cat.label}
                  active={draft.category === cat.key}
                  onPress={() => setCategory(draft.category === cat.key ? null : cat.key)}
                />
              ))}
            </View>
          </Section>

          {/* Quick filters */}
          <Section title="Filter">
            <View style={styles.pillRow}>
              <Pill
                label="On Sale"
                active={draft.onSale}
                onPress={() => setDraft((d) => ({ ...d, onSale: !d.onSale }))}
              />
              <Pill
                label="New Arrivals"
                active={draft.isNew}
                onPress={() => setDraft((d) => ({ ...d, isNew: !d.isNew }))}
              />
            </View>
          </Section>

          {/* Brands */}
          <Section title="Brand">
            {BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand.key}
                style={styles.row}
                onPress={() => toggleBrand(brand.key)}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    draft.brands.includes(brand.key) && styles.rowLabelActive,
                  ]}
                >
                  {brand.label}
                </Text>
                {draft.brands.includes(brand.key) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </Section>

          {/* Sizes */}
          <Section title="Size">
            <View style={styles.pillRow}>
              {SIZES.map((size) => (
                <Pill
                  key={size}
                  label={size}
                  active={draft.sizes.includes(size)}
                  onPress={() => toggleSize(size)}
                />
              ))}
            </View>
          </Section>

          {/* Colors */}
          <Section title="Color">
            <View style={styles.colorGrid}>
              {COLOR_BUCKETS.map((color) => {
                const hex = COLOR_BUCKET_HEX[color];
                const isLinear = hex.startsWith("linear");
                const isSelected = draft.colors.includes(color);
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => toggleColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: isLinear ? "#6b7280" : hex },
                      isSelected && styles.colorSwatchActive,
                    ]}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>
          </Section>

          {/* Apply button — inside scroll so it's always reachable */}
          <View style={styles.applyContainer}>
            <TouchableOpacity
              style={[styles.applyBtn, !hasChanges && styles.applyBtnDisabled]}
              onPress={apply}
              activeOpacity={0.85}
            >
              <Text style={[styles.applyText, !hasChanges && styles.applyTextDisabled]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[pillStyles.pill, active && pillStyles.pillActive]}
      activeOpacity={0.7}
    >
      <Text style={[pillStyles.label, active && pillStyles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#111113",
  },
  handle: {
    backgroundColor: "#3f3f46",
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272a",
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#f4f4f5",
  },
  clearText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#71717a",
    textDecorationLine: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1c1c1e",
  },
  rowLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#a1a1aa",
  },
  rowLabelActive: {
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 8,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchActive: {
    borderColor: "#ffffff",
    transform: [{ scale: 1.15 }],
  },
  applyContainer: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 0,
  },
  applyBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyBtnDisabled: {
    backgroundColor: "#3f3f46",
  },
  applyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#09090b",
    letterSpacing: 0.3,
  },
  applyTextDisabled: {
    color: "#71717a",
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#52525b",
    marginBottom: 4,
  },
});

const pillStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  pillActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#a1a1aa",
  },
  labelActive: {
    color: "#09090b",
  },
});
