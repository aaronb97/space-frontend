import { useEffect, useState } from 'react';

interface Props {
  initialValue: number;
  render: (value: number) => number | string;
  decrement?: boolean;
  interval?: number;
  onReachZero?: () => void;
}

export function Counter({
  initialValue,
  render,
  interval = 1000,
  decrement = false,
  onReachZero,
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      decrement ? setValue(value - 1) : setValue(value + 1);

      if (Math.floor(value) === 0 && onReachZero) {
        onReachZero();
      }
    }, interval);

    return () => clearTimeout(timer);
  });

  return <>{render(value)}</>;
}
