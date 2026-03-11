# Dockerized Web Terminal with Image Paste

[🇺🇸 English](README.md) | [🇯🇵 日本語](README.ja.md)

This project provides a lightweight, Docker-based Ubuntu environment accessible via a web browser using `xterm.js`. It intercepts clipboard image paste events (Ctrl+V) in the browser, uploads the image to the Docker container, and automatically inserts the file path into the terminal prompt. 

This enables seamless interaction with tools like [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) running inside the container through `tmux`.

## Prerequisites

- Docker and Docker Compose

## Setup Instructions

1. **Configure Claude Settings (Optional but recommended)**
   If you plan to use Claude Code, you need to set up your configuration:
   ```bash
   cp claude_settings.json.template claude_settings.json
   ```
   Then, edit `claude_settings.json` and replace `xxxxxxxxxxxx` with your actual Anthropic API token.
   *Note: `claude_settings.json` is ignored by git to protect your credentials.*

2. **Build and Start the Container**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the Terminal**
   Open your browser and navigate to:
   http://localhost:3000

## Features
- **Tmux Session Management**: Sidebar to easily switch between multiple tmux sessions or create new ones.
- **Image Pasting**: Paste images directly into the web terminal. They will be saved inside the container to `/tmp/` and their paths instantly inserted into your terminal prompt. (Mounting `/tmp` to the host is no longer required).
- **Pre-installed Tools**: `curl`, `git`, `tmux`, `vim`, and `claude-code`.
- **Japanese Support**: Full UTF-8 locale support pre-configured.

## Security Note
Never commit your `claude_settings.json` file. It is safely added to `.gitignore`. Use the `.template` file for committing defaults.
