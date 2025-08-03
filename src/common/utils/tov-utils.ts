export function convertTOVtoDescriptors(tov: {
  formality: number;
  warmth: number;
  directness: number;
}): string {
  const level = (v: number) =>
    v >= 0.8 ? 'high' : v >= 0.5 ? 'moderate' : 'low';
  return `Formality: ${level(tov.formality)}, Warmth: ${level(
    tov.warmth,
  )}, Directness: ${level(tov.directness)}`;
}
