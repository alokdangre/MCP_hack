import { zodToJsonSchema } from 'zod-to-json-schema';
import * as repository from './operations/repository.js';
import * as files from './operations/files.js';
import * as issues from './operations/issues.js';
import * as pulls from './operations/pull.js';
import * as branches from './operations/branches.js';
import * as commits from './operations/commits.js';
import * as search from './operations/search.js';

export const tools = [
  { name: 'create_or_update_file', description: 'Create or update a single file in a GitHub repository', inputSchema: zodToJsonSchema(files.CreateOrUpdateFileSchema) },
  { name: 'search_repositories', description: 'Search for GitHub repositories', inputSchema: zodToJsonSchema(repository.SearchRepositoriesSchema) },
  { name: 'create_repository', description: 'Create a new GitHub repository', inputSchema: zodToJsonSchema(repository.CreateRepositoryOptionsSchema) },
  { name: 'get_file_contents', description: 'Get the contents of a file or directory from a GitHub repository', inputSchema: zodToJsonSchema(files.GetFileContentsSchema) },
  { name: 'push_files', description: 'Push multiple files to a GitHub repository in a single commit', inputSchema: zodToJsonSchema(files.PushFilesSchema) },
  { name: 'create_issue', description: 'Create a new issue in a GitHub repository', inputSchema: zodToJsonSchema(issues.CreateIssueSchema) },
  { name: 'create_pull_request', description: 'Create a new pull request', inputSchema: zodToJsonSchema(pulls.CreatePullRequestSchema) },
  // add more tools as needed
];

// helper list of tool names for gateway routing
export const toolNames = tools.map(t => t.name);

export async function callTool(name: string, args: any) {
  switch (name) {
    case 'fork_repository': {
      const parsed = repository.ForkRepositorySchema.parse(args);
      return repository.forkRepository(parsed.owner, parsed.repo, parsed.organization);
    }
    case 'create_branch': {
      const parsed = branches.CreateBranchSchema.parse(args);
      return branches.createBranchFromRef(parsed.owner, parsed.repo, parsed.branch, parsed.from_branch);
    }
    case 'search_repositories': {
      const parsed = repository.SearchRepositoriesSchema.parse(args);
      return repository.searchRepositories(parsed.query, parsed.page, parsed.perPage);
    }
    case 'create_repository': {
      const parsed = repository.CreateRepositoryOptionsSchema.parse(args);
      return repository.createRepository(parsed);
    }
    case 'get_file_contents': {
      const parsed = files.GetFileContentsSchema.parse(args);
      return files.getFileContents(parsed.owner, parsed.repo, parsed.path, parsed.branch);
    }
    case 'create_or_update_file': {
      const parsed = files.CreateOrUpdateFileSchema.parse(args);
      return files.createOrUpdateFile(parsed.owner, parsed.repo, parsed.path, parsed.content, parsed.message, parsed.branch, parsed.sha);
    }
    case 'push_files': {
      const parsed = files.PushFilesSchema.parse(args);
      return files.pushFiles(parsed.owner, parsed.repo, parsed.branch, parsed.files, parsed.message);
    }
    case 'create_issue': {
      const parsed = issues.CreateIssueSchema.parse(args);
      return issues.createIssue(parsed.owner, parsed.repo, parsed);
    }
    // add mappings for other GitHub tools...
    default:
      throw new Error(`GitHub unknown tool: ${name}`);
  }
}
