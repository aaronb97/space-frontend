import { useQuery } from 'react-query';
import { client } from './client';

export const usePlanets = () => {
  const { data, error } = useQuery(
    ['planets'],
    async () => await client.getPlanets(),
    { staleTime: Infinity, cacheTime: Infinity, refetchOnWindowFocus: false },
  );

  return {
    planets: data?.data,
    error,
  };
};
