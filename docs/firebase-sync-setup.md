# Firebaseクラウド同期の設定

この機能を使うと、同じGoogleアカウントでログインしたスマートフォンとパソコンの間で、パーティ・型テンプレート・対戦履歴を同期できます。

## 1. Firebaseプロジェクトを作成

1. Firebase Consoleを開きます。
2. 「プロジェクトを追加」を押します。
3. 任意のプロジェクト名を入力して作成します。
4. プロジェクトのトップ画面でWebアプリ（`</>`）を追加します。

## 2. Googleログインを有効化

1. 「Authentication」を開きます。
2. 「始める」を押します。
3. 「Sign-in method」から「Google」を選びます。
4. 有効化して保存します。

公開後は「Settings > Authorized domains」に公開先のドメインも追加してください。

## 3. Firestoreを作成

1. 「Firestore Database」を開きます。
2. 「データベースの作成」を押します。
3. 本番環境モードを選び、利用地域を決めます。
4. 「ルール」タブで、次の条件を設定して公開します。

- ログインしていること
- URL内のユーザーIDと、ログインユーザーのIDが同じこと
- 対象は `users/{userId}/app/{documentId}` のみ

Firebase Consoleのルール例：

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/app/{documentId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

このルールにより、各ユーザーは自分の同期データだけを読み書きできます。

## 4. Web設定値をコピー

1. Firebaseの「プロジェクトの設定」を開きます。
2. 「マイアプリ」から作成したWebアプリを選びます。
3. SDKの設定に表示される次の値を確認します。

- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

## 5. ローカルへ設定

PowerShellでプロジェクトへ移動し、設定ファイルを作ります。

```powershell
cd C:\Users\xiang\Documents\pokemon-battle-notebook
Copy-Item .env.example .env.local
notepad .env.local
```

Firebaseの値を対応する欄へ入力します。

```env
VITE_FIREBASE_API_KEY=ここにapiKey
VITE_FIREBASE_AUTH_DOMAIN=ここにauthDomain
VITE_FIREBASE_PROJECT_ID=ここにprojectId
VITE_FIREBASE_STORAGE_BUCKET=ここにstorageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=ここにmessagingSenderId
VITE_FIREBASE_APP_ID=ここにappId
```

保存後に起動します。

```powershell
npm.cmd install
npm.cmd run dev
```

## 6. 最初の同期

画面右下の「クラウド同期」を開き、Googleでログインします。

端末とクラウドの両方に異なるデータがある場合は、次のどちらかを選びます。

- この端末のデータをクラウドへ保存
- クラウドのデータをこの端末へ読み込む

クラウドから読み込む場合は、現在の端末データが先にJSONファイルとして保存されます。

## 7. 公開環境で使う場合

GitHub Pagesなどへ公開する場合は、ビルド環境にも同じ `VITE_FIREBASE_` 値を設定します。また、Firebase Authenticationの認証済みドメインへ公開先を追加します。

## 同期の注意点

- オフライン中の変更は端末へ保存され、再接続後に送信されます。
- 複数端末で同時に編集した場合は、最後に保存された内容が優先されます。
- 大切な編集前には「データ管理」からJSONバックアップも作成してください。
- `.env.local`はGitへコミットしないでください。
