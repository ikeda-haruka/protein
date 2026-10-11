# BERRY MILK LINE AI Concierge Bot (Spring Boot 3 + Gemini API)

女性専用プレミアム・インナービューティーブランド「BERRY MILK」専用のLINE公式アカウント向けAIコンシェルジュサーバーです。

---

## 🏗️ システム構成
```
[ LINE公式アカウント（お客様） ]
              │ (Webhook POST /callback)
              ▼
[ Spring Boot 3 (Java 21) ] ── (署名検証・ステートレス処理)
              │
              ├── (質問 + BERRY MILK商品知識プロンプト) ──> [ Google Gemini API ]
              │                                                │ (AI回答生成)
              │ <──────────────────────────────────────────────┘
              ▼
[ LINE Messaging API (/v2/bot/message/reply) ]
              │
              ▼
[ お客様のLINEへ回答返信 🍓✨ ]
```

- **完全ステートレス設計**: データベース（PostgreSQLやRedis）は使用せず、質問と回答はメモリ上で即時処理して破棄されます。
- **薬機法・健康増進法準拠プロンプト**: 効果効能や減量を断定せず、健康食品として適切な表現のみを行う安全設計。
- **高速＆軽量**: Spring Boot 3.3 + Java 21標準の `RestClient` により、外部SDK不要・超軽量で起動1〜2秒。

---

## 🔑 必要な環境変数

| 環境変数名 | 説明 | 取得元 |
| :--- | :--- | :--- |
| `LINE_CHANNEL_SECRET` | LINEチャネルシークレット | [LINE Developers コンソール](https://developers.line.biz/) |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINEチャネルアクセストークン（長期） | LINE Developers > Messaging API設定 |
| `GEMINI_API_KEY` | Google Gemini APIキー | [Google AI Studio](https://aistudio.google.com/) |
| `PORT` | サーバーポート（任意・デフォルト8080） | クラウドサーバー（Render等）が自動設定 |

---

## 🚀 ローカル起動方法

### 1. 環境変数の設定＆起動
PowerShellの場合:
```powershell
$env:LINE_CHANNEL_SECRET="your_line_channel_secret"
$env:LINE_CHANNEL_ACCESS_TOKEN="your_line_channel_access_token"
$env:GEMINI_API_KEY="your_gemini_api_key"

cd line-bot
.\gradlew.bat bootRun
```

### 2. 動作確認（LINEなしで即テスト可能）
ブラウザまたはcurlで下記URLを開くと、Geminiの回答をテストできます：
```
http://localhost:8080/api/test-chat?q=プロテインの美味しい飲み方を教えて
```

---

## 🌐 無料サーバー（Render等）へのデプロイ手順

1. **GitHubにプッシュ**:
   このリポジトリの `line-bot` ディレクトリをそのまま使用できます。
2. **[Render.com](https://render.com/) で新規 Web Service を作成**:
   - `New Web Service` > GitHubリポジトリを選択
   - **Root Directory**: `line-bot`
   - **Runtime**: `Docker`（同梱の `Dockerfile` が自動認識されます）または `Java`
   - **Environment Variables**:
     - `LINE_CHANNEL_SECRET`: LINEのシークレット
     - `LINE_CHANNEL_ACCESS_TOKEN`: LINEのアクセストークン
     - `GEMINI_API_KEY`: GoogleのAPIキー
3. **デプロイ完了後、URLを取得**:
   例: `https://berry-milk-bot.onrender.com`
4. **LINE Developers に Webhook URL を登録**:
   - LINE Developers コンソール > あなたのチャネル > **Messaging API設定**
   - **Webhook URL**: `https://berry-milk-bot.onrender.com/callback`
   - **Webhookの利用**: `オン` に設定
   - 「検証」ボタンを押して `成功` と表示されれば連携完了！
