import { AnchorHTMLAttributes } from 'react';
import './IconButton.css';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  iconClassName: string;
}

export const IconAnchor = ({ iconClassName, ...props }: Props) => {
  return (
    <a
      {...props}
      className="icon-button"
    >
      <i className={iconClassName} />
    </a>
  );
};
