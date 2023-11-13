import { octokit } from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class PRsStale {
    /**
     * @constructor
     */
    constructor() {

    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async checkStale(): Promise<void> {
        await octokit.rest.repos.listForUser({
            username: "Muunatic",
            type: "owner"
        }).then(async (res) => {
            for (let i = 0; i < res.data.length; i++) {
                if (res.data[i].fork === false) {
                    await octokit.rest.pulls.list({
                        owner: res.data[i].owner.login,
                        repo: res.data[i].name
                    }).then(async (res) => {
                        for (let i = 0; i < res.data.length; i++) {
                            const currentRepo = res.data[i].base.repo.name;
                            const currentOwner = res.data[i].base.repo.owner.login;
                            const currentPRs = res.data[i].number;
                            if (res.data[i].state.toLowerCase() == "open" && res.data[i].draft == false) {
                                if (res.data[i].user?.type.toLowerCase() == "user") {
                                    await octokit.rest.pulls.listCommits({
                                        owner: currentOwner,
                                        repo: currentRepo,
                                        pull_number: currentPRs
                                    }).then(async (res) => {
                                        const currentDate = new Date();
                                        const createdAt = new Date(res.data[res.data.length - 1].commit.author?.date as string);
                                        const staleDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                                        const closeDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
                                        if (currentDate > staleDate) {
                                            if (currentDate > closeDate) {
                                                await octokit.rest.pulls.update({
                                                    owner: currentOwner,
                                                    repo: currentRepo,
                                                    pull_number: currentPRs,
                                                    state: "closed"
                                                }).then(async (res) => {
                                                    if (res.data.labels.find((a) => a.name == "Stale")) {
                                                        await octokit.rest.issues.addLabels({
                                                            owner: res.data.base.repo.owner.login,
                                                            repo: res.data.base.repo.name,
                                                            issue_number: res.data.number,
                                                            labels: ["Closed"]
                                                        });
                                                        await octokit.rest.issues.removeLabel({
                                                            owner: res.data.base.repo.owner.login,
                                                            repo: res.data.base.repo.name,
                                                            issue_number: res.data.number,
                                                            name: "Pending"
                                                        });
                                                        await octokit.rest.issues.createComment({
                                                            owner: res.data.base.repo.owner.login,
                                                            repo: res.data.base.repo.name,
                                                            issue_number: res.data.number,
                                                            body: `Hello @${res.data.user.login}! We've observed that your pull requests have remained inactive for the last 30 days. Due to this prolonged inactivity, we've had to close these PRs. If you still intend to pursue these changes, please feel free to create new PRs.`
                                                        });
                                                        await octokit.rest.issues.lock({
                                                            owner: currentOwner,
                                                            repo: currentRepo,
                                                            issue_number: currentPRs,
                                                            lock_reason: "resolved"
                                                        });
                                                    } else {
                                                        return;
                                                    }
                                                });
                                            } else {
                                                await octokit.rest.pulls.get({
                                                    owner: currentOwner,
                                                    repo: currentRepo,
                                                    pull_number: currentPRs
                                                }).then(async (res) => {
                                                    if (res.data.labels.find((a) => a.name == "Stale")) {
                                                        return;
                                                    } else {
                                                        const prsReviewers: string[] = [];
                                                        await octokit.rest.pulls.listReviewComments({
                                                            owner: res.data.base.repo.owner.login,
                                                            repo: res.data.base.repo.name,
                                                            pull_number: res.data.number
                                                        }).then((res) => {
                                                            if (res.data.length !== 0) {
                                                                for (let i = 0; i < res.data.length; i++) {
                                                                    prsReviewers.push("@" + res.data[i].user.login);
                                                                }
                                                            } else {
                                                                prsReviewers.push("@Muunatic");
                                                            }
                                                        });
                                                        await octokit.rest.issues.addLabels({
                                                            owner: res.data.base.repo.owner.login,
                                                            repo: res.data.base.repo.name,
                                                            issue_number: res.data.number,
                                                            labels: ["Stale"]
                                                        });
                                                        await octokit.rest.issues.createComment({
                                                            owner: res.data.base.repo.owner.login,
                                                            repo: res.data.base.repo.name,
                                                            issue_number: res.data.number,
                                                            body: `Hello @${res.data.user.login}! We noticed that your pull request has been inactive for the past 7 days. If you've already received a response from the maintainer, please ensure that you review and address the feedback provided. If not, please reach out to the maintainer to seek clarification or assistance if needed.\n\n Additionally, we'd appreciate it if ${prsReviewers.join(", ")} could also take a moment to review the pull request and provide feedback.`
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            return;
                                        }
                                    });
                                } else {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                        }
                    });
                } else {
                    continue;
                }
            }
        });
    }
}
