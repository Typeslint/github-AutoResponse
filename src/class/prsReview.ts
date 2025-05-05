import { Context } from "../index.js";

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
    private _context: Context<"pull_request_review.submitted">;

    /**
     * @constructor
     * @param {Context<"pull_request_review.submitted">} context
     */
    constructor(context: Context<"pull_request_review.submitted">) {
        this._context = context;
    }

    /**
     * @private
     * @async
     * @param {string} body
     * @param {string[]} labels
     * @param {string[]} [removeLabel]
     * @returns {Promise<void>}
     */
    private async createReview(body: string, labels: string[], removeLabel?: string[]): Promise<void> {
        await this._context.octokit.pulls.createReview({
            repo: this._context.payload.repository.name,
            owner: this._context.payload.repository.owner.login,
            pull_number: this._context.payload.pull_request.number,
            body: body,
            event: "COMMENT"
        });

        await this._context.octokit.issues.addLabels(
            this._context.issue({
                labels: labels
            })
        );

        if (removeLabel) {
            removeLabel.forEach((label) => {
                new Promise<void>((resolve, reject) => {
                    this._context.octokit.issues.removeLabel(
                        this._context.issue({
                            name: label
                        })
                    ).then(() => {
                        resolve();
                    }).catch((err: Error) => {
                        return reject(new Error(err.name));
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
        if (this._context.payload.sender.login === this._context.payload.repository.owner.login) {
            // Owner
            if (this._context.payload.review.state === "approved") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} your pull request has been approved by @${this._context.payload.review.user.login}, please type \`Ready to merge\` for merging`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this._context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this._context.payload.review.user.login}. PING! @${this._context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else if (this._context.payload.review.author_association === "MEMBER" || this._context.payload.review.author_association === "COLLABORATOR") {
            if (this._context.payload.review.state === "approved") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} your pull request has been approved by \`[MAINTAINER]\`@${this._context.payload.review.user.login}, please type \`Ready to merge\` for merging`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this._context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this._context.payload.review.user.login}. PING! @${this._context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else {
            // Others Approved
            if (this._context.payload.review.state === "approved") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} your pull request has been approved by @${this._context.payload.review.user.login}, even though please wait for the \`MAINTAINERS\`/\`CODEOWNERS\` to review`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Pending"]);
                }
            } else if (this._context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this._context.payload.review.user.login}. PING! @${this._context.payload.pull_request.user.login} Please address their comments before I'm merging this PR, thanks!`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Others Approved")) {
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
        const maintainers: ReadonlyArray<string> = await this._context.octokit.pulls.listReviews({
            owner: this._context.payload.repository.owner.login,
            repo: this._context.payload.repository.name,
            pull_number: this._context.payload.pull_request.number
        }).then((response) => {
            return response.data.filter((data) =>
                data.user?.login &&
                this._context.payload.review.user.login !== data.user.login &&
                data.user.type.toLowerCase() !== "bot" &&
                ["COLLABORATOR", "MEMBER", "OWNER"].includes(data.author_association)
            ).map((data) => {
                return `@${data.user?.login}`;
            });
        });

        if (this._context.payload.sender.login === this._context.payload.repository.owner.login) {
            // Owner
            if (this._context.payload.review.state === "approved") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} Pull request has been approved by \`[OWNER]\`@${this._context.payload.review.user.login}, please type \`Merge\` for merging @${this._context.payload.review.user.login}`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this._context.payload.review.state === "changes_requested") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} pull request has requested changes by \`[OWNER]\`@${this._context.payload.review.user.login}. ${maintainers.join(", ")} please address their comments before I'm merging this PR, thanks!`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else if (this._context.payload.review.author_association === "MEMBER" || this._context.payload.review.author_association === "COLLABORATOR") {
            if (this._context.payload.review.state === "approved") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} Pull request has been approved by \`[MAINTAINER]\`@${this._context.payload.review.user.login}, please type \`Merge\` for merging @${this._context.payload.review.user.login}`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Approved"], ["Pending"]);
                }
            } else if (this._context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by \`[MAINTAINER]\`@${this._context.payload.review.user.login}. ${maintainers.join(", ")} please address their comments before I'm merging this PR, thanks!`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        } else {
            // Others Approved
            if (this._context.payload.review.state === "approved") {
                const reviewMessage = `@${this._context.payload.pull_request.user.login} your pull request has been approved by @${this._context.payload.review.user.login}, even though please wait for the \`MAINTAINERS\`/\`CODEOWNERS\` to review`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Requested Changes")) {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Requested Changes", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Others Approved"], ["Pending"]);
                }
            } else if (this._context.payload.review.state === "changes_requested") {
                const reviewMessage = `Pull request has requested changes by @${this._context.payload.review.user.login}. ${maintainers.join(", ")} please address their comments before I'm merging this PR, thanks!`;
                if (this._context.payload.pull_request.labels.find((a) => a.name === "Others Approved")) {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Others Approved", "Pending"]);
                } else {
                    await this.createReview(reviewMessage, ["Requested Changes"], ["Pending"]);
                }
            }
        }
    }
}
