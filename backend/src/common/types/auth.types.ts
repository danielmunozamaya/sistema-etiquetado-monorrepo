import { UserRole } from './common.types';

export type UserJWT = {
  uuid: string;
  nombre: string;
  rol: UserRole;
};
