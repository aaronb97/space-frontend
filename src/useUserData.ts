import { User } from 'firebase/auth';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { client } from './client';

export const useUserData = (user: User) => {
  const queryClient = useQueryClient();

  const { data: userInfoData } = useQuery(
    ['userInfo', user.uid],
    async () => await client.login(user),
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    },
  );

  const invalidate = async () =>
    await queryClient.invalidateQueries(['userInfo', user.uid]);

  useEffect(() => {
    return () => {
      void invalidate();
    };
  }, []);

  return {
    userInfo: userInfoData?.data,
    invalidate,
  };
};
