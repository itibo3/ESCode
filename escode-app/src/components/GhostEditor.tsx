import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
import { useAutoSave } from '../hooks/useAutoSave'
import { useTypingJudge } from '../hooks/useTypingJudge'

type SeriesInfo = {
  prefix: string
  currentStep: number
  totalSteps: number
  currentIndex: number
  stepsInSeries: string[]
  prevSetName: string | null
  nextSetName: string | null
} | null

type Props = {
  mode: 'ghost' | 'normal'
  fileName: string
  templateCode: string
  initialValue: string
  onLineChange: (line: number) => void
  onSave: (value: string) => void | Promise<void>
  onValueChange?: (value: string) => void
  lessonTitle?: string
  lessonDescription?: string | null
  seriesInfo?: SeriesInfo
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
}

const getInputChar = (event: KeyboardEvent): string | null => {
  if (event.key === 'Enter') return '\n'
  if (event.key === 'Tab') return '\t'
  if (event.key === ' ') return ' '
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    return event.key
  }
  return null
}

// 正答率から色を決める
const getAccuracyColor = (acc: number) => {
  if (acc >= 90) return '#4ec9b0'
  if (acc >= 70) return '#dcdcaa'
  return '#f48771'
}

// ミス箇所のコンテキストを取り出す
const getMistakeContext = (text: string, idx: number): string => {
  const start = Math.max(0, idx - 5)
  const end = Math.min(text.length, idx + 6)
  const snippet = text.slice(start, end).replace(/\n/g, '↵').replace(/\t/g, '→')
  const localIdx = idx - start
  return `[${idx + 1}] ...${snippet.slice(0, localIdx)}▶${snippet[localIdx] ?? '?'}◀${snippet.slice(localIdx + 1)}...`
}

// SVG矢印アイコン
const ChevronLeft = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
    <path d="M10.07 3.293L5.364 8l4.708 4.707-.708.707L3.95 8l5.414-5.414.707.707z" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
    <path d="M5.93 3.293L10.636 8 5.93 12.707l.707.707L12.05 8 6.636 2.586l-.707.707z" />
  </svg>
)

