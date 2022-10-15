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
          width: '88px',
        }}
      >
        <div>
          <button
            style={{ width: '100%' }}
            disabled={selectedPanel === 'items'}
            onClick={() => {
              setSelectedPanel('items');
            }}
          >
            Items
          </button>
        </div>
        <div>
          <button
            style={{ width: '100%' }}
            disabled={selectedPanel === 'navigation'}
            onClick={() => {
              setSelectedPanel('navigation');
            }}
          >
            Navigation
          </button>
        </div>
        <div>
          <button
            style={{ width: '100%' }}
            disabled={selectedPanel === 'groups'}
            onClick={() => {
              setSelectedPanel('groups');
            }}
          >
            Groups
          </button>
        </div>
      </div>
    </div>
  );
};
