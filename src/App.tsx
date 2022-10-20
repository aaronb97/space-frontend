import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from './firebase/firebaseApp';
import { Game } from './routes/Game';

const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const unsubsribe = onAuthStateChanged(auth, (newUser) => {
      if (!newUser) {
        const join = searchParams.get('join');
        if (join) {
          navigate('/login?join=' + join);
        } else {
          navigate('/login');
        }
      } else {
        setUser(newUser);
      }
    });

    return () => unsubsribe();
  }, [navigate, searchParams]);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/play"
          element={user ? <Game user={user} /> : 'Loading...'}
        />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
