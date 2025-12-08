import { Context, octokit } from "../index.js";

/**
 * @class
 * @default
 * @exports
 */
export default class WorkflowCheck {

    /**
     * @private
     * @type Context<"workflow_run.completed">
     */
    private _context: Context<"workflow_run.completed">;

    /**
     * @constructor
     * @param {Context<"workflow_run.completed">} context
     */
    constructor(context: Context<"workflow_run.completed">) {
        this._context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async checkCI(): Promise<void> {
        if (this._context.payload.workflow_run.conclusion === "failure") {
            await this._context.octokit.rest.issues.addLabels(
                this._context.issue({
                    owner: this._context.payload.repository.owner.login,
                    repo: this._context.payload.repository.name,
                    issue_number: this._context.payload.workflow_run.pull_requests[0]?.number,
                    labels: ["CI Failed"]
                })
            );
            await this._context.octokit.rest.issues.createComment(
                this._context.issue({
                    owner: this._context.payload.repository.owner.login,
                    repo: this._context.payload.repository.name,
                    issue_number: this._context.payload.workflow_run.pull_requests[0]?.number,
                    body: `CI build failed! for more information please review the [logs](${this._context.payload.workflow_run.html_url}).`
                })
            );
        } else {
            return;
        }
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async checkUserCI(): Promise<void> {
        await octokit.rest.pulls.list({
            owner: this._context.payload.repository.owner.login,
            repo: this._context.payload.repository.name,
            state: "open"
        }).then(async (res) => {
            const prsNumber = res.data.find((a) => a.head.sha === this._context.payload.workflow_run.head_sha)?.number as number;
            if (this._context.payload.workflow_run.conclusion === "success") {
                console.log(this._context.payload.repository.owner.login, this._context.payload.repository.name, prsNumber);
                await this._context.octokit.rest.pulls.get({
                    owner: this._context.payload.repository.owner.login,
                    repo: this._context.payload.repository.name,
                    pull_number: prsNumber
                }).then(async (res) => {
                    if (res.data.labels.find((a) => a.name === "CI Failed")) {
                        await this._context.octokit.rest.issues.removeLabel(
                            this._context.issue({
                                owner: this._context.payload.repository.owner.login,
                                repo: this._context.payload.repository.name,
                                issue_number: prsNumber,
                                name: "CI Failed"
                            })
                        );
                    } else {
                        return;
                    }
                });
            } else if (this._context.payload.workflow_run.conclusion === "failure") {
                console.log("CI Failure!");
                await this._context.octokit.rest.issues.addLabels(
                    this._context.issue({
                        owner: this._context.payload.repository.owner.login,
                        repo: this._context.payload.repository.name,
                        issue_number: prsNumber,
                        labels: ["CI Failed"]
                    })
                );
                await this._context.octokit.rest.issues.createComment(
                    this._context.issue({
                        owner: this._context.payload.repository.owner.login,
                        repo: this._context.payload.repository.name,
                        issue_number: prsNumber,
                        body: `CI build failed! for more information please review the [logs](${this._context.payload.workflow_run.html_url}).`
                    })
                );
            } else {
                return;
            }
        });
    }

}
