# ESCode HANDOVER

最終更新: 2026-05-07  
対象: ESCode Phase1完了 + Phase2 Step3完了

## 1) このプロジェクトの目的

`ESCode` は、TypeScript 学習者向けの「なぞり書き型コード学習エディタ」です。  
核となる体験は「お手本コードをゴースト表示して1文字ずつ打つ」「行ごとの解説を同時に読む」です。

## 2) 現在の状態

- 仕様書は作成済み: `ESCode_仕様書_v0.2 (1).md`
- 実装の土台を作成済み: `escode-app/`（React + TypeScript + Vite + Monaco）
- Phase1の実装完了（下記チェックリスト参照）
- UIをVSCode Dark+スタイルに全面刷新済み
- Phase2 Step1の実装完了（プレビューMVP + I/O抽象化）
- Phase2 Step2の主要実装完了（File API接続 + テンプレ動的ロード）
- Phase2 Step3の実装完了（教材ナビゲーション + UX強化）
- 保存は現在 `FileApiAdapter`（Vite API経由）を既定利用

### Phase1 実装チェックリスト

| 機能 | 状態 | 備考 |
|------|------|------|
| 3カラムレイアウト（アクティビティバー込み） | ✅ | `App.tsx` / `App.css` |
| VSCode Dark+デザイン全面刷新 | ✅ | タイトルバー・タブバー・ステータスバー |
| VSCode風エクスプローラー | ✅ | TEMPLATES/WORKSPACE 折りたたみ対応 |
| ゴーストモード 1文字判定 | ✅ | `useTypingJudge.ts` |
| ミスタイプ赤ハイライト | ✅ | Monaco decorations API |
| ゴーストレイヤー透過表示 | ✅ | CSSで front layer を透明化 |
| カーソル行ハイライト | ✅ | `view-overlays` を保護する CSS 設計 |
| プログレスバー・精度リアルタイム表示 | ✅ | エディタ上部バー |
| 完了オーバーレイ | ✅ | 正答率・ミス箇所一覧・もう一度ボタン |
| 解説ビュー行同期 | ✅ | `ExplainView.tsx` + インラインコードレンダリング |
| 自動保存（1秒デバウンス） | ✅ | `useAutoSave.ts`（保存先: localStorage） |
| templates/ 動的スキャン | ✅ | `/api/templates` で動的取得 |
| explain.json fetch 読み込み | ✅ | `/api/template?setName=...` で取得 |
| Node.js fs による実ファイルI/O | ✅ | Vite middleware API経由で `workspace/` に保存 |

### Phase2 Step1 実装チェックリスト

| 機能 | 状態 | 備考 |
|------|------|------|
| 右下プレビュー実動作化 | ✅ | `PreviewPane.tsx` を iframe srcdoc 実行へ変更 |
| プレビューのリアルタイム連動 | ✅ | `App.tsx` + `GhostEditor.tsx` で編集中の値を連携 |
| 実行エラーの可視化 | ✅ | postMessage 受信でプレビューパネルに表示 |
| サンドボックス実行 | ✅ | iframe `sandbox=\"allow-scripts\"` |
| 保存処理の抽象化 | ✅ | `src/storage` 追加、`fileManager.ts` は storage経由 |
| LocalStorageAdapter 実装 | ✅ | 既存保存挙動を維持 |
| FileApiAdapter 境界作成 | ✅ | 実接続済み（`/api/workspace`） |
| build / lint 通過 | ✅ | `npm run build` / `npm run lint` 成功 |

### Phase2 Step2 実装チェックリスト

| 機能 | 状態 | 備考 |
|------|------|------|
| Vite側ファイルI/O API実装 | ✅ | `vite.config.ts` に `/api/workspace` |
| `FileApiAdapter` 実接続 | ✅ | `create/read/write` を fetch で接続 |
| templates動的ロード | ✅ | `/api/templates` でセット一覧を取得 |
| template/explain動的ロード | ✅ | `/api/template` で `code.ts` + `explain.json` 取得 |
| ペイント教材 step1-5 追加 | ✅ | `templates/paint-step1..5` 追加 |
| ツリー/タブの教材名可視化 | ✅ | `setName/code.ts` 形式で表示 |
| build / lint 通過 | ✅ | 最新変更で再確認済み |

### Phase2 Step3 実装チェックリスト

| 機能 | 状態 | 備考 |
|------|------|------|
| ステップナビゲーションバー | ✅ | 前へ/次へ + ドットプログレス + タイトル表示 |
| 教材シリーズ自動グループ化 | ✅ | `{prefix}-step{N}` パターンを自動検出 |
| 教材イントロカード | ✅ | Step badge + 学習概要 + スタートボタン |
| 完了時「次の教材へ」ボタン | ✅ | 完了オーバーレイに次ステップ誘導を追加 |
| ステータスバーStep進捗表示 | ✅ | `Step X / Y` + 緑ドットインジケーター |
| 教材メタデータ管理 | ✅ | `LESSON_META` でタイトル・説明を集約 |
| プログレスバーグラデーション | ✅ | 精度による色変化 + グロー効果 |
| アニメーション追加 | ✅ | イントロカードfadeIn + 完了カードscaleIn |
| build / lint 通過 | ✅ | 最新変更で再確認済み |

