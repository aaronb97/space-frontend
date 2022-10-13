interface Props {
  selectedPanel: string | undefined;
  setSelectedPanel: React.Dispatch<
    React.SetStateAction<'items' | 'navigation' | 'groups' | undefined>
  >;
  onTriggerOverheadView: () => void;
  onTriggerRocketView: () => void;
}

export const PanelSelector = ({
  selectedPanel,
  setSelectedPanel,
  onTriggerOverheadView,
  onTriggerRocketView,
}: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '80px',
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
      <div>
        <button
          style={{ width: '100%' }}
          onClick={() => {
            setSelectedPanel(undefined);
            onTriggerOverheadView();
          }}
        >
          Overhead View
        </button>
      </div>
      <div>
        <button
          style={{ width: '100%' }}
          onClick={() => {
            setSelectedPanel(undefined);
            onTriggerRocketView();
          }}
        >
          Rocket View
        </button>
      </div>
    </div>
  );
};
