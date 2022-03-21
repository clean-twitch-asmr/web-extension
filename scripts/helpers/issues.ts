import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

const api = new Octokit();

export async function* issues(
  owner: string,
  repo: string,
): AsyncGenerator<RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"][number]> {
  for await (const { data: issues } of api.paginate.iterator(api.rest.issues.listForRepo, {
    owner,
    repo,
  })) {
    for (const issue of issues) {
      yield issue;
    }
  }
}