## 3) Phase1 で作るもの（最小実装）

- 3カラムレイアウト
  - 左: フォルダブラウザ（`templates/` / `workspace/`）
  - 中: Monaco エディタ（主にゴーストモード）
  - 右上: 行連動の解説ビュー（`explain.json`）
- ゴーストモード
  - 1文字判定で進行
  - ミスタイプ時は赤表示して進行継続（ブロックしない）
  - 完了時に正答率 + ミス箇所表示
- 1秒デバウンスの自動保存（`workspace/` 配下）
- サンプル教材 `templates/canvas-basics` を同梱
- 右下プレビュー領域はプレースホルダーのみ

## 4) 実装しないもの（Phase1対象外）

- リアルタイムプレビュー実行（Phase2）
- explain.json のAI自動生成（Phase2以降）
- 多言語対応（Phase3以降）
- コミュニティ連携（Phase3以降）

## 5) 重要な設計ルール（実装時に崩さない）

- **ミスしても止めない**: 学習の流れを優先
- **お手本は読み取り専用**: `templates/` は破壊しない
- **解説は行番号同期**: カーソル移動で即時更新
- **ESCode自身が教材になる設計**: TypeScript中心で実装

## 6) 推奨ディレクトリ構成（仕様準拠）

```text
ESCode/
├── src/
├── templates/
├── workspace/
├── package.json
└── README.md
```

詳細構成は仕様書「8. ファイル構成」に準拠。

## 7) 次担当者向けの最短着手手順

1. `React + TypeScript + Vite` の初期プロジェクト作成  
2. `@monaco-editor/react` 導入  
3. 3カラム固定レイアウト作成（見た目より動作優先）  
4. `useTypingJudge.ts` と `useAutoSave.ts` の骨組みを先に作成  
5. `canvas-basics` の教材1セットで E2E 的に動作確認  

## 8) 受け入れ判定（Phase1 完了条件）

- お手本選択でゴーストモード起動
- 1文字判定が動作（Enter / Tab / Space / Backspace含む）
- ミスは赤表示で残り、最後まで進める
- 行に応じて解説が更新される
- 自動保存される
- 完了画面で正答率とミス一覧が見える

## 9) 将来の技術方針（Cursorで作業時の参考）

### ファイルI/O（次の優先課題）
- `templates/` ディレクトリを fetch または Vite の `import.meta.glob` で動的スキャン
- `explain.json` を `fetch('/templates/{setName}/explain.json')` で読み込む
- `vite.config.ts` で `public/` から `templates/` を参照できるように設定
- `storage/index.ts` のモード切替を環境変数依存から実接続判定へ拡張
- `FileApiAdapter` に read/write/create を実装し、`workspaceStorage` の file モード動作確認

### Electron化（Phase3候補）
- 使用ライブラリ: `electron-vite`（既存Vite+Reactをほぼそのまま流用可能）
- `main.ts`（Electronメインプロセス）でNode.js fsによる実ファイルI/O
- `localStorage` → `fs.readFileSync` / `fs.writeFileSync` に差し替え
- 配布形式: Linux向け `.deb` / `AppImage`
- 現在の開発環境: ChromebookのLinux環境（Crostini）

### Monaco Editor 設計上の注意
- `monaco.editor.setTheme()` はグローバル適用（全エディタに影響）
- ゴースト層（背景）とフロント層（入力）で別テーマ名を定義して順番制御
- フロント層の背景透明化はCSSの `background-color: transparent !important` で対応
- `view-overlays` を透明化するとカーソル行ハイライトが消えるので注意

## 10) 次のステップ（Phase2 Step4以降）

1. 通常編集モードの学習支援機能強化  
2. 教材メタデータの外部ファイル化（`lesson.json`）  
3. プレビュー実行時のTS変換を強化（変換失敗時メッセージを明確化）  
4. 受け入れテスト項目を `HANDOVER` に追記して再検証  
5. AI連携による `explain.json` 自動生成  

### 10.1 実装済みの改善（Step3で完了）

- ✅ **Stepナビゲーション**: エディタ上部にナビバー追加（前へ/次へ + ドットプログレス）
- ✅ **教材進捗の可視化**: ステータスバーに `Step X / Y` 表示 + ナビバーにカウンター
- ✅ **教材説明カード**: イントロカードで各stepの学習内容を表示
- ✅ **完了時の次ステップ誘導**: 完了オーバーレイに「次の教材へ」ボタン追加

