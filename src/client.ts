import axios, { AxiosResponse } from 'axios';
import { User } from 'firebase/auth';
import { auth } from './firebase/firebaseApp';
import { Planet } from './types/Planet';
import { UserData } from './types/UserData';
import { UserGroup } from './types/UserGroup';

class Client {
  constructor(private readonly url: string) {}

  async login(user: User | null): Promise<AxiosResponse<UserData> | undefined> {
    return await this.post('login', undefined, user);
  }

  async speedboost(): Promise<AxiosResponse<UserData> | undefined> {
    return await this.post('speedboost');
  }

  async updateTravelingTo(
    id: string | number,
  ): Promise<AxiosResponse<UserData> | undefined> {
    return await this.post(`travelingTo/${id}`);
  }

  async teleport(
    id: string | number,
  ): Promise<AxiosResponse<UserData> | undefined> {
    return await this.post(`teleport/${id}`);
  }

  async getPlanets(): Promise<AxiosResponse<Planet[]> | undefined> {
    return await this.get('planets');
  }

  async createGroup(name: string): Promise<AxiosResponse<string> | undefined> {
    return await this.post('userGroups', { name });
  }

  async joinGroup(uuid: string): Promise<AxiosResponse<UserGroup> | undefined> {
    return await this.post(`joinGroup/${uuid}`);
  }

  private async post(
    path: string,
    data?: Record<string, any>,
    user = auth.currentUser,
  ) {
    if (!user) {
      console.error('User not defined');
      return;
    }

    const token = await user.getIdToken();

    return await axios.post(`${this.url}/${path}`, data, {
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

    return await axios.get(`${this.url}/${path}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }
}

export const client = new Client(
  process.env.REACT_APP_SERVER_URL ?? 'http://localhost:3000',
);
