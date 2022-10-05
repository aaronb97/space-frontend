import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { client } from '../client';

export const useJoinGroup = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const join = searchParams.get('join');
  const queryClient = useQueryClient();

  const joinGroup = useCallback(() => {
    if (join) {
      client
        .joinGroup(join)
        .then(() => {
          console.log('successfully joined group');
          void queryClient.invalidateQueries(['userInfo']);
        })
        .catch(() => {
          console.log('Group joining failed');
        })
        .finally(() => {
          setSearchParams('');
        });
    }
  }, [join, queryClient, setSearchParams]);

  return joinGroup;
};