export const GhostEditor = ({
  mode,
  fileName,
  templateCode,
  initialValue,
  onLineChange,
  onSave,
  onValueChange,
  lessonTitle,
  lessonDescription,
  seriesInfo,
  onNavigatePrev,
  onNavigateNext,
}: Props) => {
  const frontEditorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const ghostEditorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<string[]>([])

  const { typedText, mismatchIndexes, accuracy, pushInput, backspace, reset } =
    useTypingJudge({ expectedText: templateCode, initialValue })

  const [normalValue, setNormalValue] = useState(initialValue)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    setNormalValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (!onValueChange) return
    if (mode === 'ghost') {
      onValueChange(typedText)
      return
    }
    onValueChange(normalValue)
  }, [mode, normalValue, onValueChange, typedText])

  const done = mode === 'ghost' && typedText.length >= templateCode.length

  useEffect(() => {
    if (done) setShowCompletion(true)
  }, [done])

  // 入力開始したらイントロを閉じる
  useEffect(() => {
    if (typedText.length > 0 && showIntro) {
      setShowIntro(false)
    }
  }, [typedText, showIntro])

  useAutoSave({ value: typedText, onSave, delayMs: 1000 })

  // Monaco decorations でミスタイプを赤くハイライト
  useEffect(() => {
    const editor = frontEditorRef.current
    if (!editor || mode !== 'ghost') return

    const model = editor.getModel()
    if (!model) return

    const newDecorations: MonacoEditor.IModelDeltaDecoration[] = mismatchIndexes.map((idx) => {
      const pos = model.getPositionAt(idx)
      return {
        range: {
          startLineNumber: pos.lineNumber,
          startColumn: pos.column,
          endLineNumber: pos.lineNumber,
          endColumn: pos.column + 1,
        },
        options: {
          inlineClassName: 'escodeMistypeChar',
        },
      }
    })

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations)
  }, [mismatchIndexes, mode])

  const syncGhostScroll = () => {
    if (!frontEditorRef.current || !ghostEditorRef.current) return
    ghostEditorRef.current.setScrollTop(frontEditorRef.current.getScrollTop())
    ghostEditorRef.current.setScrollLeft(frontEditorRef.current.getScrollLeft())
  }

  const onMount: OnMount = (editor, monaco) => {
    frontEditorRef.current = editor

    // テーマ定義（両エディタ分をここで一括）
    monaco.editor.defineTheme('escodeNormal', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
      },
    })
    monaco.editor.defineTheme('escodeGhostFront', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        // CSS側で透明化するのでここは任意の値でOK
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2d2e40',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
      },
    })

    monaco.editor.setTheme(mode === 'ghost' ? 'escodeGhostFront' : 'escodeNormal')

    // CSSインジェクション（decorationsのスタイル）
    const styleId = 'escode-mistype-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .escodeMistypeChar {
          background-color: rgba(244, 135, 113, 0.25);
          border-bottom: 2px solid #f48771;
          color: #f48771 !important;
        }
      `
      document.head.appendChild(style)
    }

    editor.onDidChangeCursorPosition((event) => {
      onLineChange(event.position.lineNumber)
    })
    editor.onDidScrollChange(() => {
      syncGhostScroll()
    })

    if (mode === 'ghost') {
      editor.onKeyDown((event) => {
        const browserEvent = event.browserEvent
        if (browserEvent.key === 'Backspace') {
          browserEvent.preventDefault()
          backspace()
          return
        }
        const char = getInputChar(browserEvent)
        if (char === null) return
        browserEvent.preventDefault()
        pushInput(char)
      })
    }
  }

  const onGhostMount: OnMount = (editor, monaco) => {
    ghostEditorRef.current = editor
    monaco.editor.defineTheme('escodeGhostBg', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editorLineNumber.foreground': '#444444',
        'editorLineNumber.activeForeground': '#444444',
        'editor.lineHighlightBackground': '#00000000',
      },
    })
    monaco.editor.setTheme('escodeGhostBg')
    editor.updateOptions({ readOnly: true })
    syncGhostScroll()
  }

  const displayValue = mode === 'ghost' ? typedText : normalValue
  const progress = mode === 'ghost'
    ? Math.min(100, Math.round((typedText.length / Math.max(1, templateCode.length)) * 100))
    : null

  const accColor = getAccuracyColor(accuracy)

  const hasSeries = seriesInfo != null
  const hasNext = seriesInfo?.nextSetName != null
  const hasPrev = seriesInfo?.prevSetName != null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* タブバー */}
      <div className="tabbar">
        <div className={`tab tab--active`}>
          <span className="tab__icon">
            <span style={{ fontSize: 11, fontWeight: 800, color: '#3178c6', fontFamily: 'monospace' }}>TS</span>
          </span>
          <span className="tab__name">{fileName}</span>
          {mode === 'ghost' && (
            <span className="tab__mode-badge tab__mode-badge--ghost">GHOST</span>
          )}
          {mode === 'normal' && (
            <span className="tab__mode-badge tab__mode-badge--normal">EDIT</span>
          )}
        </div>
      </div>

      {/* ステップナビゲーションバー */}
      {hasSeries && mode === 'ghost' && (
        <div className="step-nav">
          <button
            className={`step-nav__btn ${hasPrev ? '' : 'step-nav__btn--disabled'}`}
            onClick={onNavigatePrev}
            disabled={!hasPrev}
            title="前のステップ"
          >
            <ChevronLeft />
            <span>前へ</span>
          </button>

          <div className="step-nav__center">
            <span className="step-nav__title">{lessonTitle}</span>
            <div className="step-nav__progress">
              {seriesInfo.stepsInSeries.map((_, i) => (
                <div
                  key={i}
                  className={`step-nav__dot ${
                    i < seriesInfo.currentIndex
                      ? 'step-nav__dot--done'
                      : i === seriesInfo.currentIndex
                        ? 'step-nav__dot--current'
                        : ''
                  }`}
                />
              ))}
            </div>
            <span className="step-nav__counter">
              {seriesInfo.currentStep} / {seriesInfo.totalSteps}
            </span>
          </div>

          <button
            className={`step-nav__btn ${hasNext ? '' : 'step-nav__btn--disabled'}`}
            onClick={onNavigateNext}
            disabled={!hasNext}
            title="次のステップ"
          >
            <span>次へ</span>
            <ChevronRight />
          </button>
        </div>
      )}

      {/* プログレスバー（ゴーストモード時） */}
      {mode === 'ghost' && (
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accColor}, ${accColor}cc)`,
            }}
          />
        </div>
      )}

      {/* エディタ本体 */}
      <div className="editor-content">
        {/* ゴーストレイヤー（お手本） */}
        {mode === 'ghost' && (
          <div className="editor-ghost-layer">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={templateCode}
              onMount={onGhostMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                fontLigatures: true,
                wordWrap: 'off',
                lineNumbers: 'on',
                tabSize: 2,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: true,
                domReadOnly: true,
                renderLineHighlight: 'none',
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
              }}
            />
          </div>
        )}

        {/* フロントレイヤー（ユーザー入力） */}
        <div className={mode === 'ghost' ? 'editor-front-layer' : ''} style={mode !== 'ghost' ? { position: 'absolute', inset: 0 } : {}}>
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={displayValue}
            onChange={(value) => {
              if (mode !== 'normal') return
              const next = value ?? ''
              setNormalValue(next)
              void onSave(next)
            }}
            onMount={onMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              wordWrap: 'off',
              lineNumbers: 'on',
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: mode === 'ghost',
              renderLineHighlight: 'line',
              cursorStyle: 'line',
              cursorBlinking: 'blink',
              smoothScrolling: true,
              renderWhitespace: 'boundary',
            }}
          />
        </div>

        {/* イントロカード（ゴーストモード・未入力時） */}
        {mode === 'ghost' && showIntro && lessonDescription && (
          <div className="intro-overlay">
            <div className="intro-card">
              {hasSeries && (
                <div className="intro-card__step-badge">
                  Step {seriesInfo.currentStep} of {seriesInfo.totalSteps}
                </div>
              )}
              <div className="intro-card__title">{lessonTitle}</div>
              <div className="intro-card__description">{lessonDescription}</div>
              <div className="intro-card__hint">
                <span className="intro-card__key">⌨️</span>
                入力を始めると自動で閉じます
              </div>
              <button
                className="intro-card__start"
                onClick={() => {
                  setShowIntro(false)
                  frontEditorRef.current?.focus()
                }}
              >
                スタート
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ミニステータスバー（エディタ下部） */}
      {mode === 'ghost' && (
        <div className="editor-minibar">
          <span style={{ color: accColor, fontWeight: 600 }}>
            精度 {accuracy.toFixed(1)}%
          </span>
          <span>
            {typedText.length} / {templateCode.length} 文字
          </span>
          <span>
            進捗 {progress}%
          </span>
          {mismatchIndexes.length > 0 && (
            <span style={{ color: '#f48771' }}>
              ミス {mismatchIndexes.length} 箇所
            </span>
          )}
        </div>
      )}

      {/* 完了オーバーレイ */}
      {showCompletion && (
        <div className="completion-overlay">
          <div className="completion-card">
            <div className="completion-title">🎉 完了！</div>
            <div
              className={`completion-accuracy ${
                accuracy >= 90 ? '' : accuracy >= 70 ? 'completion-accuracy--mid' : 'completion-accuracy--low'
              }`}
            >
              {accuracy.toFixed(1)}%
            </div>
            <div className="completion-stats">
              <div className="completion-stat">
                <div className="completion-stat__label">入力文字</div>
                <div className="completion-stat__value">{typedText.length}</div>
              </div>
              <div className="completion-stat">
                <div className="completion-stat__label">ミス数</div>
                <div className="completion-stat__value" style={{ color: '#f48771' }}>
                  {mismatchIndexes.length}
                </div>
              </div>
              <div className="completion-stat">
                <div className="completion-stat__label">正解数</div>
                <div className="completion-stat__value" style={{ color: '#4ec9b0' }}>
                  {typedText.length - mismatchIndexes.length}
                </div>
              </div>
            </div>

            {mismatchIndexes.length > 0 && (
              <div className="completion-mistakes">
                <div className="completion-mistakes__title">ミス箇所</div>
                <div className="completion-mistakes__list">
                  {mismatchIndexes.slice(0, 20).map((idx) => (
                    <div key={idx}>{getMistakeContext(typedText, idx)}</div>
                  ))}
                  {mismatchIndexes.length > 20 && (
                    <div style={{ color: '#858585' }}>… 他 {mismatchIndexes.length - 20} 箇所</div>
                  )}
                </div>
              </div>
            )}

            <div className="completion-actions">
              <button
                className="completion-restart"
                onClick={() => {
                  reset('')
                  setShowCompletion(false)
                }}
              >
                もう一度
              </button>
              {hasNext && (
                <button
                  className="completion-next"
                  onClick={() => {
                    setShowCompletion(false)
                    onNavigateNext?.()
                  }}
                >
                  次の教材へ
                  <ChevronRight />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
