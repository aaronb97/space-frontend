import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { auth } from './firebase/firebaseApp';
import { Game } from './routes/Game';

const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    const unsubsribe = onAuthStateChanged(auth, (newUser) => {
      if (!newUser) {
        navigate('/login');
      } else {
        setUser(newUser);
      }
    });

    return () => unsubsribe();
  }, [navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/"
          element={user ? <Game user={user} /> : 'Loading...'}
        />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
