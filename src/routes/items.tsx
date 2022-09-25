import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserData } from '../useUserData';

interface Props {
  user: User;
}

export function Items({ user }: Props) {
  const { userInfo } = useUserData(user);
  const navigate = useNavigate();

  return (
    <div>
      <div>
        <button
          onClick={() => {
            navigate('/');
          }}
        >
          Go back
        </button>
      </div>
      Items:
      {userInfo?.items?.map((item) => (
        <ItemDisplay
          key={item.name}
          item={item}
        ></ItemDisplay>
      ))}
    </div>
  );
}

const Yellow = styled.div`
  color: yellow;
`;

const Purple = styled.div`
  color: magenta;
`;

const ItemDisplay = ({ item }: { item: { name: string; rarity: string } }) => {
  if (item.rarity === 'legendary') {
    return <Purple>{item.name} 💎</Purple>;
  }

  if (item.rarity === 'rare') {
    return <Yellow>{item.name} ✨</Yellow>;
  }

  return <div>{item.name}</div>;
};
