import axios, { AxiosResponse } from 'axios';
import { User } from 'firebase/auth';
import { auth } from './firebaseApp';
import { Planet } from './types/Planet';
import { UserData } from './types/UserData';

class Client {
  constructor(private readonly url: string) {}

  async login(user: User | null): Promise<AxiosResponse<UserData> | undefined> {
    return this.post('login', user);
  }

  async speedboost(): Promise<AxiosResponse<UserData> | undefined> {
    return this.post('speedboost');
  }

  async updateTravelingTo(
    id: string | number,
  ): Promise<AxiosResponse<UserData> | undefined> {
    return this.post(`travelingTo/${id}`);
  }

  async getPlanets(): Promise<AxiosResponse<Planet[]> | undefined> {
    return this.get('planets');
  }

  private async post(path: string, user = auth.currentUser) {
    if (!user) {
      console.error('User not defined');
      return;
    }

    const token = await user.getIdToken();

    return axios.post(`${this.url}/${path}`, undefined, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }

  private async get(path: string, user = auth.currentUser) {
    if (!user) {
      console.error('User not defined');
      return;
    }

    const token = await user.getIdToken();

    return axios.get(`${this.url}/${path}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }
}

export const client = new Client(
  process.env.REACT_APP_SERVER_URL ?? 'http://localhost:3000',
);
