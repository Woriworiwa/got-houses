import { describe, it, expect, beforeEach } from 'vitest';
import { userStore } from './user.store.js';
import { User } from './models.js';

const mockUser: User = {
  id: 'abc-123',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed',
  createdAt: new Date(),
};

describe('userStore', () => {
  beforeEach(() => {
    userStore.clear();
  });

  describe('save & findById', () => {
    it('stores a user and retrieves it by id', () => {
      userStore.save(mockUser);
      expect(userStore.findById('abc-123')).toEqual(mockUser);
    });

    it('returns undefined for unknown id', () => {
      expect(userStore.findById('unknown')).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('finds a user by email', () => {
      userStore.save(mockUser);
      expect(userStore.findByEmail('test@example.com')).toEqual(mockUser);
    });

    it('returns undefined for unknown email', () => {
      expect(userStore.findByEmail('nobody@example.com')).toBeUndefined();
    });

    it('is case-sensitive', () => {
      userStore.save(mockUser);
      expect(userStore.findByEmail('TEST@EXAMPLE.COM')).toBeUndefined();
    });
  });
});
