import {
  GoogleAuthProvider,
  linkWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseApp';
import { usePlanets } from '../hooks/usePlanets';
import { useUserData } from '../hooks/useUserData';
import styled from 'styled-components';
import { logError } from '../utils/logError';
import Visualizer from '../components/Visualizer';
import { NavigationPanel } from '../components/NavigationPanel';
import { ItemsPanel } from '../components/ItemsPanel';
import { PanelSelector } from '../components/PanelSelector';
import { Panel } from '../components/Panel';
import { GroupsPanel } from '../components/GroupsPanel';
import { useSearchParams } from 'react-router-dom';
import { client } from '../client';
import { useQueryClient } from 'react-query';
import { ColoredUsername } from '../components/ColoredUsername';

interface Props {
  user: User;
}

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin: 16px;
`;

const Footer = styled.footer`
  position: fixed;
  padding-left: 16px;
  bottom: 16px;
  display: flex;
  justify-content: space-between;
`;

const SignOutButton = () => {
  return (
    <button
      style={{ margin: '8px' }}
      onClick={() => {
        void signOut(auth);
      }}
    >
      Sign Out
    </button>
  );
};

export function Game({ user }: Props) {
  const [isAnonymous, setIsAnonymous] = useState(user.isAnonymous);
  const [notification, setNotification] = useState<string | undefined>('');
  const [groupNotification, setGroupNotification] = useState<
    string | undefined
  >('');

  const { userInfo, error: userError } = useUserData(user);
  const { planets, error: planetsError } = usePlanets();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedPanel, setSelectedPanel] = useState<
    'items' | 'navigation' | 'groups'
  >('navigation');

  useEffect(() => {
    if (userInfo?.notification) {
      setNotification(userInfo.notification);

      setTimeout(() => {
        setNotification(undefined);
      }, 10000);
    }
  }, [userInfo?.notification]);

  useEffect(() => {
    const join = searchParams.get('join');
    console.log(userInfo, join);
    if (userInfo && join) {
      client
        .joinGroup(join)
        .then((group) => {
          void queryClient.invalidateQueries(['userInfo']);
          const name = group?.data.name;
          if (name) {
            setTimeout(() => {
              setGroupNotification(`Successfully joined '${group?.data.name}'`);
            }, 1000);
          }
        })
        .catch(() => {
          setGroupNotification('Failed to join group');
        })
        .finally(() => {
          setSearchParams('');
        });
    }
  }, [queryClient, searchParams, setSearchParams, userInfo]);

  if (userError || planetsError) {
    return (
      <div>
        Holey smokes! Space Game ran into a problem. We have notified our
        engineers about this and they are working VERY hard to fix the issue.
      </div>
    );
  }

  if (!userInfo || !planets) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Visualizer user={user} />
      <>
        <Header>
          <div>
            {isAnonymous ? (
              <div>Signed in as Guest</div>
            ) : (
              <>
                <div>
                  Signed in as <ColoredUsername userInfo={userInfo} />
                </div>
              </>
            )}
          </div>
          <PanelSelector
            selectedPanel={selectedPanel}
            setSelectedPanel={setSelectedPanel}
          />
        </Header>
        <Center>
          <Panel>
            {selectedPanel === 'navigation' && (
              <NavigationPanel
                userInfo={userInfo}
                planets={planets}
                notifications={[notification, groupNotification].filter(
                  Boolean,
                )}
              />
            )}
            {selectedPanel === 'items' && <ItemsPanel userInfo={userInfo} />}
            {selectedPanel === 'groups' && <GroupsPanel userInfo={userInfo} />}
          </Panel>
        </Center>
        <Footer>
          {<SignOutButton />}
          {isAnonymous && (
            <button
              onClick={() => {
                linkWithPopup(user, new GoogleAuthProvider())
                  .then((cred) => setIsAnonymous(cred.user.isAnonymous))
                  .catch(logError);
              }}
            >
              Sign In to save your progress!
            </button>
          )}
        </Footer>
      </>
    </>
  );
}
