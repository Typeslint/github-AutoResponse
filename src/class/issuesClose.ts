import { Context } from "../index.js";

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
    private _context: Context<"issues.closed">;

    /**
     * @constructor
     * @param {Context<"issues.closed">} context
     */
    constructor(context: Context<"issues.closed">) {
        this._context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async closed(): Promise<void> {
        const issueClosed = this._context.issue({
            body: `Issue closed by @${this._context.payload.sender.login}.`
        });
        console.log("Issues closed");
        await this._context.octokit.rest.issues.addLabels(
            this._context.issue({
                labels: ["Closed"]
            })
        );
        await this._context.octokit.rest.issues.createComment(issueClosed);
        await this._context.octokit.rest.issues.removeLabel(
            this._context.issue({
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
        const issueClosed = this._context.issue({
            body: `Issue closed as invalid by @${this._context.payload.sender.login}.`
        });
        console.log("Issues closed");
        await this._context.octokit.rest.issues.addLabels(
            this._context.issue({
                labels: ["Closed", "Invalid"]
            })
        );
        await this._context.octokit.rest.issues.createComment(issueClosed);
        await this._context.octokit.rest.issues.removeLabel(
            this._context.issue({
                name: "Pending"
            })
        );
        await this._context.octokit.rest.issues.lock({
            owner: this._context.payload.repository.owner.login,
            repo: this._context.payload.repository.name,
            issue_number: this._context.payload.issue.number,
            lock_reason: "off-topic"
        });
    }

}
