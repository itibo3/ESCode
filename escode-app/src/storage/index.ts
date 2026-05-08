import { fileApiAdapter } from './fileApiAdapter'
import { localStorageAdapter } from './localStorageAdapter'
import type { WorkspaceStorage } from './types'

type StorageMode = 'local' | 'file'

const resolveStorageMode = (): StorageMode => {
  const modeFromEnv = import.meta.env.VITE_STORAGE_MODE
  return modeFromEnv === 'local' ? 'local' : 'file'
}

export const workspaceStorage: WorkspaceStorage =
  resolveStorageMode() === 'file' ? fileApiAdapter : localStorageAdapter
