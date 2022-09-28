import { useEffect, useState } from 'react';
import './Notification.css';

interface NotificationProps {
  text: string | undefined;
}

export const Notification = (props: NotificationProps) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);

    const timer = setTimeout(() => {
      setHide(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [props.text]);

  if (!props.text) {
    return <div className="hide"></div>;
  }

  return (
    <div className={`notification ${hide ? 'hide' : 'show'}`}>{props.text}</div>
  );
};
