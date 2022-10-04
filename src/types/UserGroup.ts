import { UserData } from './UserData';

export interface UserGroup {
  name: string;
  uuid: string;
  users: UserData[];
}
