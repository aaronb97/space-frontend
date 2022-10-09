import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase/firebaseApp';
import { logError } from '../utils/logError';

const google = new GoogleAuthProvider();

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [emailClicked, setEmailClicked] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const join = searchParams.get('join');
      if (user) {
        if (join) {
          navigate('/?join=' + join);
        } else {
          navigate('/');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, searchParams]);

  const onClickGoogle = () => {
    signInWithPopup(auth, google).catch((e) => console.error(e));
  };

  const onClickGuest = () => {
    signInAnonymously(auth).catch(logError);
  };

  const onClickEmailSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password).catch((e) =>
      console.error(e),
    );
  };

  const onClickEmailSignIn = () => {
    signInWithEmailAndPassword(auth, email, password).catch((e) =>
      console.error(e),
    );
  };

  const onClickEmail = () => {
    setEmailClicked(true);
  };

  if (emailClicked) {
    return (
      <Container>
        <input
          placeholder="E-mail"
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <input
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <button
          onClick={onClickEmailSignIn}
          disabled={!email || !password}
        >
          Sign In
        </button>
        <button
          onClick={onClickEmailSignUp}
          disabled={!email || !password}
        >
          Sign Up
        </button>
        <button onClick={() => setEmailClicked(false)}>Back</button>
      </Container>
    );
  }

  return (
    <Container>
      <button onClick={onClickGoogle}>Sign in with Google</button>
      <button onClick={onClickEmail}>Sign in with Email</button>
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
