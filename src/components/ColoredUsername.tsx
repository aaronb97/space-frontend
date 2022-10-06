import { UserData } from '../types/UserData';

export const ColoredUsername = ({ userInfo }: { userInfo: UserData }) => {
  return (
    <span style={{ color: userInfo.color }}>
      {userInfo.username} (Level {userInfo.level})
    </span>
  );
};
