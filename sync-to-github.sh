#!/usr/bin/env bash
# sync-to-github.sh — Push the current Replit branch to GitHub.
#
# Usage:
#   ./sync-to-github.sh              # push current branch
#   ./sync-to-github.sh --force      # force-push (use when remote has diverged)
#   BRANCH=master ./sync-to-github.sh  # push a specific branch

set -euo pipefail

REMOTE="origin"
REPO="https://github.com/Hari9704/SpringBatchbasedRAG"
BRANCH="${BRANCH:-$(git symbolic-ref --short HEAD)}"
FORCE="${1:-}"

# ── 1. Validate token ────────────────────────────────────────────────────────
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN secret is not set."
  echo "  → Add it in the Replit Secrets panel and re-run."
  exit 1
fi

echo "▶ Syncing branch '${BRANCH}' → ${REPO}"

# ── 2. Inject token into remote URL (never stored on disk) ───────────────────
AUTH_URL="https://${GITHUB_TOKEN}@github.com/Hari9704/SpringBatchbasedRAG.git"
git remote set-url "${REMOTE}" "${AUTH_URL}"

# ── 3. Push ──────────────────────────────────────────────────────────────────
PUSH_FLAGS="--set-upstream ${REMOTE} ${BRANCH}"
if [ "${FORCE}" = "--force" ] || [ "${FORCE}" = "-f" ]; then
  echo "  (force-push enabled)"
  PUSH_FLAGS="--force ${PUSH_FLAGS}"
fi

# shellcheck disable=SC2086
git push ${PUSH_FLAGS}

# ── 4. Restore unauthenticated remote URL (keep token out of git config) ─────
git remote set-url "${REMOTE}" "${REPO}.git"

echo "✓ Push complete. Branch '${BRANCH}' is now in sync with GitHub."
