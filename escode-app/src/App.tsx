import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { ExplainView } from './components/ExplainView'
import { FolderBrowser } from './components/FolderBrowser'
import { GhostEditor } from './components/GhostEditor'
import { PreviewPane } from './components/PreviewPane'
import type { FileNode, LearningSet } from './types'
import {
  createWorkspaceFileIfMissing,
  getLearningSet,
  listTemplateSetNames,
  listTree,
  readWorkspaceFile,
  saveWorkspaceFile,
} from './utils/fileManager'

// SVGアイコン
const IconFiles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

// 教材メタデータ（将来的にはJSONに外出し可能）
const LESSON_META: Record<string, { title: string; description: string }> = {
  'canvas-basics': {
    title: 'Canvas 基礎',
    description: 'Canvas APIの基本を学ぼう。図形の描画と色の設定を体験します。',
  },
  'paint-step1': {
    title: 'Step 1: 線を引く',
    description: 'mouseイベントとCanvas APIで自由に線を引いてみよう。beginPath / lineTo / stroke を使います。',
  },
  'paint-step2': {
    title: 'Step 2: 色を選ぶ',
    description: '<input type="color"> でユーザーが色を選べるようにしよう。strokeStyle を動的に切り替えます。',
  },
  'paint-step3': {
    title: 'Step 3: 太さを変える',
    description: '<input type="range"> で線の太さを調整しよう。lineWidth と lineCap を学びます。',
  },
  'paint-step4': {
    title: 'Step 4: 消しゴム',
    description: 'boolean状態管理でモード切替を実装。消しゴムの仕組み（白で上書き）を学びます。',
  },
  'paint-step5': {
    title: 'Step 5: クリア＆完成',
    description: 'clearRect でキャンバスリセットを実装して、お絵かきアプリを完成させよう！',
  },
}

// 教材シリーズをグループ化する
const getSeriesInfo = (setName: string, allSetNames: string[]) => {
  const match = setName.match(/^(.+?)-step(\d+)$/)
  if (!match) return null

  const prefix = match[1]
  const currentStep = parseInt(match[2], 10)
  const stepsInSeries = allSetNames
    .filter((name) => name.startsWith(`${prefix}-step`))
    .sort()
  const totalSteps = stepsInSeries.length
  const currentIndex = stepsInSeries.indexOf(setName)

  return {
    prefix,
    currentStep,
    totalSteps,
    currentIndex,
    stepsInSeries,
    prevSetName: currentIndex > 0 ? stepsInSeries[currentIndex - 1] : null,
    nextSetName: currentIndex < stepsInSeries.length - 1 ? stepsInSeries[currentIndex + 1] : null,
  }
}

