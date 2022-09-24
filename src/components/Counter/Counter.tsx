import { useEffect, useState } from 'react';

interface Props {
  title: string;
  initialValue: number;
  render: (value: number) => number | string;
  decrement?: boolean;
  interval?: number;
}

export function Counter({
  initialValue,
  title,
  render,
  interval = 1000,
  decrement = false,
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      decrement ? setValue(value - 1) : setValue(value + 1);
    }, interval);

    return () => clearTimeout(timer);
  });

  return (
    <div>
      {title}: {render(value)}
    </div>
  );
}
