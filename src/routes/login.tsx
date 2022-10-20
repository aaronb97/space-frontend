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
import { TextIconButton } from '../components/TextIconButton';
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
          navigate('/play?join=' + join);
        } else {
          navigate('/play');
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
      <OuterContainer>
        <InnerContainer>
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
        </InnerContainer>
      </OuterContainer>
    );
  }

  return (
    <OuterContainer>
      <InnerContainer>
        <TextIconButton
          onClick={onClickGoogle}
          iconClassName="fa-brands fa-google"
        >
          Google Sign-In
        </TextIconButton>
        <TextIconButton
          onClick={onClickEmail}
          iconClassName="fa-solid fa-envelope"
        >
          Email Sign-In
        </TextIconButton>
        <TextIconButton
          onClick={onClickGuest}
          iconClassName="fa-solid fa-user-large"
        >
          Continue as Guest
        </TextIconButton>
      </InnerContainer>
    </OuterContainer>
  );
}

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
