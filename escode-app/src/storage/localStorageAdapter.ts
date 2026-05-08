import type { WorkspaceStorage } from './types'

const LOCAL_KEY_PREFIX = 'escode:workspace:'

const keyFor = (setName: string): string => `${LOCAL_KEY_PREFIX}${setName}`

export const localStorageAdapter: WorkspaceStorage = {
  createIfMissing: async (setName) => {
    const key = keyFor(setName)
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, '')
    }
  },
  read: async (setName) => localStorage.getItem(keyFor(setName)) ?? '',
  write: async (setName, value) => {
    localStorage.setItem(keyFor(setName), value)
  },
}
