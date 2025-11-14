# Dependabot Auto-Approve and Auto-Merge

This repository has automated approval and merging configured for Dependabot pull requests.

## How It Works

When Dependabot creates a pull request for dependency updates:

1. The workflow `.github/workflows/dependabot-auto-merge.yml` automatically triggers
2. The PR is automatically approved
3. Auto-merge is enabled with the squash merge strategy
4. Once all required status checks pass, the PR automatically merges
5. If any check fails, the PR remains open for manual review

## Required Checks

Before a Dependabot PR can be auto-merged, all configured CI checks must pass:

- **Backend API** - Build and lint checks for the API layer
- **Backend Data** - Build and lint checks for the data layer
- **Backend Library** - Build and lint checks for the library/domain layer
- **Frontend** - Build, lint, and TypeScript compilation checks

## Security

The workflow uses `pull_request_target` event type which:
- Runs in the context of the base repository
- Has access to repository secrets
- Only executes for PRs created by `dependabot[bot]`

## Permissions

The workflow requires:
- `pull-requests: write` - To approve PRs
- `contents: write` - To enable auto-merge

## Configuration

### Merge Strategy

Currently configured to use **squash merge**. To change this, edit `.github/workflows/dependabot-auto-merge.yml`:

```yaml
# Options: --merge, --squash, --rebase
run: gh pr merge --auto --squash "$PR_URL"
```

### Disable Auto-Merge

To disable auto-merge for specific types of updates, you can:

1. **Temporarily disable**: Delete or rename the workflow file
2. **Selective disable**: Add conditions to the workflow's `if` clause
3. **Per-ecosystem**: Add the condition based on Dependabot metadata

Example - only auto-merge patch updates:

```yaml
- name: Enable auto-merge for patch updates only
  if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
  run: gh pr merge --auto --squash "$PR_URL"
```

## Branch Protection

For auto-merge to work properly, ensure your repository settings allow:

1. **Auto-merge**: Must be enabled in repository settings
2. **Required status checks**: Configure which checks must pass before merging
3. **Require approvals**: Can be configured but workflow provides automatic approval

## Troubleshooting

### Auto-merge doesn't trigger
- Check that auto-merge is enabled in repository settings
- Verify branch protection rules allow auto-merge
- Ensure the workflow has proper permissions

### PR doesn't merge after checks pass
- Check if all required status checks are configured correctly
- Look for failing checks in the PR status section
- Verify merge conflicts don't exist

### Workflow doesn't run
- Confirm the PR is created by `dependabot[bot]`
- Check workflow permissions in repository settings
- Review workflow run logs in the Actions tab

## Related Files

- `.github/workflows/dependabot-auto-merge.yml` - Main workflow file
- `.github/dependabot.yml` - Dependabot configuration
- `.github/workflows/backend-*.yml` - Backend CI checks
- `.github/workflows/frontend.yml` - Frontend CI checks
