# GitHub Pages公開設定

公開URL：

```text
https://xiangtaizhongcun2-gif.github.io/pokemon-battle-notebook/
```

## 1. Firebase設定値をGitHubへ登録

GitHubリポジトリで次を開きます。

```text
Settings
→ Secrets and variables
→ Actions
→ Variables
→ New repository variable
```

次の6個を、ローカルの`.env.local`と同じ値で登録します。

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

値はGitHubのIssueやコメントへ貼らず、Repository variablesへ直接入力してください。

## 2. GitHub Pagesを有効化

GitHubリポジトリで次を開きます。

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

## 3. Firebaseの認証済みドメインを追加

Firebase Consoleで次を開きます。

```text
Authentication
→ Settings
→ Authorized domains
→ Add domain
```

次を追加します。

```text
xiangtaizhongcun2-gif.github.io
```

## 4. デプロイを実行

`main`へ変更をマージすると、GitHub Actionsの`Deploy Battle Notebook to GitHub Pages`が自動実行されます。

手動で再実行する場合：

```text
GitHub
→ Actions
→ Deploy Battle Notebook to GitHub Pages
→ Run workflow
```

成功後、公開URLを開き、Googleログインとクラウド同期を確認します。