### 10.2 こうしたほうが良さそう（次の改善候補）

- **教材メタデータ外部化**: 現在は `App.tsx` 内の `LESSON_META` にハードコード → `templates/{setName}/lesson.json` に外出し  
- **実行プレビューの共通安定化**: 現在は簡易TS変換のため、より汎用な変換ロジックを検討する  
- **学習完了のシリーズ進捗保存**: どのステップまで完了したかを永続化  
- **キーボードショートカット**: `Alt+←/→` でステップ間移動  

## 11) リスクと注意点

- Monaco の decoration 設計を先延ばしすると後半で破綻しやすい ← **今回の実装で解決済み**
- 入力イベント設計（IME/特殊キー）の扱いは初期に方針固定が必要
- 自動保存の書き込み頻度を誤ると体験が重くなる
- 2枚重ねMonacoアーキテクチャ: `setTheme()` がグローバルなので注意
- `localStorage` のデータはブラウザ依存・揮発性 → Electron化時に移行必要
- 現在のプレビューは `canvas-basics` 向けの簡易変換前提。汎用TS実行ではない
- Vite middleware API依存のため、本番配布時はElectron側I/Oに移行設計が必要
- プレビューは現状 `canvas-basics` 中心の簡易変換。paint-step系の完全汎用実行は強化余地あり

## 12) 更新ログ

- 2026-05-07: `HANDOVER.md` 初版作成（引き継ぎ・完了条件・着手手順を明文化）
- 2026-05-07: `escode-app/` を新規実装し、Phase1の最小動作を構築
- 2026-05-07: UIをVSCode Dark+スタイルに全面刷新
  - `index.css` にVSCodeカラートークン定義
  - `App.css` にアクティビティバー・サイドバー・タブバー・ステータスバー・完了オーバーレイのスタイル追加
  - `App.tsx` にアクティビティバー・タイトルバー構造を追加
  - `FolderBrowser.tsx` をVSCode風エクスプローラーに刷新（TEMPLATES/WORKSPACE折りたたみ）
  - `GhostEditor.tsx` をタブバー・プログレスバー・decorations実装・完了オーバーレイ付きに刷新
  - `ExplainView.tsx` をパネルスタイルに刷新（インラインコードレンダリング対応）
  - `PreviewPane.tsx` をVSCodeスタイルのプレースホルダーに刷新
- 2026-05-07: Electron/Linuxデスクトップアプリ化をPhase3候補として確定
- 2026-05-07: Phase2 Step1を実装
  - `PreviewPane.tsx` を iframe srcdoc による実行プレビューへ変更
  - `App.tsx` と `GhostEditor.tsx` で編集内容のリアルタイム受け渡しを追加
  - 実行エラーをプレビューパネルへ表示
  - `src/storage/` を新設し `WorkspaceStorage` / `LocalStorageAdapter` / `FileApiAdapter(スタブ)` を追加
  - `fileManager.ts` を localStorage直呼びから storage経由へ移行
  - `npm run build` / `npm run lint` 通過確認
- 2026-05-07: Phase2 Step2を実装
  - `vite.config.ts` に `/api/workspace` / `/api/templates` / `/api/template` APIを追加
  - `FileApiAdapter` を実接続し、保存先を `workspace/{setName}/code.ts` に統一
  - `fileManager.ts` を非同期ローダー化し、テンプレ/解説のハードコードを撤廃
  - `App.tsx` を非同期ロードフローに更新（教材一覧→選択→データ読込）
  - `templates/paint-step1..5` を追加（段階的お絵かき教材）
  - `FolderBrowser` / タブ表示を `setName/code.ts` 形式に改善
  - `npm run build` / `npm run lint` 通過確認
- 2026-05-07: プレビュー共通化を実施
  - `PreviewPane.tsx` の `canvas-basics` 限定判定を解除
  - `paint-step1..5` を含むCanvas教材で同一プレビュー実行が可能に
  - `npm run build` / `npm run lint` 通過確認
- 2026-05-07: Phase2 Step3を実装（教材ナビゲーション＆UX強化）
  - `App.tsx` に教材シリーズ自動グループ化・ナビゲーション関数・教材メタデータ管理を追加
  - `GhostEditor.tsx` にステップナビバー・イントロカード・完了時「次の教材へ」ボタンを追加
  - `App.css` にナビバー・ドットプログレス・イントロカード・改良完了オーバーレイのスタイル追加
  - ステータスバーに `Step X / Y` + 緑ドットインジケーター表示を追加
  - プログレスバーをグラデーション＋グロー効果に改善
  - イントロ・完了オーバーレイにアニメーション（fadeIn/scaleIn）を追加
  - `npm run build` / `npm run lint` 通過確認
