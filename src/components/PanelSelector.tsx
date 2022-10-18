import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseApp';
import { PanelType } from '../types/Panel';
import { TextIconButton } from './TextIconButton';

interface Props {
  setSelectedPanel: React.Dispatch<React.SetStateAction<PanelType>>;
}

export const PanelSelector = ({ setSelectedPanel }: Props) => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '116px',
        }}
      >
        <TextIconButton
          onClick={() => {
            setSelectedPanel('items');
          }}
          iconClassName="fa-solid fa-box"
        >
          Items
        </TextIconButton>
        <TextIconButton
          onClick={() => {
            setSelectedPanel('navigation');
          }}
          iconClassName="fa-solid fa-map-location-dot"
        >
          Navigation
        </TextIconButton>
        <TextIconButton
          onClick={() => {
            setSelectedPanel('groups');
          }}
          iconClassName="fa-solid fa-user-group"
        >
          Groups
        </TextIconButton>
        <TextIconButton
          onClick={() => {
            void signOut(auth);
          }}
          iconClassName="fa-solid fa-arrow-right-from-bracket"
        >
          Sign Out
        </TextIconButton>
      </div>
    </div>
  );
};
