export type WorkspaceStorage = {
  createIfMissing: (setName: string) => Promise<void>
  read: (setName: string) => Promise<string>
  write: (setName: string, value: string) => Promise<void>
}
