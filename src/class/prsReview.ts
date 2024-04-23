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
     * @param {string} body
     * @param {string[]} labels
     * @param {string[]} [removeLabel]
     * @async
     * @returns {Promise<void>}
     */
    private async createReview(body: string, labels: string[], removeLabel?: string[]): Promise<void> {
        await this.context.octokit.pulls.createReview({
            repo: this.context.payload.repository.name,
            owner: this.context.payload.repository.owner.login,
            pull_number: this.context.payload.pull_request.number,
            body: body,
            event: "COMMENT"
        });

        await this.context.octokit.issues.addLabels(
            this.context.issue({
                labels: labels
            })
        );

        if (removeLabel) {
            removeLabel.forEach((label) => {
                new Promise<void>((resolve, reject) => {
                    this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: label
                        })
                    ).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    console.error(err);
                });
            });
        }
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async userPRs(): Promise<void> {
        if (this.context.payload.sender.login === this.context.payload.repository.owner.login) {
            // Owner
            if (this.context.payload.review.state === "approved") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} your pull request has been approved by @${this.context.payload.review.user.login}, please type \`Ready to merge\` for merging`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this.context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else if (this.context.payload.pull_request.author_association === "MEMBER" || this.context.payload.pull_request.author_association === "COLLABORATOR") {
            if (this.context.payload.review.state === "approved") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} your pull request has been approved by \`[MAINTAINER]\`@${this.context.payload.review.user.login}, please type \`Ready to merge\` for merging`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this.context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else {
            // Others Approved
            if (this.context.payload.review.state === "approved") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} your pull request has been approved by @${this.context.payload.review.user.login}, even though please wait for the \`MAINTAINERS\`/\`CODEOWNERS\` to review`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Pending"]);
                }
            } else if (this.context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Others Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Others Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        }
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async botPRs(): Promise<void> {
        if (this.context.payload.sender.login === this.context.payload.repository.owner.login) {
            // Owner
            if (this.context.payload.review.state === "approved") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} Pull request has been approved by \`[OWNER]\`@${this.context.payload.review.user.login}, please type \`Merge\` for merging @${this.context.payload.review.user.login}`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this.context.payload.review.state === "changes_requested") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} your pull request has requested changes by \`[OWNER]\`@${this.context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else if (this.context.payload.pull_request.author_association === "MEMBER" || this.context.payload.pull_request.author_association === "COLLABORATOR") {
            if (this.context.payload.review.state === "approved") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} Pull request has been approved by \`[MAINTAINER]\`@${this.context.payload.review.user.login}, please type \`Merge\` for merging @${this.context.payload.review.user.login}`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this.context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by \`[MAINTAINER]\`@${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I"m merging this PR, thanks!`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else {
            // Others Approved
            if (this.context.payload.review.state === "approved") {
                const reviewMessage = `@${this.context.payload.pull_request.user.login} your pull request has been approved by @${this.context.payload.review.user.login}, even though please wait for the \`MAINTAINERS\`/\`CODEOWNERS\` to review`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Pending"]);
                }
            } else if (this.context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this.context.payload.review.user.login}. PING! @${this.context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this.context.payload.pull_request.labels.find((a) => a.name === "Others Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Others Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        }
    }
}
