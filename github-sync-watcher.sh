#!/usr/bin/env bash
# github-sync-watcher.sh — Background watcher that auto-pushes new commits to GitHub.
#
# Run this as a persistent Replit workflow ("Sync to GitHub").
# It polls every POLL_SECONDS (default 60) for commits that exist locally
# but not yet on origin, then calls sync-to-github.sh to push them.
#
# Authentication is delegated to sync-to-github.sh which uses a
# process-scoped http.extraheader — the token is NEVER written to disk.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYNC_SCRIPT="${SCRIPT_DIR}/sync-to-github.sh"
POLL_SECONDS="${POLL_SECONDS:-60}"
REMOTE="origin"

if [ ! -x "${SYNC_SCRIPT}" ]; then
  chmod +x "${SYNC_SCRIPT}"
fi

echo "▶ GitHub Sync Watcher started (polling every ${POLL_SECONDS}s)"
echo "  Script : ${SYNC_SCRIPT}"
echo "  Remote : $(git remote get-url ${REMOTE})"
echo "  Branch : $(git symbolic-ref --short HEAD)"
echo ""

while true; do
  BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo '')"
  if [ -z "${BRANCH}" ]; then
    echo "[$(date '+%H:%M:%S')] Detached HEAD — skipping."
    sleep "${POLL_SECONDS}"
    continue
  fi

  # Count commits that are local but not on remote
  AHEAD=$(git rev-list --count "${REMOTE}/${BRANCH}..HEAD" 2>/dev/null || echo "0")

  if [ "${AHEAD}" -gt 0 ]; then
    echo "[$(date '+%H:%M:%S')] ${AHEAD} new commit(s) on '${BRANCH}' — pushing to GitHub..."
    if "${SYNC_SCRIPT}"; then
      echo "[$(date '+%H:%M:%S')] ✓ Push succeeded."
    else
      echo "[$(date '+%H:%M:%S')] ✗ Push failed (will retry in ${POLL_SECONDS}s)."
    fi
  else
    echo "[$(date '+%H:%M:%S')] '${BRANCH}' is up-to-date with origin."
  fi

  sleep "${POLL_SECONDS}"
done
