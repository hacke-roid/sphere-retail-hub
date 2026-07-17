# Sphere Retail Hub

## Frontend deployment

The frontend uses three separate Vercel projects and one GitHub Actions workflow:

| Git event | GitHub environment | Vercel project |
| --- | --- | --- |
| Push to `main` | `staging` | Staging |
| Push an RC tag such as `Y2026-W29-RC1` | `pre-production` | Pre-production |
| Push a release tag such as `v1.1` or `v1.1.0` | `production` | Production |

RC tags must point to a commit contained in the matching release branch. For
example, `Y2026-W29-RC1` must come from `release/Y2026-W29`. A production tag
must point to the exact commit that already has an RC tag, so production cannot
silently deploy code different from the version tested in pre-production.

### One-time GitHub and Vercel setup

1. Create separate staging, pre-production, and production projects in Vercel.
   Set each project's root directory to `frontend` and configure its own
   `VITE_API_BASE_URL` environment variable under the Vercel Production
   environment. GitHub Actions uses `--prod` against each isolated project so
   every environment gets a stable Vercel domain.
2. Disable Git-based automatic deployments for these Vercel projects to avoid
   duplicate or unapproved deployments; GitHub Actions is the deployment
   controller.
3. Add the `VERCEL_TOKEN` GitHub Actions repository secret. The Vercel
   organization and six project IDs are non-secret identifiers mapped directly
   in the workflow.
4. Create GitHub environments named `staging`, `pre-production`, and
   `production`. Add required reviewers to `production` to enforce manual
   approval before its deployment job starts. Environment protection rules may
   require a GitHub plan that supports them for the repository.

The workflow is [.github/workflows/vercel-deploy.yml](.github/workflows/vercel-deploy.yml).

### Release example

```bash
git switch main
git pull --ff-only origin main
git switch -c release/Y2026-W29
git push -u origin release/Y2026-W29

# Deploy the current release commit to pre-production.
git tag Y2026-W29-RC1
git push origin Y2026-W29-RC1

# After approval, tag that same commit for production.
git tag v1.1 Y2026-W29-RC1
git push origin v1.1
```
