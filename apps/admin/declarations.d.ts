interface ISelect<T extends Record<string, unknown> = Record<string, unknown>> {
  value: { _id: string } & T;
  label: string;
}
