import type { Meta, StoryObj } from '@storybook/react'

import {
  ExternalGitHubCommitReference,
  IssueDashboardRead,
  IssueReferenceRead,
  IssueReferenceType,
  IssueStatus,
  OrganizationPublicRead,
  PledgeRead,
  PledgeState,
  PullRequestReference,
} from 'polarkit/api/client'
import { IssueReadWithRelations } from 'polarkit/api/types'
import IssueListItem from '../components/Dashboard/IssueListItem'
import { issue, org, repo } from './testdata'

type Story = StoryObj<typeof IssueListItem>

function addDays(date: Date, days: number) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const pledges: PledgeRead[] = [
  {
    id: 'xx',
    created_at: 'what',
    issue_id: 'nah',
    amount: 1234,
    repository_id: 'xx',
    organization_id: 'yy',
    state: PledgeState.CREATED,
    pledger_name: 'zz',
  },
]

const pledgeDisputable: PledgeRead[] = [
  {
    id: 'xx',
    created_at: 'what',
    issue_id: 'nah',
    amount: 1234,
    repository_id: 'xx',
    organization_id: 'yy',
    state: PledgeState.PENDING,
    scheduled_payout_at: addDays(new Date(), 7).toISOString(),
    authed_user_can_admin: true,
    pledger_name: 'zz',
  },
]

const payload: PullRequestReference = {
  id: '11',
  title: 'Updated Readme.md',
  author_login: '33',
  author_avatar: 'https://avatars.githubusercontent.com/u/47952?v=4',
  number: 55,
  additions: 10,
  deletions: 2,
  state: 'open',
  created_at: '2023-04-08',
  is_draft: false,
}

const references: IssueReferenceRead[] = [
  {
    id: 'wha',
    type: IssueReferenceType.PULL_REQUEST,
    payload,
  },
]

const referencesDraft: IssueReferenceRead[] = [
  {
    id: 'wha',
    type: IssueReferenceType.PULL_REQUEST,
    payload: {
      ...payload,
      is_draft: true,
    },
  },
]

const referencesMerged: IssueReferenceRead[] = [
  {
    id: 'wha',
    type: IssueReferenceType.PULL_REQUEST,
    payload: {
      ...payload,
      //is_draft: true,
      state: 'closed',
      merged_at: '2024-05-01',
    },
  },
]

const referencesClosed: IssueReferenceRead[] = [
  {
    id: 'wha',
    type: IssueReferenceType.PULL_REQUEST,
    payload: {
      ...payload,
      state: 'closed',
      closed_at: '2024-05-01',
    },
  },
]

const doubleReference: IssueReferenceRead[] = [
  {
    id: 'wha',
    type: IssueReferenceType.PULL_REQUEST,
    payload,
  },
  {
    id: 'wha',
    type: IssueReferenceType.PULL_REQUEST,
    payload,
  },
]

const referencesCommit: IssueReferenceRead[] = [
  {
    id: 'wha',
    type: IssueReferenceType.EXTERNAL_GITHUB_COMMIT,
    payload: {
      author_login: 'petterheterjag',
      author_avatar: 'https://avatars.githubusercontent.com/u/1426460?v=4',
      sha: '160a13da0ecedacb326de1b913186f448185ad9a',
      organization_name: 'petterheterjag',
      repository_name: 'polartest',
      message: 'What is this',
      branch_name: 'fix-1234',
    } as ExternalGitHubCommitReference, // with branch name
  },
  {
    id: 'wha',
    type: IssueReferenceType.EXTERNAL_GITHUB_COMMIT,
    payload: {
      author_login: 'petterheterjag',
      author_avatar: 'https://avatars.githubusercontent.com/u/1426460?v=4',
      sha: '160a13da0ecedacb326de1b913186f448185ad9a',
      organization_name: 'petterheterjag',
      repository_name: 'polartest',
      message: 'What is this',
    } as ExternalGitHubCommitReference, // without branch name
  },
]

