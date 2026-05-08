import type { WorkspaceStorage } from './types'

const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Workspace API error: ${response.status} ${text}`)
  }

  return (await response.json()) as T
}

export const fileApiAdapter: WorkspaceStorage = {
  createIfMissing: async (setName) => {
    await apiRequest<{ ok: boolean }>('/api/workspace', {
      method: 'POST',
      body: JSON.stringify({ setName }),
    })
  },
  read: async (setName) => {
    const result = await apiRequest<{ value: string }>(
      `/api/workspace?setName=${encodeURIComponent(setName)}`,
      { method: 'GET' },
    )
    return result.value ?? ''
  },
  write: async (setName, value) => {
    await apiRequest<{ ok: boolean }>('/api/workspace', {
      method: 'PUT',
      body: JSON.stringify({ setName, value }),
    })
  },
}
