import { useState } from 'react';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import { client } from '../client';
import { UserData } from '../types/UserData';
import { logError } from '../utils/logError';
import { GroupsDisplay } from './GroupDisplay';

interface Props {
  userInfo: UserData;
}

const CreateGroupSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 24px;
`;

const Text = styled.div`
  max-width: 300px; ;
`;

export const GroupsPanel = ({ userInfo }: Props) => {
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState('');

  return (
    <>
      {userInfo.groups.length ? (
        userInfo.groups.map((group) => (
          <GroupsDisplay
            key={group.uuid}
            group={group}
            currentUsername={userInfo.username}
          />
        ))
      ) : (
        <Text>
          Get started by creating a new group, or click an invite link from
          someone already in a group
        </Text>
      )}
      {userInfo.groups.length <= 5 && (
        <CreateGroupSection>
          <input
            onChange={(e) => setNewGroupName(e.target.value)}
            value={newGroupName}
            style={{ width: '65%', marginRight: '8px' }}
            placeholder={'Enter New Group Name'}
            maxLength={20}
          />
          {newGroupName.length > 0 && (
            <button
              onClick={() => {
                client
                  .createGroup(newGroupName)
                  .then(() => {
                    setNewGroupName('');
                    void queryClient.invalidateQueries(['userInfo']);
                  })
                  .catch((e) => logError(e));
              }}
            >
              Create Group
            </button>
          )}
        </CreateGroupSection>
      )}
    </>
  );
};
