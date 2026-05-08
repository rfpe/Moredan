---
name: Session end — sync memory to repo
description: When user says session is done/over, copy memory files to repo, commit, and push.
type: feedback
originSessionId: 7e7fe7c4-afc9-480a-9d98-5cadd51ac349
---
When the user signals the session is ending (e.g. "session done", "we're done", "that's it for today"), always:

1. Copy memory files to the repo: `cp /home/codespace/.claude/projects/-workspaces-Moredan/memory/* /workspaces/Moredan/.claude/memory/`
2. Commit and push: `git add .claude/memory/ && git commit -m "chore: update Claude memory files" && git push`

**Why:** The sandbox is ephemeral. Memory files written during a session live only at `/home/codespace/.claude/...` and are lost when the sandbox is scratched. The repo copy is the only durable backup.

**How to apply:** Do this proactively without being asked whenever the user closes the session.
