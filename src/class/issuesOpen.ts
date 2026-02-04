import { Context } from "../index.js";

/**
 * @class
 * @default
 * @exports
 */
export default class IssuesOpen {

    /**
     * @private
     * @type Context<"issues.opened">
     */
    private _context: Context<"issues.opened">;

    /**
     * @constructor
     * @param {Context<"issues.opened">} context
     */
    constructor(context: Context<"issues.opened">) {
        this._context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async open(): Promise<void> {
        if (this._context.payload.sender.login !== "Muunatic") {
            const issueComment = this._context.issue({
                body: `Hello @${this._context.payload.sender.login} Thank you for submitting Issue, please wait for next notification after we review your Issue.`
            });
            console.log("Issues created");
            await this._context.octokit.rest.issues.addLabels(
                this._context.issue({
                    labels: ["Pending"]
                })
            );
            await this._context.octokit.rest.issues.createComment(issueComment);
        } else {
            return;
        }
    }

}
