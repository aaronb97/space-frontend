import { ButtonHTMLAttributes } from 'react';
import './IconButton.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName: string;
}

export const IconButton = ({ iconClassName, ...props }: Props) => {
  return (
    <button
      {...props}
      className="icon-button"
    >
      <i className={iconClassName} />
    </button>
  );
};
