import { useEffect, useState } from 'react';
import { getDateString } from '../../utils/getDateString';

interface Props {
  title: string;
  initialTime: number;
  belowZeroFallback?: string;
}

export function Countdown({ initialTime, title, belowZeroFallback }: Props) {
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

  if (time < 0 && belowZeroFallback) {
    return <div>{belowZeroFallback}</div>;
  }

  return (
    <div>
      {title}: {getDateString(time)}
    </div>
  );
}
