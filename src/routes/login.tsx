import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase/firebaseApp';
import { logError } from '../utils/logError';

const google = new GoogleAuthProvider();

export function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const onClickGoogle = () => {
    signInWithPopup(auth, google).catch((e) => console.error(e));
  };

  const onClickGuest = () => {
    signInAnonymously(auth).catch(logError);
  };

  return (
    <Container>
      <button onClick={onClickGoogle}>Sign in with Google</button>
      <button onClick={onClickGuest}>Continue as Guest</button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 500px;
`;
