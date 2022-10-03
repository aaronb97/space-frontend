import styled from 'styled-components';
import { UserData } from '../types/UserData';

interface Props {
  userInfo: UserData;
}

export const ItemsPanel = ({ userInfo }: Props) => {
  return (
    <>
      <h2 style={{ marginTop: '0px' }}>Items</h2>{' '}
      {userInfo?.items?.map((item) => (
        <ItemDisplay
          key={item.name}
          item={item}
        />
      ))}
    </>
  );
};

const Yellow = styled.div`
  color: yellow;
`;

const Purple = styled.div`
  color: magenta;
`;

const ItemDisplay = ({ item }: { item: { name: string; rarity: string } }) => {
  if (item.rarity === 'legendary') {
    return <Purple>{item.name} (legendary) 💎</Purple>;
  }

  if (item.rarity === 'rare') {
    return <Yellow>{item.name} (rare) ✨</Yellow>;
  }

  return <div>{item.name}</div>;
};
