// Utility for generating distinctive colors with high contrast
export const generateDistinctiveColors = (count: number, reservedColors: string[] = []): string[] => {
  // HSL color space for better control over distinctiveness
  const baseColors = [
    'hsl(210, 100%, 50%)', // Bright Blue
    'hsl(120, 100%, 35%)', // Forest Green  
    'hsl(280, 100%, 50%)', // Purple
    'hsl(45, 100%, 50%)',  // Golden Yellow
    'hsl(195, 100%, 40%)', // Cyan
    'hsl(25, 100%, 50%)',  // Orange
    'hsl(300, 80%, 60%)',  // Magenta
    'hsl(60, 90%, 45%)',   // Lime
    'hsl(180, 70%, 40%)',  // Teal
    'hsl(320, 90%, 55%)',  // Pink
    'hsl(150, 80%, 40%)',  // Emerald
    'hsl(270, 70%, 55%)',  // Violet
    'hsl(30, 95%, 55%)',   // Amber
    'hsl(200, 85%, 45%)',  // Sky Blue
    'hsl(340, 85%, 55%)',  // Rose
  ];

  // Filter out reserved colors and ensure we have enough distinct colors
  const availableColors = baseColors.filter(color => !reservedColors.includes(color));
  
  if (count <= availableColors.length) {
    return availableColors.slice(0, count);
  }

  // If we need more colors, generate variations
  const colors = [...availableColors];
  let hueStep = 360 / Math.max(count, 12);
  
  for (let i = availableColors.length; i < count; i++) {
    const hue = (i * hueStep) % 360;
    const saturation = 70 + (i % 3) * 10; // 70%, 80%, 90%
    const lightness = 45 + (i % 2) * 10;  // 45%, 55%
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors.slice(0, count);
};

// Special colors for specific categories
export const SPECIAL_COLORS = {
  DEBT: 'hsl(0, 85%, 50%)', // Red for debts
  CASA: 'hsl(260, 70%, 45%)', // Purple for house/home
};

// Get color for expense categories ensuring debt gets special treatment
export const getExpenseCategoryColor = (categoryName: string, allCategories: string[], index: number): string => {
  // Special handling for debt category
  if (categoryName.toLowerCase().includes('dívida') || categoryName.toLowerCase().includes('divida')) {
    return SPECIAL_COLORS.DEBT;
  }
  
  // Special handling for house/home category
  if (categoryName.toLowerCase().includes('casa') || categoryName.toLowerCase().includes('moradia')) {
    return SPECIAL_COLORS.CASA;
  }
  
  // Generate distinctive colors for other categories, excluding special ones
  const reservedColors = Object.values(SPECIAL_COLORS);
  const availableColors = generateDistinctiveColors(allCategories.length, reservedColors);
  
  return availableColors[index % availableColors.length];
};