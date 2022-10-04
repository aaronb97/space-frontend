import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { client } from '../client';
import { UserData } from '../types/UserData';
import { logError } from '../utils/logError';

interface Props {
  userInfo: UserData;
}

export const GroupsPanel = ({ userInfo }: Props) => {
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState('');

  return (
    <>
      {userInfo.groups.map((group) => (
        <div key={`${group.uuid} container`}>
          <h3 key={group.uuid}>
            {group.name}{' '}
            <button
              onClick={() => {
                navigator.clipboard
                  .writeText(
                    `Join my group on Space Game!\n\n${window.location.href}?join=${group.uuid}`,
                  )
                  .then(() => {
                    console.log('Copied to clipboard');
                  })
                  .catch(() => {
                    console.error('Failed to copy to clipboard');
                  });
              }}
            >
              🔗
            </button>
          </h3>
          {group.users
            .filter((user) => user.username !== userInfo.username)
            .map((user) => (
              <div key={`${user.username} ${group.name}`}>{user.username}</div>
            ))}
        </div>
      ))}
      <div>
        <input
          onChange={(e) => setNewGroupName(e.target.value)}
          value={newGroupName}
          placeholder={'Enter Group Name'}
        />
        <button
          disabled={newGroupName.length < 1}
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
      </div>
    </>
  );
};