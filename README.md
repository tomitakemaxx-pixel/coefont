# CoeFont通訳 参加ガイド（タイ語）

タイ側の出席者（大臣ご臨席の会議を想定）にお渡しする、AI同時通訳「CoeFont通訳」の**参加者向け操作ガイド**一式です。
ゲスト側の操作だけを扱います（ホスト側＝会議の作成・通訳の開始は対象外）。

作成元の指示書：`docs/20260919_指示書_CoeFont通訳_参加者ガイド.md`

## 成果物（`output/`）

| ファイル | 用途 |
|---|---|
| `CoeFont_Guide_TH_Minister_v1.pdf` | **配布用**。A4縦2ページ。タイ語（大）＋英語（小）。大臣・タイ側出席者用 |
| `CoeFont_Guide_TH_Minister_v1_p1.png` / `_p2.png` | 同内容の画像（幅1240px）。スマートフォンやチャットでの共有用 |
| `CoeFont_Guide_TH-JA_internal_v1.pdf` | **日本側控え**。同じ内容に日本語を併記（A4縦3ページ） |
| `thai_text_for_review.txt` | タイ語・英語・日本語の対訳一覧。タイ語チェック依頼用 |
| `build_report.json` | ビルド結果（使用した画面コピー、各ページの余白） |

## ビルドと検品

```bash
npm install                      # 初回のみ（playwright / qrcode）
npm run build                    # HTML → PDF・PNG・対訳ファイルを生成
npm run build -- --qr "https://…"  # URLが決まったらQRコードも埋め込む
npm run check                    # 検品（フォント埋め込み・改行・ページ数など14項目）
```

- 文面・レイアウトの修正は `src/guide.html` だけを直して再ビルドします。対訳ファイルは画面表示から自動生成されるので、本文と食い違いません。
- PDF生成は Playwright（Chromium）の `page.pdf()` です。タイ語は単語の間に空白がないため、行の折り返しをブラウザに任せる必要があります（WeasyPrint等は不可）。
- フォントは Noto Sans Thai / Noto Sans / Noto Sans JP（いずれもOFL）を `assets/fonts/` に同梱し、PDFに埋め込んでいます。

### 画面コピーの差し替え

`input/screenshots/` に決められた名前でPNGを置いて再ビルドするだけで、説明用イラストと入れ替わります。
詳しくは `input/screenshots/README.md` を参照してください。

## 構成

```
├── src/guide.html        ← 本文・レイアウト（ここだけ直せばよい）
├── src/enhance.js        ← 画面コピー差し替え／番号丸／QR／タイ語の禁則処理
├── scripts/build.mjs     ← PDF・PNG・対訳ファイルの生成
├── scripts/check.mjs     ← 検品（14項目）
├── assets/fonts/         ← Noto Sans Thai / Noto Sans / Noto Sans JP
├── input/screenshots/    ← 実画面のスクリーンショット置き場（空でもビルド可）
├── docs/                 ← 指示書
└── output/               ← 生成物
```

## 現状の注意点（配布前に確認すること）

1. **図は説明用のイラストです。** 実画面のスクリーンショットが未入手のため、操作位置と画面構成を示す図を収録しています。図には「ภาพประกอบ（説明図）」と明示し、本文にも「実画面と異なる場合がある」旨のタイ語注記を入れてあります。実画面が撮れ次第、差し替えてください。
2. **ボタン名・ラベルは未確定です。** 画面に写っていない表示名は創作していません（図中は `Passcode` などの一般的な語のみ）。実画面の表示に合わせて本文を直してください。
3. **タイ語は要確認です。** 英語原文からの翻訳です。`output/thai_text_for_review.txt` を現地スタッフに確認してもらってください。
4. **CoeFont社の英語FAQ（`coefont.cloud/faq/en`）はタイ語を「追加予定」と記載したままです。** 一方、同社の2026年のリリースではタイ語を含む多言語対応が公表されています。当日のタイ語選択可否は、事前に同社（北沢様）へご確認ください。
5. URL・パスコード・QRは空欄です（当日ホストが発行）。
