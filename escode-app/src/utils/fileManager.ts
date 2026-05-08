import type { ExplainMap, FileNode, LearningSet } from '../types'
import { workspaceStorage } from '../storage'

type TemplatesIndexResponse = { sets: string[] }
type TemplateResponse = { name: string; code: string; explain: ExplainMap }

const templatesCache: { sets: string[] | null } = { sets: null }
const learningSetCache: Map<string, LearningSet> = new Map()

export const listTree = (setNames: string[]): FileNode[] =>
  setNames.flatMap((setName) => [
    {
      id: `template-${setName}`,
      kind: 'template',
      setName,
      label: `templates/${setName}/code.ts`,
    },
    {
      id: `workspace-${setName}`,
      kind: 'workspace',
      setName,
      label: `workspace/${setName}/code.ts`,
    },
  ])

export const listTemplateSetNames = async (): Promise<string[]> => {
  if (templatesCache.sets) return templatesCache.sets
  const response = await fetch('/api/templates')
  if (!response.ok) {
    throw new Error(`Failed to load templates index: ${response.status}`)
  }
  const json = (await response.json()) as TemplatesIndexResponse
  templatesCache.sets = Array.isArray(json.sets) ? json.sets : []
  return templatesCache.sets
}

export const getLearningSet = async (setName: string): Promise<LearningSet> => {
  const cached = learningSetCache.get(setName)
  if (cached) return cached

  const response = await fetch(`/api/template?setName=${encodeURIComponent(setName)}`)
  if (!response.ok) {
    throw new Error(`Failed to load template: ${response.status}`)
  }
  const json = (await response.json()) as TemplateResponse
  const setData: LearningSet = {
    name: json.name ?? setName,
    code: json.code ?? '',
    explain: json.explain ?? {},
  }

  learningSetCache.set(setName, setData)
  return setData
}

export const createWorkspaceFileIfMissing = async (setName: string): Promise<void> => {
  await workspaceStorage.createIfMissing(setName)
}

export const readWorkspaceFile = async (setName: string): Promise<string> =>
  workspaceStorage.read(setName)

export const saveWorkspaceFile = async (
  setName: string,
  value: string,
): Promise<void> => {
  await workspaceStorage.write(setName, value)
}
