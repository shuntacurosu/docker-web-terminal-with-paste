FROM ubuntu:22.04

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Enable apt caching
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

# Install essential packages: curl, git, tmux, and dependencies for node-pty
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    tmux \
    vim \
    build-essential \
    python3 \
    ca-certificates

# Install Node.js (LTS version)
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash \
    && echo 'export PATH="/root/.local/bin:$PATH"' >> /root/.bashrc

# Create claude config directory and copy settings
RUN mkdir -p /root/.claude
COPY claude_settings.json /root/.claude/settings.json

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including node-pty which requires build-essential and python)
RUN npm install

# Copy application source
COPY . .

# Expose the web server port
EXPOSE 3000

# Start the Node.js server
CMD ["npm", "start"]
