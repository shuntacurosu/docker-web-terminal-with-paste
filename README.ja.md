# Dockerized Web Terminal with Image Paste

[🇺🇸 English](README.md) | [🇯🇵 日本語](README.ja.md)

このプロジェクトは、ブラウザ上の `xterm.js` を経由して軽量な Docker ベースの Ubuntu 環境にアクセスできるWebターミナルです。ブラウザ上のクリップボードへの画像ペーストイベント (Ctrl+V) を横取りし、画像をDockerコンテナ内にアップロードした上で、ターミナルのプロンプトにそのファイルパスを自動で入力します。

これにより、コンテナ内の `tmux` で実行されている [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) などのツールとシームレスに対話することが可能になります。

## 前提条件

- Docker および Docker Compose

## セットアップ手順

1. **Claude の設定 (任意・推奨)**
   Claude Code を使用する場合は、設定ファイルを作成してください。
   ```bash
   cp claude_settings.json.template claude_settings.json
   ```
   コピー後、`claude_settings.json` を編集し、`xxxxxxxxxxxx` の部分を実際の Anthropic API トークンに置き換えてください。
   *※ 注意: `claude_settings.json` はクレデンシャル保護のため `.gitignore` でGitの管理から除外されています。*

2. **コンテナのビルドと起動**
   ```bash
   docker-compose up -d --build
   ```

3. **ターミナルへのアクセス**
   ブラウザを開き、以下のURLにアクセスしてください。
   http://localhost:3000

## 特徴
- **Tmux セッション管理**: サイドバーから複数の tmux セッションを簡単に切り替えたり、新規作成したりできます。
- **画像ペースト**: Webターミナルに直接画像をペーストできます。画像はコンテナ内の `/tmp/` に保存され、パスが即座にプロンプトに入力されます。（ホスト側の `/tmp` マウントは不要です）
- **プリインストールツール**: `curl`, `git`, `tmux`, `vim`, `claude-code` が最初から利用可能です。
- **日本語サポート**: UTF-8 ロケールが事前に設定されており、日本語入力・表示に対応しています。

## セキュリティに関する注意
自身の `claude_settings.json` は絶対にコミットしないでください。（すでに `.gitignore` で安全に除外されています）。デフォルト設定をコミットする場合は `.template` ファイルを使用してください。
