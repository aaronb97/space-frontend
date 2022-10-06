import { useState } from 'react';
import styled from 'styled-components';
import { UserGroup } from '../types/UserGroup';
import { ColoredUsername } from './ColoredUsername';

const StyledDiv = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid #333333;
`;

const Content = styled.div`
  overflow-y: auto;
  max-height: 200px;
`;

const Header = styled.h3`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
`;

interface Props {
  group: UserGroup;
}

export const GroupsDisplay = ({ group }: Props) => {
  const users = group.users.sort((a, b) => b.level - a.level);
  const [showClipboardNotif, setShowClipboardNotif] = useState(false);

  return (
    <StyledDiv key={`${group.uuid} container`}>
      <Header key={group.uuid}>
        {group.name}{' '}
        <button
          onClick={() => {
            navigator.clipboard
              .writeText(
                `Join my group ${group.name} in Space Game!\n\n${window.location.href}?join=${group.uuid}`,
              )
              .then(() => {
                setShowClipboardNotif(true);
                setTimeout(() => {
                  setShowClipboardNotif(false);
                }, 3000);
              })
              .catch(() => {
                console.error('Failed to copy to clipboard');
              });
          }}
        >
          {showClipboardNotif ? 'Copied to Clipboard!' : 'Copy Invite Link'}
        </button>
      </Header>
      <Content>
        {users.length > 1
          ? users.map((user) => (
              <div key={`${user.username} ${group.name}`}>
                <ColoredUsername userInfo={user} />
              </div>
            ))
          : 'No one here yet... (besides you)'}
      </Content>
    </StyledDiv>
  );
};
