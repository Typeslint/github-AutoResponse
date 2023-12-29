import Context from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class IssuesClose {

    /**
     * @private
     * @type Context<"issues.closed">
     */
    private context: Context<"issues.closed">;

    /**
     * @constructor
     * @param {Context<"issues.closed">} context
     */
    constructor(context: Context<"issues.closed">) {
        this.context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async closed(): Promise<void> {
        const issueClosed = this.context.issue({
            body: `Issue closed by @${this.context.payload.sender.login}.`
        });
        console.log("Issues closed");
        await this.context.octokit.issues.addLabels(
            this.context.issue({
                labels: ["Closed"]
            })
        );
        await this.context.octokit.issues.createComment(issueClosed);
        await this.context.octokit.issues.removeLabel(
            this.context.issue({
                name: "Pending"
            })
        );
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async invalid(): Promise<void> {
        const issueClosed = this.context.issue({
            body: `Issue closed as invalid by @${this.context.payload.sender.login}.`
        });
        console.log("Issues closed");
        await this.context.octokit.issues.addLabels(
            this.context.issue({
                labels: ["Closed", "Invalid"]
            })
        );
        await this.context.octokit.issues.createComment(issueClosed);
        await this.context.octokit.issues.removeLabel(
            this.context.issue({
                name: "Pending"
            })
        );
        await this.context.octokit.issues.lock({
            owner: this.context.payload.repository.owner.login,
            repo: this.context.payload.repository.name,
            issue_number: this.context.payload.issue.number,
            lock_reason: "off-topic"
        });
    }

}
