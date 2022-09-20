import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseApp';

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

  const onClick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((e) =>
      console.error(e),
    );
  };

  return <button onClick={onClick}>Sign in with Google</button>;
}
