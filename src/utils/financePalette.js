// Fixed-order categorical palette, validated for CVD-safety + contrast against a dark
// surface (see the dataviz skill's reference palette). Colors are assigned by category
// insertion order, never re-sorted by value — so a category keeps its color across filters.
export const CATEGORY_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

export const OTHER_COLOR = '#5A6B80'

// Beyond the palette's 8 safe slots, fold the smallest categories into "Otros" instead of
// generating more hues (a 9th+ series would break the validated CVD ordering).
export function foldToPalette(entries, labelKey, valueKey, max = CATEGORY_COLORS.length) {
  const sorted = [...entries].sort((a, b) => b[valueKey] - a[valueKey])
  if (sorted.length <= max) return sorted
  const head = sorted.slice(0, max - 1)
  const tail = sorted.slice(max - 1)
  const otherTotal = tail.reduce((acc, e) => acc + e[valueKey], 0)
  return [...head, { [labelKey]: 'Otros', [valueKey]: otherTotal }]
}
