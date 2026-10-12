# Antigravity 開発ガイドライン & GitHub Issues 自動タスク連携ルール

## 📌 プロジェクト概要
- **リポジトリ**: `ikeda-haruka/protein`
- **本番URL**: `https://protein-sandy.vercel.app/`
- **ブランド**: 株式会社BERRY MILK（SANDYグループ系列）

---

## ⚡ GitHub Issues 自動タスク管理ルール（必須運用フロー）

ユーザーから機能追加、バグ修正、UI改善、コンテンツ追加などのリクエストを受領した際は、**必ず以下のフローに従って GitHub Issues（[https://github.com/ikeda-haruka/protein/issues](https://github.com/ikeda-haruka/protein/issues)）と自動連携**してください。

### 1. タスク着手時（Issue の自動起票）
作業に着手する際、ユーザーのリクエスト内容を整理し、`scripts/task_sync.ps1` を実行して GitHub Issue を起票してください。
```powershell
powershell -ExecutionPolicy Bypass -File "scripts/task_sync.ps1" -Action create -Title "[種別] タスクのタイトル" -Body "## 概要`nリクエストの詳細...`n`n## 対応方針`n..." -Labels @("enhancement", "ui")
```
- 出力される `ISSUE_NUMBER`（例: `#44`）を記録します。

### 2. 実装・検証・コミット
- コードの修正、スタイルシート編集、HTMLファイルの更新を実施。
- CSS括弧整合性・Node.js構文チェックを実施。
- キャッシュバスター（`style.css?v=...`）をインクリメント。
- Git コミットメッセージに `(Closes #<番号>)` または `Fixes #<番号>` を必ず含めてコミット＆プッシュします。
```powershell
git add .
git commit -m "feat(scope): 変更概要 (Closes #44)"
git push origin main
```

### 3. タスク完了時（Issue の自動クローズ）
Vercel本番反映（HTTP 200 / 反映確認）後、`scripts/task_sync.ps1` を実行して該当 Issue をクローズします。
```powershell
powershell -ExecutionPolicy Bypass -File "scripts/task_sync.ps1" -Action close -IssueNumber 44 -Comment "実装・構文検証・Vercel本番環境へのデプロイ反映が完了したためクローズします。"
```

### 4. ユーザーへの完了報告
完了報告時に、クローズした GitHub Issue のリンク（`https://github.com/ikeda-haruka/protein/issues/<番号>`）を明記してください。

---

## 🌟 品質・実装基準
- **言語ルール**: すべて日本語で応答すること。
- **デザイン整合性**: SANDYグループ系列、高級感、いちごミルクの優しいトーン＆マナーを維持すること。
- **キャッシュ管理**: 実機キャッシュを確実に破棄するため、全HTMLファイルの `style.css?v=...` バージョンを更新すること。
- **レスポンシブ**: スマートフォン（375px〜）・タブレット・PCのすべてで崩れのない完全レスポンシブを保証すること。
