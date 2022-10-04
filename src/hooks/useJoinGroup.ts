import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { client } from '../client';

export const useJoinGroup = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const join = searchParams.get('join');

  const joinGroup = useCallback(() => {
    if (join) {
      client
        .joinGroup(join)
        .then(() => {
          console.log('successfully joined group');
        })
        .catch(() => {
          console.log('Group joining failed');
        })
        .finally(() => {
          setSearchParams('');
        });
    }
  }, [join, setSearchParams]);

  return joinGroup;
};
