import { useEffect, useState } from 'react';
import './Notification.css';

interface NotificationProps {
  text: string | undefined;
}

export const Notification = (props: NotificationProps) => {
  const [hide, setHide] = useState(props.text === '');

  useEffect(() => {
    if (props.text) {
      setHide(false);
    }

    const timer = setTimeout(() => {
      setHide(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [props.text]);

  return (
    <div className={`notification ${hide ? 'hide' : 'show'}`}>{props.text}</div>
  );
};
