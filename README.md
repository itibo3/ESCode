# ESCode ⌨️

**TypeScript をなぞって学ぶ、IDE ライクなコード学習エディタ**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-4.7-0078D4?style=flat-square)](https://microsoft.github.io/monaco-editor/)

---

## ✨ 概要

ESCode は、TypeScript 学習者向けの **「なぞり書き型」コード学習エディタ**です。

お手本コードをゴーストとして背景に表示し、1 文字ずつ打ち込みながらコードを体で覚えることができます。
Visual Studio Code にインスパイアされたダークテーマ UI で、本格的な IDE の操作感を体験しながら学習できます。

---

## 🎮 主な機能

### 👻 ゴーストモード
- お手本コードを半透明で表示し、その上から 1 文字ずつタイピング
- ミスタイプはリアルタイムで赤くハイライト（ブロックなしで進行可能）
- 完了時に **正答率・ミス箇所一覧** を表示

### 📖 行連動の解説パネル
- カーソル行に対応した解説を右パネルにリアルタイム表示
- `コードスニペット` のインラインレンダリング対応

### ▶️ ライブプレビュー
- 編集中のコードを **iframe サンドボックス**でリアルタイム実行
- Canvas API のコードがそのまま動く

### 📚 ステップナビゲーション
- シリーズ教材を「前へ / 次へ」でスムーズに移動
- ドットプログレスで現在位置を可視化
- 完了時に次の教材へ自動誘導

### 💾 自動保存
- 1 秒のデバウンスで `workspace/` に自動保存
- ページをリロードしても途中から再開可能

### 🖥️ VSCode ライク UI
- アクティビティバー・サイドバー・タブバー・ステータスバー
- VSCode Dark+ テーマの配色
- ファイルツリー（TEMPLATES / WORKSPACE 折りたたみ対応）

---

## 📦 同梱教材

### 🖌️ ミニペイントシリーズ（5 ステップ）

Canvas API を使ったお絵かきアプリを段階的に実装する教材です。

| Step | タイトル | 学習内容 |
|------|----------|----------|
| 1 | 線を引く | `mousedown` / `mousemove` / Canvas `beginPath` |
| 2 | 色を選ぶ | `<input type="color">` / `strokeStyle` |
| 3 | 太さを変える | `<input type="range">` / `lineWidth` / `lineCap` |
| 4 | 消しゴム | boolean 状態管理 / 条件分岐 |
| 5 | クリア＆完成 | `clearRect` / 全機能統合 |

### 🎨 Canvas 基礎
図形描画・色設定などの Canvas API 入門教材

---

## 🚀 はじめ方

### 必要なもの

- Node.js 18+
- npm 9+

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/itibo3/ESCode.git
cd ESCode/escode-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開くと ESCode が起動します。

---

## 📁 ディレクトリ構成

```
ESCode/
├── escode-app/                 # アプリ本体
│   ├── src/
│   │   ├── components/
│   │   │   ├── GhostEditor.tsx     # メインエディタ（ゴーストモード）
│   │   │   ├── FolderBrowser.tsx   # ファイルツリー
│   │   │   ├── ExplainView.tsx     # 解説パネル
│   │   │   └── PreviewPane.tsx     # ライブプレビュー
│   │   ├── hooks/
│   │   │   ├── useTypingJudge.ts   # 1文字判定ロジック
│   │   │   └── useAutoSave.ts      # 自動保存
│   │   ├── storage/                # I/O 抽象化レイヤー
│   │   └── utils/
│   │       └── fileManager.ts      # ファイル操作
│   ├── templates/                  # 同梱教材
│   │   ├── canvas-basics/
│   │   └── paint-step1〜5/
│   └── vite.config.ts              # Vite + File API サーバー設定
├── HANDOVER.md                 # 設計ドキュメント
└── Roadmap.md                  # ロードマップ
```

---

## 🛠️ 技術スタック

| 技術 | 用途 |
|------|------|
| React 18 | UI フレームワーク |
| TypeScript 5.5 | 型安全な実装 |
| Vite 5 | 開発サーバー + ビルド + File API |
| Monaco Editor | コードエディタ本体 |
| CSS Variables | VSCode 風デザインシステム |

---

## 📝 教材の追加方法

`escode-app/templates/` 以下に新しいフォルダを作成し、2 つのファイルを置くだけです。

```
templates/
└── my-lesson/
    ├── code.ts       # お手本コード
    └── explain.json  # 行ごとの解説
```

`explain.json` の形式：

```json
{
  "name": "教材名",
  "1": "1行目の解説",
  "2": "2行目の解説"
}
```

サーバーが `templates/` を動的にスキャンするため、**再起動なしで即座に反映**されます。

---

## 🗺️ ロードマップ

- [x] Phase 1: ゴースト学習 MVP
- [x] Phase 2: ライブプレビュー・ファイル I/O・ステップナビゲーション
- [ ] Phase 3: Electron によるデスクトップアプリ化
- [ ] Phase 3: AI による解説自動生成
- [ ] Phase 3: 教材の共有・配布基盤

詳細は [Roadmap.md](./Roadmap.md) を参照してください。

---

## 📄 ライセンス

MIT
