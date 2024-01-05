import Context, { octokit } from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class PullRequestSynchronize {

    /**
     * @private
     * @type Context<"pull_request.synchronize">
     */
    private context: Context<"pull_request.synchronize">;

    /**
     * @constructor
     * @param {Context<"pull_request.synchronize">} context
     */
    constructor(context: Context<"pull_request.synchronize">) {
        this.context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async sync(): Promise<void> {
        await this.context.octokit.issues.listLabelsOnIssue({
            owner: this.context.payload.repository.owner.login,
            repo: this.context.payload.repository.name,
            issue_number: this.context.payload.pull_request.number
        }).then(async (res) => {
            let i: number;
            const prsLabels = res.data.find(a => a.name == "Requested Changes" || a.name == "Approved")?.name;
            if (prsLabels) {
                await this.context.octokit.pulls.listReviews({
                    owner: this.context.payload.repository.owner.login,
                    repo: this.context.payload.repository.name,
                    pull_number: this.context.payload.pull_request.number
                }).then(async (res) => {
                    const reviewersArray: string[] = [];
                    const tagReviewers: string[] = [];
                    for (i = 0; i < res.data.length; i++) {
                        if (res.data[i].user?.type == "User") {
                            const datastate: string[] = [
                                "CHANGES_REQUESTED",
                                "APPROVED"
                            ];
                            if (res.data[i].state == datastate.find(a => a == res.data[i].state)) {
                                if (res.data[i].user?.login != reviewersArray.find(a => a == res.data[i].user?.login)) {
                                    const username: string = res.data[i].user?.login || "";
                                    reviewersArray.push(username);
                                    tagReviewers.push("@" + username);
                                    await this.context.octokit.pulls.dismissReview({
                                        owner: this.context.payload.repository.owner.login,
                                        repo: this.context.payload.repository.name,
                                        pull_number: this.context.payload.pull_request.number,
                                        review_id: res.data[i].id,
                                        message: "This review is stale and has been dismissed."
                                    });
                                    await this.context.octokit.pulls.requestReviewers({
                                        owner: this.context.payload.repository.owner.login,
                                        repo: this.context.payload.repository.name,
                                        pull_number: this.context.payload.pull_request.number,
                                        reviewers: [username]
                                    });
                                } else {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    }
                    await this.context.octokit.issues.createComment(
                        this.context.issue({
                            owner: this.context.payload.repository.owner.login,
                            repo: this.context.payload.repository.name,
                            issue_number: this.context.payload.pull_request.number,
                            body: `PING! ${tagReviewers.join(", ")}. The author has pushed new commits since your last review. please review @${this.context.payload.sender.login} new commit before merge, thanks!`
                        })
                    );
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            name: prsLabels
                        })
                    );
                });
            } else {
                return;
            }
        });
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async synchronizeCore(): Promise<void> {
        let shaRef: string;
        await octokit.rest.pulls.get({
            owner: "Typeslint",
            repo: "github-AutoResponse",
            pull_number: this.context.payload.number
        }).then(async (res) => {
            shaRef = res.data.head.sha;
            await octokit.rest.repos.getContent({
                owner: "Typeslint",
                repo: "github-AutoResponse",
                ref: shaRef,
                path: "tsconfig.json"
            }).then(async (res) => {
                if ("content" in res.data) {
                    const textContent:string = res.data.content;
                    const decodeContent:string = Buffer.from(textContent, "base64").toString("utf-8");
                    if (decodeContent.includes("\"noImplicitAny\": true") && decodeContent.includes("\"noImplicitThis\": true") && decodeContent.includes("\"strictFunctionTypes\": true") && decodeContent.includes("\"strictNullChecks\": true")) {
                        await this.context.octokit.issues.listLabelsOnIssue({
                            owner: this.context.payload.repository.owner.login,
                            repo: this.context.payload.repository.name,
                            issue_number: this.context.payload.pull_request.number
                        }).then(async (res) => {
                            if (res.data.find(a => a.name == "Config Invalid")) {
                                await this.context.octokit.issues.removeLabel(
                                    this.context.issue({
                                        name: "Config Invalid"
                                    })
                                );
                            } else {
                                return;
                            }
                        });
                    } else {
                        const configInvalid = this.context.issue({
                            body: `[tsconfig](${res.data.html_url}) need [*noImplicitAny*, *noImplicitThis*, *strictFunctionTypes*, *strictNullChecks*] to true value`
                        });
                        await this.context.octokit.issues.createComment(configInvalid);
                    }
                } else {
                    return;
                }
            });
        });
    }

}
