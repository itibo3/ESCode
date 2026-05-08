import { useEffect, useMemo, useState } from 'react'

type PreviewPaneProps = {
  setName: string | null
  code: string
}

const stripTypeScriptSyntax = (source: string): string =>
  source
    .replace(/\s+as\s+[A-Za-z0-9_.$<>[\]\s]+/g, '')
    .replace(/:\s*[A-Za-z0-9_.$<>[\]\s]+(?=[,)=;])/g, '')

const escapeScriptCloseTag = (source: string): string =>
  source.replace(/<\/script>/gi, '<\\/script>')

const buildCanvasPreviewDoc = (code: string): string => {
  const runnableCode = escapeScriptCloseTag(stripTypeScriptSyntax(code))

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body { margin: 0; padding: 0; background: #0f172a; color: #e2e8f0; font-family: sans-serif; }
      .wrap { padding: 10px; }
      canvas { border: 1px solid #334155; background: #0b1220; width: 100%; max-width: 260px; height: auto; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <canvas id="canvas" width="320" height="180"></canvas>
    </div>
    <script>
      try {
        ${runnableCode}
        window.parent.postMessage({ type: 'escode-preview-ok' }, '*');
      } catch (error) {
        window.parent.postMessage(
          { type: 'escode-preview-error', message: String(error && error.message ? error.message : error) },
          '*'
        );
      }
    </script>
  </body>
</html>`
}

export const PreviewPane = ({ setName, code }: PreviewPaneProps) => {
  const isSupported = Boolean(setName)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const srcDoc = useMemo(
    () => (isSupported ? buildCanvasPreviewDoc(code) : ''),
    [code, isSupported],
  )

  useEffect(() => {
    setRuntimeError(null)
  }, [srcDoc])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data
      if (!payload || typeof payload !== 'object') return
      if (payload.type === 'escode-preview-ok') {
        setRuntimeError(null)
      }
      if (payload.type === 'escode-preview-error') {
        setRuntimeError(String(payload.message ?? 'Unknown preview error'))
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <span className="panel-header__icon">▶</span>
        プレビュー
      </div>
      <div className="preview-body">
        {isSupported ? (
          <>
            <iframe
              key={srcDoc}
              title="ESCode Preview"
              className="preview-frame"
              sandbox="allow-scripts"
              srcDoc={srcDoc}
            />
            {runtimeError ? (
              <div className="preview-error">実行エラー: {runtimeError}</div>
            ) : null}
          </>
        ) : (
          <>
            <div className="preview-icon">🖥️</div>
            <div className="preview-label">教材を選ぶとプレビューが表示されるよ</div>
            <div className="preview-badge">Canvas教材に対応</div>
          </>
        )}
      </div>
    </div>
  )
}
