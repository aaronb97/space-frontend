import axios from 'axios';
import { User } from 'firebase/auth';
import { auth } from './firebaseApp';

class Client {
  constructor(private readonly url: string) {}

  async login(user: User | null) {
    return this.post('login', user);
  }

  async speedboost() {
    return this.post('speedboost');
  }

  async updateTravelingTo(id: string) {
    return this.post(`travelingTo/${id}`);
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
}

export const client = new Client(
  process.env.REACT_APP_SERVER_URL ?? 'http://localhost:3000',
);
