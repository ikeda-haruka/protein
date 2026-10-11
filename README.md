# 🍓 BERRY MILK PROTEIN（ベリーミルク プロテイン）

女性向けビューティープロテインのポートフォリオ実績用ランディングページ（LP）です。  
参考サイトの洗練されたレイアウト構成を踏襲しつつ、ターゲット層（健康と美を求める女性）に合わせた「イチゴミルク」をテーマにしたカラーパレット・タイポグラフィ・ビジュアル設計を実現しています。

---

## 🎀 サイト概要 & コンセプト

- **ブランド名**: BERRY MILK PROTEIN（ベリーミルク プロテイン）
- **フレーバー**: 福岡県産あまおう苺果汁使用・完熟とろける苺ミルク味
- **キャッチコピー**: 「キレイと健康、どっちも妥協しない。」
- **3大ピラー**: 
  - **BODY（引き締め）**: ソイ＆ホエイ Wプロテイン 20g
  - **BEAUTY（美容ケア）**: 低分子コラーゲン 1,500mg・ヒアルロン酸・セラミド・ビタミンC
  - **RECOVERY（腸活リカバリー）**: 植物性ナノ乳酸菌 1,000億個・水溶性食物繊維

---

## 🎨 カラーパレット（Strawberry Milk Design System）

- **ミルキーペーパー**: `#FFF7F9`（ベース背景・温かみのある清潔感）
- **完熟ストロベリー**: `#FF6584`（ヒーロー背景・アクセントカラー）
- **ディープベリー**: `#DE3C62`（ボタン・コンバージョン・フォーカス）
- **練乳クリーム**: `#FDE6EC`（セクション背景・マーキー帯）
- **ビターココア**: `#2C1E23`（可読性の高いコントラスト文字色）

---

## 🚀 主な機能・UI/UX ギミック

1. **固定ヘッダー & スムーススクロール**
   - スクロール開始時に磨りガラス背景（Backdrop Filter Blur）へ滑らかに遷移
   - アンカーリンククリック時に固定ヘッダーの高さを考慮した自動オフセットスクロール
2. **ヒーローセクション**
   - 巨大な英字タイポグラフィのウォーターマーク
   - 浮遊するプロテインパウチパッケージ（ドロップシャドウ & アニメーション）
   - 3大ピラー（BODY × BEAUTY × RECOVERY）
3. **無限ループインフォメーション帯（Marquee Band）**
   - CSSキーフレームによる軽快な横スクロールバナー
4. **ステートメント見出し（Scroll Text Lighting）**
   - スクロール進行度（進捗率）に応じて文字が1文字ずつ点灯するインタラクティブ演出
5. **3連特徴カード（Tri Cards）**
   - ホバー時に背景の巨大英字がゆっくりと動くパララックス効果
   - 成分スペック一覧
6. **商品詳細 & スペックグリッド**
   - タンパク質、コラーゲン、乳酸菌、ビタミン等の視覚的スペック表示
   - 定期購入CTA
7. **ラインナップカード**
   - 目的別4製品（プロテイン、アミノ酸、スムージー、ナイトプロテイン）のカード
   - マウスホバーで商品画像が浮き上がるリッチなインタラクション
8. **アコーディオン FAQ**
   - `<details>` / `<summary>` によるアクセシブルで滑らかな開閉アニメーション
9. **スマホ専用 追従ボトムCTA**
   - 画面下部に固定配置。ヒーロー通過後にフェードイン、注文セクション到達時に自動非表示

---

## 🛠 技術スタック

- **Markup**: セマンティック HTML5
- **Style**: モダン CSS3（CSS Custom Properties, Grid, Flexbox, Clamp, Backdrop-filter）
- **Script**: Vanilla JavaScript（IntersectionObserver, Scroll Event）
- **Asset**: WebP / 高解像度AI画像（プロダクト・ライフスタイル・ラインナップ） / SVGベクターロゴ
- **Deploy**: Vercel
- **Task Management**: GitHub Issues

---

## 📦 ディレクトリ構成

```text
protein/
├── index.html            # メインLP
├── style.css             # イチゴミルクテーマCSS
├── main.js               # スクロール演出・UI制御JS
├── vercel.json           # Vercelデプロイ・キャッシュヘッダー設定
├── package.json          # プロジェクト情報
├── images/               # 画像・SVGアセット
│   ├── logo.svg
│   ├── logo-white.svg
│   ├── mark.svg
│   ├── favicon.svg
│   ├── berry-protein-hero.webp
│   ├── berry-protein-lifestyle.webp
│   ├── strawberry-shake.webp
│   ├── lineup-amino.webp
│   ├── lineup-smoothie.webp
│   └── lineup-night.webp
└── README.md
```

---

© BERRY MILK PROTEIN. Designed for Portfolio Demonstration.
