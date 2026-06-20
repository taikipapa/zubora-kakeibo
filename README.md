# ズボラ家計簿

ズボラ家計簿は、日々の入出金を手早く記録するための家計簿アプリです。

## リリース前チェック

- プライバシーポリシー: `docs/privacy-policy.html` に作成済み。公開URLを用意して Google Play Console / App Store Connect に登録する。
- AdMob本番ID: Android 本番IDは設定済み。iOS 本番IDは未設定（差し替え待ち）。
- 現在の広告ID状態:
  - `app.json` の `androidAppId`: Android 本番 App ID 設定済み。
  - `app.json` の `iosAppId`: Google テスト App ID のまま（iOS AdMob ID は未設定）。
  - バナー / インタースティシャル / リワード広告ユニットID: Android 本番ID 設定済み。iOS は `TestIds.*` のまま（iOS AdMob 広告ユニットID は未設定）。
  - iOS 本番リリース前に `app.json` の `iosAppId` と各広告サービスの iOS 向け unit ID を差し替えること。
- `expo-splash-screen`: `app.json` に設定済み。Expo SDK 56 の推奨 config plugin 形式を使うため、ネイティブビルド前に依存関係に `expo-splash-screen` が入っているか確認する。

## ストア申告メモ

- 広告: Google AdMob を使用予定。広告ID、端末情報、広告の表示・クリック等に関するデータが Google により収集される可能性がある。
- データ保存: 家計簿データは主に端末内に保存する想定。外部サーバーへの家計簿データ送信は現時点で想定しない。
- トラッキング / パーソナライズ広告: AdMob 本番設定と配信方針が確定したら、Google Play Console / App Store Connect の広告・データ収集・トラッキング申告を実態に合わせて更新する。
- プライバシーポリシー: AdMob の利用、端末内保存、問い合わせ先、データ削除方法を記載する。
