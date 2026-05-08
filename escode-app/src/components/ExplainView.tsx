import type { ExplainMap } from '../types'

type Props = {
  title: string
  currentLine: number
  explanations: ExplainMap
}

// インラインコードをspanに変換（簡易Markdownレンダラ）
const renderExplainText = (text: string) => {
  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }
    return <span key={i}>{part}</span>
  })
}

export const ExplainView = ({ title, currentLine, explanations }: Props) => {
  const text = explanations[String(currentLine)]
  const hasExplain = Boolean(text)

  return (
    <div className="explain-panel">
      <div className="panel-header">
        <span className="panel-header__icon">💬</span>
        解説
      </div>
      <div className="explain-body">
        <div className="explain-line-indicator">
          <div className="explain-line-chip">
            <span>L</span>
            <span>{currentLine}</span>
          </div>
          <span className="explain-set-label">{title}</span>
        </div>

        <div className={`explain-text ${hasExplain ? '' : 'explain-text--empty'}`}>
          {hasExplain ? renderExplainText(text) : '（この行の解説はありません）'}
        </div>
      </div>
    </div>
  )
}
