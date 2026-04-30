import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';
export const Role = (role: 'ADMIN' | 'USER' | 'SUPER_ADMIN') => {
  return SetMetadata(ROLE_KEY, role);
};
