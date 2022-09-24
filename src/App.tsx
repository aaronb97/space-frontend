import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebaseApp';
import { Game } from './Game';

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
      <div className="App">
        <header className="App-header">{user && <Game user={user} />}</header>
      </div>
    </QueryClientProvider>
  );
}

export default App;
