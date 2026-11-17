# Shared by the kit hooks. Lifted from project_treasure/loud .husky/pre-push.

# kit_changed <out>: read git's pre-push lines on stdin and append the pushed
# paths (NUL-separated) to <out>. Base = remote tip; for a new branch or an
# unknown tip, where it left origin/test or the default branch. Sets
# KIT_FALLBACK=1 when no base exists or code was deleted (check every app),
# KIT_TO_MAIN=1 when the default branch is pushed.

# Default branch: origin/HEAD, else main, else master (else main).
kit_default_branch() {
  b="$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || true)"
  [ -z "$b" ] || { echo "${b#origin/}"; return; }
  for b in main master; do
    git rev-parse --verify -q "refs/remotes/origin/$b" >/dev/null && { echo "$b"; return; }
  done
  echo main
}

kit_changed() {
  def="$(kit_default_branch)"
  zero=0000000000000000000000000000000000000000
  KIT_FALLBACK=0
  KIT_TO_MAIN=0
  while read -r local_ref local_sha remote_ref remote_sha; do
    [ -n "$local_ref" ] || continue
    [ "$local_sha" != "$zero" ] || continue
    [ "$remote_ref" != "refs/heads/$def" ] || KIT_TO_MAIN=1
    base="$remote_sha"
    if [ "$base" = "$zero" ] || ! git cat-file -e "$base^{commit}" 2>/dev/null; then
      base="$(git merge-base origin/test "$local_sha" 2>/dev/null || git merge-base "origin/$def" "$local_sha" 2>/dev/null || true)"
    fi
    if [ -z "$base" ]; then
      KIT_FALLBACK=1
      continue
    fi
    git diff --quiet --diff-filter=D "$base" "$local_sha" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' || KIT_FALLBACK=1
    git diff --name-only --no-renames --diff-filter=d -z "$base" "$local_sha" >> "$1"
  done
  export KIT_FALLBACK KIT_TO_MAIN
}

# Git exports GIT_DIR into hooks run from a worktree; with it set,
# `rev-parse --show-toplevel` answers the current directory (frub pre-push).
kit_root() {
  for v in $(git rev-parse --local-env-vars); do unset "$v"; done
  cd "$(git rev-parse --show-toplevel)"
}
