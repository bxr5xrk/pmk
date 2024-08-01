export function getMap<T>(arr: T[], key: (item: T) => string): Record<string, T> {
  return arr.reduce((acc, item) => {
    acc[key(item)] = item;
    return acc;
  }, {} as Record<string, T>);
}
