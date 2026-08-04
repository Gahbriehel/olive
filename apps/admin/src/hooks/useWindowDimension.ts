import { useEffect, useState } from "react";

interface State {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowDimension(): State {
  const [windowSize, setWindowSize] = useState<State>({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize(): void {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return windowSize;
}
