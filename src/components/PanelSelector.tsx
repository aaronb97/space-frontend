import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseApp';
import { PanelType } from '../types/Panel';

interface Props {
  selectedPanel: string | undefined;
  setSelectedPanel: React.Dispatch<React.SetStateAction<PanelType>>;
}

export const PanelSelector = ({ selectedPanel, setSelectedPanel }: Props) => {
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
        <div>
          <button
            className="btn"
            style={{ width: '100%', textAlign: 'left' }}
            disabled={selectedPanel === 'items'}
            onClick={() => {
              setSelectedPanel('items');
            }}
          >
            <i
              style={{ marginRight: '8px', marginLeft: '8px' }}
              className="fa-solid fa-box"
            />
            Items
          </button>
        </div>
        <div>
          <button
            style={{ width: '100%', textAlign: 'left' }}
            disabled={selectedPanel === 'navigation'}
            onClick={() => {
              setSelectedPanel('navigation');
            }}
          >
            <i
              style={{ marginRight: '8px', marginLeft: '8px' }}
              className="fa-solid fa-map-location-dot"
            />
            Navigation
          </button>
        </div>
        <div>
          <button
            style={{ width: '100%', textAlign: 'left' }}
            disabled={selectedPanel === 'groups'}
            onClick={() => {
              setSelectedPanel('groups');
            }}
          >
            <i
              style={{ marginRight: '8px', marginLeft: '8px' }}
              className="fa-solid fa-user-group"
            />
            Groups
          </button>
        </div>
        <div>
          <button
            style={{ width: '100%', textAlign: 'left', marginTop: '24px' }}
            onClick={() => {
              void signOut(auth);
            }}
          >
            <i
              style={{ marginRight: '8px', marginLeft: '8px' }}
              className="fa-solid fa-arrow-right-from-bracket"
            />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
