export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  city: string;
  profile_picture: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
