import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from './client';
import { auth } from './firebaseApp';

function App() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();

  const getUserInfo = useCallback(async (user: User) => {
    const data = await client.login(user);
    setUserInfo(data?.data);
  }, []);

  useEffect(() => {
    const unsubsribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        getUserInfo(user);
      }
    });

    return () => unsubsribe();
  }, [navigate, getUserInfo]);

  return (
    <div className="App">
      <header className="App-header"></header>
      {JSON.stringify(userInfo)}
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
}

export default App;
