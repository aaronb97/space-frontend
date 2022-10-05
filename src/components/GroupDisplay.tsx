import styled from 'styled-components';
import { UserGroup } from '../types/UserGroup';

interface Props {
  group: UserGroup;
}

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

export const GroupsDisplay = ({ group }: Props) => {
  return (
    <StyledDiv key={`${group.uuid} container`}>
      <Header key={group.uuid}>
        {group.name}{' '}
        <button
          onClick={() => {
            navigator.clipboard
              .writeText(
                `Join my group in Space Game!\n\n${window.location.href}?join=${group.uuid}`,
              )
              .then(() => {
                console.log('Copied to clipboard');
              })
              .catch(() => {
                console.error('Failed to copy to clipboard');
              });
          }}
        >
          Copy Invite Link
        </button>
      </Header>
      <Content>
        {group.users.map((user) => (
          <div key={`${user.username} ${group.name}`}>{user.username}</div>
        ))}
      </Content>
    </StyledDiv>
  );
};
