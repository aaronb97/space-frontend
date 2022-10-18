import { ButtonHTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName: string;
  children: ReactNode;
}

const StyledI = styled.i`
  margin-right: 8px;
  margin-left: 8px;
`;

const Text = styled.span`
  margin-right: 8px;
`;

export const TextIconButton = ({ iconClassName, ...props }: Props) => {
  return (
    <button
      {...props}
      className="text-icon-button"
    >
      <StyledI className={iconClassName} />
      <Text>{props.children}</Text>
    </button>
  );
};
