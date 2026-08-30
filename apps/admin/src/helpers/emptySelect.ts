export function emptySelect(): ISelect;

export function emptySelect<T extends Record<string, unknown>>(
  valueFields: T,
): ISelect<T>;

export function emptySelect<T extends Record<string, unknown>>(
  valueFields?: T,
): ISelect | ISelect<T> {
  if (valueFields === undefined) {
    const out = { value: { _id: "" }, label: "" };
    return out;
  }
  const value: { _id: string } & T = { _id: "", ...valueFields };
  const out = { value, label: "" };
  return out;
}