interface Issue extends IssueDashboardRead {
  organization?: OrganizationPublicRead
}

const dashboardIssue: Issue = {
  ...issue,
  organization: org,
}

const issueTriaged = {
  ...dashboardIssue,
  progress: IssueStatus.TRIAGED,
  labels: [
    {
      id: 'x',
      name: 'feature',
      color: '112233',
    },
    {
      id: 'x',
      name: 'bug',
      color: '8811111',
    },
  ],
}
const issueInProgress = { ...dashboardIssue, progress: IssueStatus.IN_PROGRESS }
const issuePullRequest = {
  ...dashboardIssue,
  progress: IssueStatus.PULL_REQUEST,
}
const issueCompleted = { ...dashboardIssue, progress: IssueStatus.COMPLETED }

const dependents: IssueReadWithRelations = {
  ...issue,
  number: 123,
  title: "Wow, we're blocked by this thing",
  organization: { ...org, name: 'someorg' },
  repository: { ...repo, name: 'somerepo' },
  references: [],
  pledges: [],
  dependents: [],
}

const meta: Meta<typeof IssueListItem> = {
  title: 'Organisms/IssueListItem',
  component: IssueListItem,
  tags: ['autodocs'],
  argTypes: {
    issue: {
      options: ['Backlog', 'Triaged', 'InProgress', 'PullRequest', 'Completed'],
      mapping: {
        Backlog: dashboardIssue,
        Triaged: issueTriaged,
        InProgress: issueInProgress,
        PullRequest: issuePullRequest,
        Completed: issueCompleted,
      },
      defaultValue: issuePullRequest,
    },
    pledges: {
      options: ['None', 'Yes', 'Disputable'],
      mapping: {
        None: [],
        Yes: pledges,
        Disputable: pledgeDisputable,
      },
      defaultValue: pledges,
    },
    references: {
      options: ['None', 'Draft', 'OpenPR', 'MergedPR', 'ClosedPR', 'Commits'],
      mapping: {
        None: [],
        Draft: referencesDraft,
        OpenPR: references,
        MergedPR: referencesMerged,
        ClosedPR: referencesClosed,
        Commits: referencesCommit,
      },
      defaultValue: pledges,
    },
    repo: {
      options: ['Repo'],
      mapping: {
        Repo: repo,
      },
      defaultValue: repo,
    },
    org: {
      options: ['Org'],
      mapping: {
        Repo: org,
      },
      defaultValue: org,
    },
    dependents: {
      options: ['No', 'Yes'],
      mapping: {
        No: [],
        Yes: [dependents],
      },
      defaultValue: [],
    },
  },
  args: {
    pledges: pledges,
    references: references,
    repo: repo,
    org: org,
    issue: dashboardIssue,
  },
}

export default meta

export const Default: Story = {}

export const StatusTriaged: Story = {
  args: {
    ...Default.args,
    issue: issueTriaged,
  },
}

export const StatusInProgress: Story = {
  args: {
    ...Default.args,
    references: referencesDraft,
    issue: issueInProgress,
  },
}

export const StatusPullRequest: Story = {
  args: {
    ...Default.args,
    issue: issuePullRequest,
  },
}

export const StatusCompleted: Story = {
  args: {
    ...Default.args,
    references: referencesMerged,
    issue: issueCompleted,
  },
}

export const TwoReferences: Story = {
  args: {
    ...Default.args,
    references: doubleReference,
  },
}

export const ReferencesNoPledge: Story = {
  args: {
    ...Default.args,
    pledges: [],
    references: doubleReference,
  },
}

export const ReferencesCommit: Story = {
  args: {
    ...Default.args,
    references: referencesCommit,
  },
}

export const PledgeNoReferences: Story = {
  args: {
    ...Default.args,
    references: [],
  },
}

export const PledgeCanDispute: Story = {
  args: {
    ...Default.args,
    pledges: pledgeDisputable,
  },
}

export const Dependency: Story = {
  args: {
    ...Default.args,
    dependents: [dependents],
  },
}