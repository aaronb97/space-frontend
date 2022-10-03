import { useQueryClient } from 'react-query';
import { client } from '../client';
import { UserData } from '../types/UserData';
import { logError } from '../utils/logError';

interface Props {
  userInfo: UserData;
}

export const GroupsPanel = ({ userInfo }: Props) => {
  const queryClient = useQueryClient();
  return (
    <>
      <h3>Groups</h3>
      {userInfo.groups.map((group) => (
        <div key={group.name}>{group.name}</div>
      ))}
      <div>
        <button
          onClick={() => {
            client
              .createGroup(`Group ${Math.random()}`)
              .then(() => {
                void queryClient.invalidateQueries(['userInfo']);
              })
              .catch((e) => logError(e));
          }}
        >
          Create Group
        </button>
      </div>
    </>
  );
};
