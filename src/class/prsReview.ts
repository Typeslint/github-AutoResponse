import Context from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class PullRequestReview {

    /**
     * @private
     * @type Context<"pull_request_review.submitted">
     */
    private context: Context<"pull_request_review.submitted">;

    /**
     * @constructor
     * @param {Context<"pull_request_review.submitted">} context
     */
    constructor(context: Context<"pull_request_review.submitted">) {
        this.context = context;
    }

    /**
     * @private
     * @async
     * @returns {Promise<void>}
     */
    public async userPRs(): Promise<void> {
        if (this.context.payload.sender.login == this.context.payload.repository.owner.login) {
            // Owner
            if (this.context.payload.review.state == "approved") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} your pull request has been approved by @${this.context.payload.review.user.login}, please type \`Ready to merge\` for merging`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Requested Changes")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Requested Changes"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            } else if (this.context.payload.review.state == "changes_requested") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Approved")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Approved"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            }
        } else if (this.context.payload.pull_request.author_association == "MEMBER" || this.context.payload.pull_request.author_association == "COLLABORATOR") {
            if (this.context.payload.review.state == "approved") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} your pull request has been approved by \`[MAINTAINER]\`@${this.context.payload.review.user.login}, please type \`Ready to merge\` for merging`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Requested Changes")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Requested Changes"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            } else if (this.context.payload.review.state == "changes_requested") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Approved")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Approved"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            }
        } else {
            // Others Approved
            if (this.context.payload.review.state == "approved") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} your pull request has been approved by @${this.context.payload.review.user.login}, even though please wait for the \`MAINTAINERS\`/\`CODEOWNERS\` to review`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Requested Changes")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Requested Changes"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Others Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Others Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            } else if (this.context.payload.review.state == "changes_requested") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`,
                    event: "COMMENT"
                });
                await this.context.octokit.issues.addLabels(
                    this.context.issue({
                        labels: ["Requested Changes"]
                    })
                );
                console.log("PRs Requested Changes");
                await this.context.octokit.issues.removeLabel(
                    this.context.issue({
                        name: "Pending"
                    })
                );
            }
        }
    }

    /**
     * @private
     * @async
     * @returns {Promise<void>}
     */
    public async botPRs(): Promise<void> {
        if (this.context.payload.sender.login == this.context.payload.repository.owner.login) {
            // Owner
            if (this.context.payload.review.state == "approved") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} Pull request has been approved by \`[OWNER]\`@${this.context.payload.review.user.login}, please type \`Merge\` for merging @${this.context.payload.review.user.login}`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Requested Changes")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Requested Changes"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            } else if (this.context.payload.review.state == "changes_requested") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} your pull request has requested changes by \`[OWNER]\`@${this.context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Approved")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Approved"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            }
        } else if (this.context.payload.pull_request.author_association == "MEMBER" || this.context.payload.pull_request.author_association == "COLLABORATOR") {
            if (this.context.payload.review.state == "approved") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} Pull request has been approved by \`[MAINTAINER]\`@${this.context.payload.review.user.login}, please type \`Merge\` for merging @${this.context.payload.review.user.login}`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Requested Changes")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Requested Changes"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            } else if (this.context.payload.review.state == "changes_requested") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `Pull request has requested changes by \`[MAINTAINER]\`@${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I"m merging this PR, thanks!`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Approved")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Approved"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Requested Changes"]
                        })
                    );
                    console.log("PRs Requested Changes");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            }
        } else {
            // Others Approved
            if (this.context.payload.review.state == "approved") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `@${this.context.payload.pull_request.user.login} your pull request has been approved by @${this.context.payload.review.user.login}, even though please wait for the \`MAINTAINERS\`/\`CODEOWNERS\` to review`,
                    event: "COMMENT"
                });
                if (this.context.payload.pull_request.labels.find((a) => a.name == "Requested Changes")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Requested Changes"
                        })
                    );
                    console.log("Label removed");
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Others Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                } else {
                    await this.context.octokit.issues.addLabels(
                        this.context.issue({
                            labels: ["Others Approved"]
                        })
                    );
                    console.log("PRs Approved");
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: "Pending"
                        })
                    );
                }
            } else if (this.context.payload.review.state == "changes_requested") {
                await this.context.octokit.pulls.createReview({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.pull_request.number,
                    body: `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`,
                    event: "COMMENT"
                });
                await this.context.octokit.issues.addLabels(
                    this.context.issue({
                        labels: ["Requested Changes"]
                    })
                );
                console.log("PRs Requested Changes");
                await this.context.octokit.issues.removeLabel(
                    this.context.issue({
                        name: "Pending"
                    })
                );
            }
        }
    }

}
