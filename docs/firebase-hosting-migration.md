# Firebase Hostingへの移行手順

ホーム画面版（PWA）でGoogleログインを安定させるため、公開先をGitHub PagesからFirebase Hostingへ移します。

## 公開予定URL

今回使用するURLは次です。

```text
https://pokemon-battle-notebook-shota.firebaseapp.com/
```

`web.app`側のURLも作成されますが、Googleログインでは上記の`firebaseapp.com`側を使用してください。

## 事前確認

移行前に、現在のブラウザ版でクラウド同期を開き、`同期済み`になっていることを確認してください。

新しいURLは保存領域が別になるため、最初は端末内のパーティや対戦履歴が空に見えます。Googleログイン後に`クラウドをこの端末へ読み込む`を選ぶと、現在のクラウドデータを復元できます。

## 1. 最新版を取得

PowerShellで実行します。

```powershell
cd C:\Users\xiang\Documents\pokemon-battle-notebook
git pull
npm.cmd install
```

## 2. Firebaseへログイン

```powershell
npm.cmd run firebase:login
```

ブラウザが開いたら、Firebaseプロジェクトを作成したGoogleアカウントでログインしてください。

## 3. Firebase Hostingへ公開

`.env.local`にFirebaseの6項目が入力されていることを確認してから実行します。

```powershell
npm.cmd run deploy:firebase
```

このコマンドは、アプリをビルドしてからFirebase Hostingへ公開します。

完了時に次のようなURLが表示されます。

```text
https://pokemon-battle-notebook-shota.web.app
https://pokemon-battle-notebook-shota.firebaseapp.com
```

## 4. 新しいURLで同期を確認

ChromeまたはSafariで次を開きます。

```text
https://pokemon-battle-notebook-shota.firebaseapp.com/
```

1. クラウド同期を開く
2. Googleでログインする
3. PCと同じGoogleアカウントを選ぶ
4. 初回同期の選択が表示されたら、`クラウドをこの端末へ読み込む`を選ぶ
5. `同期済み`になったことを確認する

空の端末データをクラウドへ保存しないよう、初回は選択内容をよく確認してください。

## 5. スマホのホーム画面へ追加

新しいFirebase Hosting URLをブラウザで開いた状態で、ホーム画面へ追加します。

古いGitHub Pages版のアイコンは、新しいFirebase Hosting版で同期を確認してから削除してください。

## 今後の更新

新しい機能をGitHubへマージした後は、次のコマンドで更新できます。

```powershell
cd C:\Users\xiang\Documents\pokemon-battle-notebook
git pull
npm.cmd install
npm.cmd run deploy:firebase
```

## GitHub Pagesについて

移行確認が終わるまでは、現在のGitHub Pages公開設定を残します。Firebase Hosting版でログイン・同期・ホーム画面起動が正常に動作することを確認してから、GitHub Pagesの自動公開を停止します。
