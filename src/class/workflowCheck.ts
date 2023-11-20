import Context, { octokit } from "../index";

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
    private context: Context<"workflow_run.completed">;

    /**
     * @constructor
     * @param {Context<"workflow_run.completed">} context
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
    public async checkUserCI(): Promise<void> {
        await octokit.rest.pulls.list({
            owner: this.context.payload.repository.owner.login,
            repo: this.context.payload.repository.name,
            head: `${this.context.payload.workflow_run.actor.login}:${this.context.payload.workflow_run.head_branch}`,
            state: "open"
        }).then(async (res) => {
            const prsNumber = res.data[0].number;
            if (this.context.payload.workflow_run.conclusion == "success") {
                await this.context.octokit.pulls.get({
                    owner: this.context.payload.repository.owner.login,
                    repo: this.context.payload.repository.name,
                    pull_number: prsNumber
                }).then(async (res) => {
                    if (res.data.labels.find(a => a.name == "CI Failed")) {
                        await this.context.octokit.issues.removeLabel(
                            this.context.issue({
                                owner: this.context.payload.repository.owner.login,
                                repo: this.context.payload.repository.name,
                                issue_number: prsNumber,
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
                        issue_number: prsNumber,
                        labels: ["CI Failed"]
                    })
                );
                await this.context.octokit.issues.createComment(
                    this.context.issue({
                        owner: this.context.payload.repository.owner.login,
                        repo: this.context.payload.repository.name,
                        issue_number: prsNumber,
                        body: `CI build failed! for more information please review the [logs](${this.context.payload.workflow_run.html_url}).`
                    })
                );
            } else {
                return;
            }
        });
    }

}
