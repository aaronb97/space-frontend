import { useMemo } from 'react';
import Select, { SingleValue } from 'react-select';
import { Planet } from '../types/Planet';
import { UserData } from '../types/UserData';
import { calculateDist } from '../utils/calculateDist';
import { formatDistance } from '../utils/formatDistance';

interface Option {
  label: string;
  value: number;
  distance: number;
}

interface Props {
  planets: Planet[];
  selectedPlanet: number | '';
  userInfo: UserData;
  onChange: (option: SingleValue<Option>) => void;
}

export const DestinationPicker = ({
  planets,
  selectedPlanet,
  userInfo,
  onChange,
}: Props) => {
  const options = useMemo(() => {
    return planets
      .filter((planet) => planet.id !== userInfo.planet.id)
      .map((planet) => ({
        value: planet.id,
        label: planet.name,
        distance: calculateDist(userInfo, planet),
        visited: userInfo.visitedPlanets.some(
          (visitedPlanet) => visitedPlanet.id === planet.id,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [planets, userInfo]);

  const selectedOption = options?.find(
    (option) => option.value === selectedPlanet,
  );

  return (
    <Select
      placeholder="Select a Destination"
      options={options}
      isSearchable={false}
      onChange={onChange}
      value={selectedOption ?? null}
      styles={{
        menu: (provided) => ({
          ...provided,
          alignSelf: 'center',
          width: 'max-content',
        }),
      }}
      formatOptionLabel={(option, { context }) => {
        if (context === 'value') {
          return option.label;
        }

        return (
          <>
            <div>
              {option.label} {option.visited ? '✓' : ''}
            </div>
            <div>{formatDistance(option.distance)}</div>
          </>
        );
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          text: 'white',
          neutral0: 'hsl(0, 0%, 10%)',
          neutral5: 'hsl(0, 0%, 20%)',
          neutral10: 'hsl(0, 0%, 30%)',
          neutral20: 'hsl(0, 0%, 40%)',
          neutral30: 'hsl(0, 0%, 50%)',
          neutral40: 'hsl(0, 0%, 60%)',
          neutral50: 'hsl(0, 0%, 70%)',
          neutral60: 'hsl(0, 0%, 80%)',
          neutral70: 'hsl(0, 0%, 90%)',
          neutral80: 'hsl(0, 0%, 95%)',
          neutral90: 'hsl(0, 0%, 100%)',
          primary: '#444',
          primary25: '#444',
          primary50: '#444',
          primary75: '#444',
        },
      })}
    />
  );
};
