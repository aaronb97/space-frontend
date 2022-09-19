import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from './client';
import { auth } from './firebaseApp';

function App() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>();
  const [planets, setPlanets] = useState<any>();
  const [selectedPlanet, setSelectedPlanet] = useState<any>();

  const getUserInfo = useCallback(async (user: User) => {
    const data = await client.login(user);
    setUserInfo(data?.data);
  }, []);

  const getPlanets = useCallback(async () => {
    const data = await client.getPlanets();
    setPlanets(data?.data);
  }, []);

  useEffect(() => {
    const unsubsribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        getUserInfo(user);
        getPlanets();
      }
    });

    return () => unsubsribe();
  }, [navigate, getUserInfo, getPlanets]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header"></header>
      <div>Signed in as {userInfo.username}</div>
      <div>Traveling to {userInfo.planet.name}</div>
      <div>Velocities:</div>
      <div>{userInfo.velocityX}</div>
      <div>{userInfo.velocityY}</div>
      <div>{userInfo.velocityZ}</div>
      <div>Next boost: {userInfo.nextBoost}</div>
      <div>
        <button onClick={() => signOut(auth)}>Sign Out</button>
      </div>
      <div>
        <button
          onClick={async () => {
            try {
              const result = await client.speedboost();
              setUserInfo(result?.data);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Speed boost
        </button>
      </div>
      <div>
        <select
          onChange={(e) => {
            setSelectedPlanet(
              planets.find(
                (planet: any) => planet.id === Number(e.target.value),
              ),
            );
          }}
        >
          <option
            selected={!selectedPlanet}
            disabled
          >
            Select a destination
          </option>
          {planets?.map((planet: any) => (
            <option
              key={planet.id}
              value={planet.id}
            >
              {planet.name}
            </option>
          ))}
        </select>
      </div>
      {selectedPlanet && (
        <div>
          <button
            onClick={async () => {
              try {
                const result = await client.updateTravelingTo(
                  selectedPlanet.id,
                );
                setUserInfo(result?.data);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Go to {selectedPlanet.name}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
