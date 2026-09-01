export function cleanObject<T>(obj: T): Partial<T> {
  return Object.entries(obj as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((acc, [key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0) &&
      (!(typeof value === "object" && !Array.isArray(value)) ||
        (typeof value === "object" &&
          !Array.isArray(value) &&
          Object.keys(value as Record<string, unknown>).length > 0))
    ) {
      acc[key] =
        typeof value === "object" && !Array.isArray(value)
          ? cleanObject(value as Record<string, unknown>)
          : value;
    }
    return acc;
  }, {}) as Partial<T>;
}
