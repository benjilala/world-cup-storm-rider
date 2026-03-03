export type WeightedItem<T> = { item: T; weight: number };

export function pickWeighted<T>(rand: () => number, items: WeightedItem<T>[]): T {
  let total = 0;
  for (const it of items) total += Math.max(0, it.weight);
  if (!(total > 0)) return items[0]!.item;

  let r = rand() * total;
  for (const it of items) {
    r -= Math.max(0, it.weight);
    if (r <= 0) return it.item;
  }
  return items[items.length - 1]!.item;
}

export function toWeightedItems<T>(
  items: T[],
  getWeight: (item: T) => number,
): WeightedItem<T>[] {
  return items.map((item) => ({ item, weight: getWeight(item) }));
}

