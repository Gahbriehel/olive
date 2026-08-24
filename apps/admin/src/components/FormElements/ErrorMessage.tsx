import type { JSX } from "react";

interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props): JSX.Element {
  return (
    <p
      className="absolute -bottom-5 right-0 whitespace-nowrap text-right text-xs font-medium text-red-600"
      id="error"
    >
      {message}
    </p>
  );
}
