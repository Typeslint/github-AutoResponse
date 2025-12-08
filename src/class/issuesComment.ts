import { Context } from "../index.js";

/**
 * @class
 * @default
 * @exports
 */
export default class IssuesComment {

    /**
     * @private
     * @type Context<"issue_comment.created">
     */
    private _context: Context<"issue_comment.created">;

    /**
     * @constructor
     * @param {Context<"issue_comment.created">} context
     */
    constructor(context: Context<"issue_comment.created">) {
        this._context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async userPRsComment(): Promise<void> {
        if (this._context.payload.comment.body.toLowerCase() === "ready to merge") {
            await this._context.octokit.rest.pulls.get({
                repo: this._context.payload.repository.name,
                owner: this._context.payload.repository.owner.login,
                pull_number: this._context.payload.issue.number
            }).then(async (res) => {
                if (res.data.mergeable_state.toLowerCase() === "clean" || res.data.mergeable === true) {
                    if (this._context.payload.issue.user.login === this._context.payload.comment.user?.login) {
                        let i: number;
                        for (i = 0; i < this._context.payload.issue.labels.length; i++) {
                            if (this._context.payload.issue.labels[i].name === "Approved") {
                                console.log("Merging");
                                await this._context.octokit.rest.pulls.merge({
                                    repo: this._context.payload.repository.name,
                                    owner: this._context.payload.repository.owner.login,
                                    pull_number: this._context.payload.issue.number,
                                    commit_title: `Merge PR #${this._context.payload.issue.number} ${this._context.payload.issue.title}`,
                                    commit_message: this._context.payload.issue.title
                                });
                                console.log("Merged!");
                                await this._context.octokit.rest.issues.createComment(
                                    this._context.issue({
                                        body: `Merged by ${this._context.payload.comment.user.login}!`
                                    })
                                );
                                break;
                            } else if (this._context.payload.issue.labels[i].name === "Requested Changes") {
                                console.log("PRs Blocked");
                                await this._context.octokit.rest.issues.createComment(
                                    this._context.issue({
                                        body: `Merging blocked because PRs has requested changes! @${this._context.payload.comment.user.login}`
                                    })
                                );
                                break;
                            } else {
                                continue;
                            }
                        }
                    } else {
                        return;
                    }
                } else if (res.data.mergeable_state.toLowerCase() === "dirty" || res.data.mergeable === false) {
                    await this._context.octokit.rest.issues.createComment(
                        this._context.issue({
                            body: `Merging blocked because PRs has merge conflict! @${this._context.payload.comment.user?.login}`
                        })
                    );
                } else {
                    await this._context.octokit.rest.issues.createComment(
                        this._context.issue({
                            body: "We apologize for the inconvenience, but it seems that Automaton processes are currently unable to proceed with merging your commit. Please wait for a moment and try merging it again."
                        })
                    );
                }
            });
        }

        if (this._context.payload.comment.body.toLowerCase() === "merge") {
            if (this._context.payload.sender.login === this._context.payload.repository.owner.login) {
                await this._context.octokit.rest.pulls.merge({
                    repo: this._context.payload.repository.name,
                    owner: this._context.payload.repository.owner.login,
                    pull_number: this._context.payload.issue.number,
                    commit_title: `Merge PR #${this._context.payload.issue.number} ${this._context.payload.issue.title}`,
                    commit_message: this._context.payload.issue.title
                });
                console.log("Merged!");
                await this._context.octokit.rest.issues.removeLabel(
                    this._context.issue({
                        name: "Pending"
                    })
                );
                await this._context.octokit.rest.issues.createComment(
                    this._context.issue({
                        body: `Merged by \`[OWNER]\`${this._context.payload.comment.user?.login}!`
                    })
                );
                await this._context.octokit.rest.issues.addLabels(
                    this._context.issue({
                        labels: ["Owner Merge"]
                    })
                );
            } else if (this._context.payload.issue.author_association === "MEMBER" || this._context.payload.issue.author_association === "COLLABORATOR") {
                await this._context.octokit.rest.pulls.merge({
                    repo: this._context.payload.repository.name,
                    owner: this._context.payload.repository.owner.login,
                    pull_number: this._context.payload.issue.number,
                    commit_title: `Merge PR #${this._context.payload.issue.number} ${this._context.payload.issue.title}`,
                    commit_message: this._context.payload.issue.title
                });
                console.log("Merged!");
                await this._context.octokit.rest.issues.removeLabel(
                    this._context.issue({
                        name: "Pending"
                    })
                );
                await this._context.octokit.rest.issues.createComment(
                    this._context.issue({
                        body: `Merged by \`[MAINTAINER]\`${this._context.payload.comment.user?.login}!`
                    })
                );
            } else {
                return;
            }
        }
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async botPRsComment(): Promise<void> {
        if (this._context.payload.comment.body.toLowerCase() === "merge") {
            if (this._context.payload.sender.login === this._context.payload.repository.owner.login) {
                await this._context.octokit.rest.pulls.merge({
                    repo: this._context.payload.repository.name,
                    owner: this._context.payload.repository.owner.login,
                    pull_number: this._context.payload.issue.number,
                    commit_title: `Merge PR #${this._context.payload.issue.number} ${this._context.payload.issue.title}`,
                    commit_message: this._context.payload.issue.title
                });
                console.log("Merged!");
                await this._context.octokit.rest.issues.removeLabel(
                    this._context.issue({
                        name: "Pending"
                    })
                );
                await this._context.octokit.rest.issues.createComment(
                    this._context.issue({
                        body: `Merged by \`[OWNER]\`${this._context.payload.comment.user?.login}!`
                    })
                );
                await this._context.octokit.rest.issues.addLabels(
                    this._context.issue({
                        labels: ["Owner Merge"]
                    })
                );
            } else if (this._context.payload.issue.author_association === "MEMBER" || this._context.payload.issue.author_association === "COLLABORATOR") {
                await this._context.octokit.rest.pulls.merge({
                    repo: this._context.payload.repository.name,
                    owner: this._context.payload.repository.owner.login,
                    pull_number: this._context.payload.issue.number,
                    commit_title: `Merge PR #${this._context.payload.issue.number} ${this._context.payload.issue.title}`,
                    commit_message: this._context.payload.issue.title
                });
                console.log("Merged!");
                await this._context.octokit.rest.issues.removeLabel(
                    this._context.issue({
                        name: "Pending"
                    })
                );
                await this._context.octokit.rest.issues.createComment(
                    this._context.issue({
                        body: `Merged by \`[MAINTAINER]\`${this._context.payload.comment.user?.login}!`
                    })
                );
            } else {
                return;
            }
        }
    }

}
