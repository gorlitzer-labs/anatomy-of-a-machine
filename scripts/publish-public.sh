#!/bin/sh
# Publishes origin/main to the public repo as one snapshot commit on top of what is there.
# The working history (PRs, authors, old deploy config) stays in this private repo; the public
# commits carry a plain author that links to no GitHub account.
#
#   sh scripts/publish-public.sh ["commit message"]
set -eu
PUBLIC=git@github.com:gorlitzer-labs/anatomy-of-a-machine.git
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

git fetch -q origin main
git clone -q --depth 1 "$PUBLIC" "$tmp"
find "$tmp" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
git archive origin/main | tar -x -C "$tmp"

cd "$tmp"
git add -A
if git diff --cached --quiet; then echo 'nothing to publish'; exit 0; fi
git -c user.name=gorlitzer -c user.email=gorlitzer@noreply.invalid \
  commit -q -m "${1:-Update from upstream}"
git push -q origin HEAD:main
echo "published $(git rev-parse --short HEAD)"
