import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from './client';
import { auth } from './firebaseApp';
import { Planet } from './types/Planet';
import { UserData } from './types/UserData';

function App() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserData>();
  const [planets, setPlanets] = useState<Planet[]>();
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>();

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

  const nextBoost =
    new Date(userInfo.nextBoost).getTime() -
    new Date(userInfo.serverTime).getTime();

  return (
    <div className="App">
      <header className="App-header"></header>
      <div>Signed in as {userInfo.username}</div>
      {userInfo.status === 0 && <div>Traveling to {userInfo.planet.name}</div>}
      {userInfo.status === 1 && <div>Welcome to {userInfo.planet.name}</div>}
      <div>Base speed: {userInfo.baseSpeed}</div>
      <div>Pos X: {userInfo.positionX.toFixed()}</div>
      <div>Pos Y: {userInfo.positionY.toFixed()}</div>
      <div>Pos Z: {userInfo.positionZ.toFixed()}</div>
      <div>Vel X: {userInfo.velocityX.toFixed()}</div>
      <div>Vel Y: {userInfo.velocityY.toFixed()}</div>
      <div>Vel Z: {userInfo.velocityZ.toFixed()}</div>
      {!Number.isNaN(nextBoost) && (
        <div>Next boost: {getDateString(nextBoost)}</div>
      )}
      {userInfo.landingTime && (
        <div>
          Landing:{' '}
          {getDateString(
            new Date(userInfo.landingTime).getTime() -
              new Date(userInfo.serverTime).getTime(),
          )}
        </div>
      )}
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
      {planets && (
        <div>
          <select
            onChange={(e) => {
              setSelectedPlanet(
                planets.find((planet) => planet.id === Number(e.target.value)),
              );
            }}
            defaultValue=""
          >
            <option
              value=""
              disabled
            >
              Select a destination
            </option>
            {planets.map((planet) => (
              <option
                key={planet.id}
                value={planet.id}
              >
                {planet.name}
              </option>
            ))}
          </select>
        </div>
      )}
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

function getDateString(milliseconds: number) {
  let parts = [];

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days) {
    parts.push(`${days} days`);
  }

  if (hours) {
    parts.push(`${hours % 24} hours`);
  }

  if (minutes) {
    parts.push(`${minutes % 60} minutes`);
  }

  if (seconds) {
    parts.push(`${seconds % 60} seconds`);
  }

  return parts.join(', ');
}

export default App;
