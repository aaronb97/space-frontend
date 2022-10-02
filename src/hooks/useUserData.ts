import { User } from 'firebase/auth';
import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { client } from '../client';

export const useUserData = (user: User) => {
  const queryClient = useQueryClient();

  const { data: userInfoData, error } = useQuery(
    ['userInfo', user.uid],
    async () => await client.login(user),
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
  );

  const invalidate = useCallback(
    async () => await queryClient.invalidateQueries(['userInfo']),
    [queryClient],
  );

  useEffect(() => {
    return () => {
      void invalidate();
    };
  }, [invalidate]);

  return {
    userInfo: userInfoData?.data,
    invalidate,
    error,
  };
};
