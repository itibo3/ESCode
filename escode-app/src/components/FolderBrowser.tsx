import { useState } from 'react'
import type { FileNode } from '../types'

type Props = {
  nodes: FileNode[]
  selected: FileNode | null
  onSelect: (node: FileNode) => void
}

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`explorer-section__chevron ${collapsed ? 'explorer-section__chevron--collapsed' : ''}`}
    viewBox="0 0 16 16"
    fill="currentColor"
    width="16"
    height="16"
  >
    <path d="M6 4l4 4-4 4V4z" />
  </svg>
)

// TypeScriptファイルアイコン（青いTS）
const TsIcon = () => (
  <span style={{ fontSize: 11, fontWeight: 800, color: '#3178c6', fontFamily: 'monospace', lineHeight: 1 }}>
    TS
  </span>
)

// フォルダアイコン
const FolderIcon = ({ open }: { open?: boolean }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    {open ? (
      <path d="M1.5 2h4.379l.905 1H14.5l.5.5v8l-.5.5h-13l-.5-.5v-9l.5-.5zm0 1v8h13V4H6.5L5.5 3H1.5z" opacity={0.8} fill="#dcb67a"/>
    ) : (
      <path d="M1.5 2h4.379l.905 1H14.5l.5.5v8l-.5.5h-13l-.5-.5v-9l.5-.5zm0 1v8h13V4H6.5L5.5 3H1.5z" opacity={0.8} fill="#dcb67a"/>
    )}
    <path d="M0 3h5.379l.905 1H15a1 1 0 011 1v7a1 1 0 01-1 1H1a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#dcb67a" opacity={0.6}/>
  </svg>
)

export const FolderBrowser = ({ nodes, selected, onSelect }: Props) => {
  const [templatesOpen, setTemplatesOpen] = useState(true)
  const [workspaceOpen, setWorkspaceOpen] = useState(true)

  const templateNodes = nodes.filter((n) => n.kind === 'template')
  const workspaceNodes = nodes.filter((n) => n.kind === 'workspace')

  return (
    <div className="explorer-section">
      {/* TEMPLATES セクション */}
      <div
        className="explorer-section__header"
        onClick={() => setTemplatesOpen((v) => !v)}
      >
        <ChevronIcon collapsed={!templatesOpen} />
        <FolderIcon open={templatesOpen} />
        <span style={{ marginLeft: 4 }}>TEMPLATES</span>
        <span style={{ marginLeft: 'auto', marginRight: 4 }} className="tree-item__badge">
          {templateNodes.length}
        </span>
      </div>

      {templatesOpen && templateNodes.map((node) => {
        const fileName = node.label.split('/').pop() ?? node.label
        const active = selected?.id === node.id
        return (
          <div
            key={node.id}
            className={`tree-item ${active ? 'tree-item--active' : ''}`}
            style={{ paddingLeft: 28 }}
            onClick={() => onSelect(node)}
            title={node.label}
          >
            <span className="tree-item__icon"><TsIcon /></span>
            <span className="tree-item__label">{node.setName}/{fileName}</span>
          </div>
        )
      })}

      {/* WORKSPACE セクション */}
      <div
        className="explorer-section__header"
        onClick={() => setWorkspaceOpen((v) => !v)}
        style={{ marginTop: 4 }}
      >
        <ChevronIcon collapsed={!workspaceOpen} />
        <FolderIcon open={workspaceOpen} />
        <span style={{ marginLeft: 4 }}>WORKSPACE</span>
        <span style={{ marginLeft: 'auto', marginRight: 4 }} className="tree-item__badge">
          {workspaceNodes.length}
        </span>
      </div>

      {workspaceOpen && workspaceNodes.map((node) => {
        const fileName = node.label.split('/').pop() ?? node.label
        const active = selected?.id === node.id
        return (
          <div
            key={node.id}
            className={`tree-item ${active ? 'tree-item--active' : ''}`}
            style={{ paddingLeft: 28 }}
            onClick={() => onSelect(node)}
            title={node.label}
          >
            <span className="tree-item__icon"><TsIcon /></span>
            <span className="tree-item__label">{node.setName}/{fileName}</span>
          </div>
        )
      })}
    </div>
  )
}
