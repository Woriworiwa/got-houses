import { User } from './models.js';

const users = new Map<string, User>();

export const userStore = {
  findByEmail(email: string): User | undefined {
    return [...users.values()].find(u => u.email === email);
  },

  findById(id: string): User | undefined {
    return users.get(id);
  },

  save(user: User): void {
    users.set(user.id, user);
  },

  clear(): void {
    users.clear();
  },
};
