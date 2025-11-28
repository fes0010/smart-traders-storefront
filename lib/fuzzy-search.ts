// Fuzzy search utility using Levenshtein distance

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function similarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - distance) / longer.length;
}

export interface FuzzyMatch {
  item: string;
  score: number;
}

export function findBestMatches(
  query: string,
  items: string[],
  threshold: number = 0.3,
  maxResults: number = 3
): FuzzyMatch[] {
  if (!query || query.length < 2) return [];

  const matches: FuzzyMatch[] = items
    .map(item => ({
      item,
      score: similarity(query, item)
    }))
    .filter(match => match.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return matches;
}

export function findSuggestions(
  query: string,
  productNames: string[],
  categories: string[]
): string[] {
  if (!query || query.length < 2) return [];

  const allItems = [...new Set([...productNames, ...categories])];
  const matches = findBestMatches(query, allItems, 0.35, 3);
  
  return matches.map(m => m.item);
}
