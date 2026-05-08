export type NodeKind = 'template' | 'workspace'

export type FileNode = {
  id: string
  kind: NodeKind
  setName: string
  label: string
}

export type ExplainMap = Record<string, string>

export type LearningSet = {
  name: string
  code: string
  explain: ExplainMap
}

export type TypedChar = {
  char: string
  correct: boolean
}
