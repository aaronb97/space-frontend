interface Props {
  selectedPanel: string;
  setSelectedPanel: React.Dispatch<
    React.SetStateAction<'items' | 'navigation'>
  >;
}

export const PanelSelector = ({ selectedPanel, setSelectedPanel }: Props) => {
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
    </div>
  );
};
