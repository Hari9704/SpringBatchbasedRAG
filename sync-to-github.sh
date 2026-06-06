#!/usr/bin/env bash
# sync-to-github.sh — Push the current branch to GitHub safely.
#
# Auth uses GIT_ASKPASS (a temp executable that echoes the token to git's
# credential prompt).  The temp file is removed by a trap on exit — the
# token is NEVER written to .git/config or left on disk.
#
# Usage:
#   ./sync-to-github.sh              # push current branch
#   ./sync-to-github.sh --force      # force-push (remote has diverged)
#   BRANCH=master ./sync-to-github.sh

set -euo pipefail

REMOTE="origin"
REMOTE_URL="https://github.com/Hari9704/SpringBatchbasedRAG.git"
BRANCH="${BRANCH:-$(git symbolic-ref --short HEAD)}"
FORCE_FLAG=""
[ "${1:-}" = "--force" ] || [ "${1:-}" = "-f" ] && FORCE_FLAG="--force"

# ── 1. Validate token ────────────────────────────────────────────────────────
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN secret is not set."
  echo "  → Add it in the Replit Secrets panel and re-run."
  exit 1
fi

# ── 2. Build a temp GIT_ASKPASS helper (token never written to git config) ───
ASKPASS=$(mktemp /tmp/git-askpass-XXXXXX)
chmod 700 "${ASKPASS}"
# Write a script that outputs the token — git calls ASKPASS for the password
printf '#!/bin/sh\necho "%s"\n' "${GITHUB_TOKEN}" > "${ASKPASS}"

# Guaranteed cleanup: remove temp file on any exit (success, error, signal)
trap 'rm -f "${ASKPASS}"' EXIT INT TERM

# Convenience: export so child processes inherit
export GIT_ASKPASS="${ASKPASS}"
export GIT_TERMINAL_PROMPT=0   # never fall back to interactive prompt

echo "▶ Syncing branch '${BRANCH}' → ${REMOTE_URL}"
[ -n "${FORCE_FLAG}" ] && echo "  (force-push enabled)"

# ── 3. Fetch origin so rev-list knows remote state ───────────────────────────
echo "  Fetching origin..."
git -c "credential.username=x-access-token" fetch "${REMOTE}" "${BRANCH}" 2>/dev/null || true

# ── 4. Rebase if we are behind remote (skip when force-pushing) ──────────────
BEHIND=$(git rev-list --count "HEAD..${REMOTE}/${BRANCH}" 2>/dev/null || echo "0")
if [ "${BEHIND}" -gt 0 ] && [ -z "${FORCE_FLAG}" ]; then
  echo "  Remote has ${BEHIND} new commit(s) — rebasing before push..."
  git rebase "${REMOTE}/${BRANCH}"
fi

# ── 5. Push ──────────────────────────────────────────────────────────────────
# Pass the authed URL directly as the push destination — .git/config remote
# URL stays unauthenticated.  Token is in the child process's env only.
# shellcheck disable=SC2206
PUSH_ARGS=(${FORCE_FLAG} --set-upstream "${REMOTE_URL}" "${BRANCH}":"${BRANCH}")
git -c "credential.username=x-access-token" push "${PUSH_ARGS[@]}"

echo "✓ Branch '${BRANCH}' is now in sync with GitHub."
