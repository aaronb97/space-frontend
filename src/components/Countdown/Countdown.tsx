import { useEffect, useState } from 'react';
import { getDateString } from '../../utils/getDateString';

interface Props {
  title: string;
  initialTime: number;
}

export function Countdown({ initialTime, title }: Props) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTime(time - 1);
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div>
      {title}: {getDateString(time)}
    </div>
  );
}