function App() {
  const [selected, setSelected] = useState<FileNode | null>(null)
  const [setData, setSetData] = useState<LearningSet | null>(null)
  const [workspaceValue, setWorkspaceValue] = useState('')
  const [editorValue, setEditorValue] = useState('')
  const [currentLine, setCurrentLine] = useState(1)
  const [activeView, setActiveView] = useState<'explorer'>('explorer')
  const [tree, setTree] = useState<FileNode[]>([])
  const [allSetNames, setAllSetNames] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    const loadTree = async () => {
      const setNames = await listTemplateSetNames()
      if (cancelled) return
      setAllSetNames(setNames)
      const nodes = listTree(setNames)
      setTree(nodes)
      const firstTemplate = nodes.find((node) => node.kind === 'template')
      if (firstTemplate) setSelected(firstTemplate)
    }

    void loadTree()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selected) return

    let cancelled = false

    const load = async () => {
      const data = await getLearningSet(selected.setName)
      setSetData(data)
      await createWorkspaceFileIfMissing(selected.setName)
      const initial = await readWorkspaceFile(selected.setName)
      if (cancelled) return
      setWorkspaceValue(initial)
      setEditorValue(initial)
      setCurrentLine(1)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [selected])

  const handleSave = async (value: string) => {
    if (!selected) return
    await saveWorkspaceFile(selected.setName, value)
    setWorkspaceValue(value)
    setEditorValue(value)
  }

  const mode = selected?.kind === 'template' ? 'ghost' : 'normal'

  // シリーズ情報
  const seriesInfo = useMemo(
    () => (selected ? getSeriesInfo(selected.setName, allSetNames) : null),
    [selected, allSetNames],
  )

  // 教材メタ
  const lessonMeta = selected ? LESSON_META[selected.setName] : null

  // ナビゲーション関数
  const navigateToSet = useCallback(
    (setName: string) => {
      const node = tree.find((n) => n.kind === 'template' && n.setName === setName)
      if (node) setSelected(node)
    },
    [tree],
  )

  const handlePrev = useCallback(() => {
    if (seriesInfo?.prevSetName) navigateToSet(seriesInfo.prevSetName)
  }, [seriesInfo, navigateToSet])

  const handleNext = useCallback(() => {
    if (seriesInfo?.nextSetName) navigateToSet(seriesInfo.nextSetName)
  }, [seriesInfo, navigateToSet])

  return (
    <div className="workbench">
      {/* タイトルバー */}
      <div className="titlebar">
        <span className="titlebar__app">ESCode</span>
        {selected && (
          <span className="titlebar__title">— {selected.label}</span>
        )}
      </div>

      {/* メイン */}
      <div className="workbench-body">
        {/* アクティビティバー */}
        <div className="activitybar">
          <button
            className={`activitybar__icon ${activeView === 'explorer' ? 'activitybar__icon--active' : ''}`}
            title="エクスプローラー"
            onClick={() => setActiveView('explorer')}
          >
            <IconFiles />
          </button>
          <div className="activitybar__spacer" />
          <button className="activitybar__icon" title="設定">
            <IconSettings />
          </button>
        </div>

        {/* サイドバー */}
        <div className="sidebar">
          <div className="sidebar__header">エクスプローラー</div>
          <div className="sidebar__body">
            <FolderBrowser nodes={tree} selected={selected} onSelect={setSelected} />
          </div>
        </div>

        {/* エディタエリア */}
        <div className="editor-area">
          {selected && setData ? (
            <GhostEditor
              key={selected.id}
              mode={mode}
              fileName={`${selected.setName}/${selected.label.split('/').pop() ?? selected.label}`}
              templateCode={setData.code}
              initialValue={workspaceValue}
              onLineChange={setCurrentLine}
              onSave={handleSave}
              onValueChange={setEditorValue}
              lessonTitle={lessonMeta?.title ?? selected.setName}
              lessonDescription={lessonMeta?.description ?? null}
              seriesInfo={seriesInfo}
              onNavigatePrev={handlePrev}
              onNavigateNext={handleNext}
            />
          ) : (
            <div className="editor-empty">
              <div className="editor-empty__logo">⌨️</div>
              <div className="editor-empty__title">ESCode</div>
              <div className="editor-empty__hint">左のエクスプローラーからお手本を選んでね</div>
            </div>
          )}
        </div>

        {/* 右パネル */}
        <div className="right-panel">
          <ExplainView
            currentLine={currentLine}
            explanations={setData?.explain ?? {}}
            title={lessonMeta?.title ?? setData?.name ?? '未選択'}
          />
          <PreviewPane
            setName={selected?.setName ?? null}
            code={editorValue}
          />
        </div>
      </div>

      {/* ステータスバー */}
      <div className="statusbar">
        <div className="statusbar__item">
          <span>⎇</span>
          <span>main</span>
        </div>
        <div className="statusbar__divider" />
        {selected && (
          <>
            <div className={`statusbar__item ${mode === 'ghost' ? 'statusbar__item--ghost' : ''}`}>
              {mode === 'ghost' ? '👻 Ghost Mode' : '✏️ Normal Mode'}
            </div>
            <div className="statusbar__divider" />
          </>
        )}
        {seriesInfo && (
          <>
            <div className="statusbar__item statusbar__item--series">
              <span className="statusbar__series-dot" />
              Step {seriesInfo.currentStep} / {seriesInfo.totalSteps}
            </div>
            <div className="statusbar__divider" />
          </>
        )}
        <div className="statusbar__spacer" />
        {selected && (
          <>
            <div className="statusbar__item">
              <span>行 {currentLine}</span>
            </div>
            <div className="statusbar__divider" />
          </>
        )}
        <div className="statusbar__item">TypeScript</div>
        <div className="statusbar__divider" />
        <div className="statusbar__item">UTF-8</div>
      </div>
    </div>
  )
}

export default App
