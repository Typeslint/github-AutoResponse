import Context from "../index";

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
    private context: Context<"issue_comment.created">;

    /**
     * @constructor
     * @param {Context<"issue_comment.created">} context
     */
    constructor(context: Context<"issue_comment.created">) {
        this.context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async userPRsComment(): Promise<void> {
        if (this.context.payload.comment.body.toLowerCase() == "ready to merge") {
            await this.context.octokit.pulls.get({
                repo: this.context.payload.repository.name,
                owner: this.context.payload.repository.owner.login,
                pull_number: this.context.payload.issue.number
            }).then(async (res) => {
                if (res.data.mergeable_state.toLowerCase() == "clean" || res.data.mergeable == true) {
                    if (this.context.payload.issue.user.login == this.context.payload.comment.user.login) {
                        let i: number;
                        for (i = 0; i < this.context.payload.issue.labels.length; i++) {
                            if (this.context.payload.issue.labels[i].name == "Approved") {
                                console.log("Merging");
                                await this.context.octokit.pulls.merge({
                                    repo: this.context.payload.repository.name,
                                    owner: this.context.payload.repository.owner.login,
                                    pull_number: this.context.payload.issue.number,
                                    commit_title: `Merge PR #${this.context.payload.issue.number} ${this.context.payload.issue.title}`,
                                    commit_message: this.context.payload.issue.title
                                });
                                console.log("Merged!");
                                await this.context.octokit.issues.createComment(
                                    this.context.issue({
                                        body: `Merged by ${this.context.payload.comment.user.login}!`
                                    })
                                );
                                break;
                            } else if (this.context.payload.issue.labels[i].name == "Requested Changes") {
                                console.log("PRs Blocked");
                                await this.context.octokit.issues.createComment(
                                    this.context.issue({
                                        body: `Merging blocked because PRs has requested changes! @${this.context.payload.comment.user.login}`
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
                } else if (res.data.mergeable_state.toLowerCase() == "dirty" || res.data.mergeable == false) {
                    await this.context.octokit.issues.createComment(
                        this.context.issue({
                            body: `Merging blocked because PRs has merge conflict! @${this.context.payload.comment.user.login}`
                        })
                    );
                } else {
                    await this.context.octokit.issues.createComment(
                        this.context.issue({
                            body: "We apologize for the inconvenience, but it seems that Automaton processes are currently unable to proceed with merging your commit. Please wait for a moment and try merging it again."
                        })
                    );
                }
            });
        }

        if (this.context.payload.comment.body.toLowerCase() == "merge") {
            if (this.context.payload.sender.login == this.context.payload.repository.owner.login) {
                await this.context.octokit.pulls.merge({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.issue.number,
                    commit_title: `Merge PR #${this.context.payload.issue.number} ${this.context.payload.issue.title}`,
                    commit_message: this.context.payload.issue.title
                });
                console.log("Merged!");
                await this.context.octokit.issues.removeLabel(
                    this.context.issue({
                        name: "Pending"
                    })
                );
                await this.context.octokit.issues.createComment(
                    this.context.issue({
                        body: `Merged by \`[OWNER]\`${this.context.payload.comment.user.login}!`
                    })
                );
                await this.context.octokit.issues.addLabels(
                    this.context.issue({
                        labels: ["Owner Merge"]
                    })
                );
            } else if (this.context.payload.issue.author_association === "MEMBER" || this.context.payload.issue.author_association === "COLLABORATOR") {
                await this.context.octokit.pulls.merge({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.issue.number,
                    commit_title: `Merge PR #${this.context.payload.issue.number} ${this.context.payload.issue.title}`,
                    commit_message: this.context.payload.issue.title
                });
                console.log("Merged!");
                await this.context.octokit.issues.removeLabel(
                    this.context.issue({
                        name: "Pending"
                    })
                );
                await this.context.octokit.issues.createComment(
                    this.context.issue({
                        body: `Merged by \`[MAINTAINER]\`${this.context.payload.comment.user.login}!`
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
        if (this.context.payload.comment.body.toLowerCase() == "merge") {
            if (this.context.payload.sender.login == this.context.payload.repository.owner.login) {
                await this.context.octokit.pulls.merge({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.issue.number,
                    commit_title: `Merge PR #${this.context.payload.issue.number} ${this.context.payload.issue.title}`,
                    commit_message: this.context.payload.issue.title
                });
                console.log("Merged!");
                await this.context.octokit.issues.removeLabel(
                    this.context.issue({
                        name: "Pending"
                    })
                );
                await this.context.octokit.issues.createComment(
                    this.context.issue({
                        body: `Merged by \`[OWNER]\`${this.context.payload.comment.user.login}!`
                    })
                );
                await this.context.octokit.issues.addLabels(
                    this.context.issue({
                        labels: ["Owner Merge"]
                    })
                );
            } else if (this.context.payload.issue.author_association === "MEMBER" || this.context.payload.issue.author_association === "COLLABORATOR") {
                await this.context.octokit.pulls.merge({
                    repo: this.context.payload.repository.name,
                    owner: this.context.payload.repository.owner.login,
                    pull_number: this.context.payload.issue.number,
                    commit_title: `Merge PR #${this.context.payload.issue.number} ${this.context.payload.issue.title}`,
                    commit_message: this.context.payload.issue.title
                });
                console.log("Merged!");
                await this.context.octokit.issues.removeLabel(
                    this.context.issue({
                        name: "Pending"
                    })
                );
                await this.context.octokit.issues.createComment(
                    this.context.issue({
                        body: `Merged by \`[MAINTAINER]\`${this.context.payload.comment.user.login}!`
                    })
                );
            } else {
                return;
            }
        }
    }

}
