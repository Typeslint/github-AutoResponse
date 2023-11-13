import Context from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class WorkflowCheck {

    /**
     * @private
     * @type Context<"issues.closed">
     */
    private context: Context<"workflow_run.completed">;

    /**
     * @constructor
     * @param {Context<"issues.closed">} context
     */
    constructor(context: Context<"workflow_run.completed">) {
        this.context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async checkCI(): Promise<void> {
        if (this.context.payload.workflow_run.conclusion == "failure") {
            await this.context.octokit.issues.addLabels(
                this.context.issue({
                    owner: this.context.payload.repository.owner.login,
                    repo: this.context.payload.repository.name,
                    issue_number: this.context.payload.workflow_run.pull_requests[0].number,
                    labels: ["CI Failed"]
                })
            );
            await this.context.octokit.issues.createComment(
                this.context.issue({
                    owner: this.context.payload.repository.owner.login,
                    repo: this.context.payload.repository.name,
                    issue_number: this.context.payload.workflow_run.pull_requests[0].number,
                    body: `CI build failed! for more information please review the [logs](${this.context.payload.workflow_run.html_url}).`
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
    public async CheckUserCI(): Promise<void> {
        if (this.context.payload.workflow_run.conclusion == "success") {
            await this.context.octokit.pulls.get({
                owner: this.context.payload.repository.owner.login,
                repo: this.context.payload.repository.name,
                pull_number: this.context.payload.workflow_run.pull_requests[0].number
            }).then(async (res) => {
                if (res.data.labels.find(a => a.name == "CI Failed")) {
                    await this.context.octokit.issues.removeLabel(
                        this.context.issue({
                            owner: this.context.payload.repository.owner.login,
                            repo: this.context.payload.repository.name,
                            issue_number: this.context.payload.workflow_run.pull_requests[0].number,
                            name: "CI Failed"
                        })
                    );
                    console.log("CI Passed!");
                } else {
                    return;
                }
            });
        } else if (this.context.payload.workflow_run.conclusion == "failure") {
            console.log("CI Failure!");
            await this.context.octokit.issues.addLabels(
                this.context.issue({
                    owner: this.context.payload.repository.owner.login,
                    repo: this.context.payload.repository.name,
                    issue_number: this.context.payload.workflow_run.pull_requests[0].number,
                    labels: ["CI Failed"]
                })
            );
            await this.context.octokit.issues.createComment(
                this.context.issue({
                    owner: this.context.payload.repository.owner.login,
                    repo: this.context.payload.repository.name,
                    issue_number: this.context.payload.workflow_run.pull_requests[0].number,
                    body: `CI build failed! for more information please review the [logs](${this.context.payload.workflow_run.html_url}).`
                })
            );
        } else {
            return;
        }
    }
}
