import Context from "../index";

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
    private context: Context<"issues.opened">;

    /**
     * @constructor
     * @param {Context<"issues.opened">} context
     */
    constructor(context: Context<"issues.opened">) {
        this.context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async open(): Promise<void> {
        if (this.context.payload.sender.login === "Muunatic") return;
        const issueComment = this.context.issue({
            body: `Hello @${this.context.payload.sender.login} Thank you for submitting Issue, please wait for next notification after we review your Issue.`
        });
        console.log("Issues created");
        await this.context.octokit.issues.addLabels(
            this.context.issue({
                labels: ["Pending"]
            })
        );
        await this.context.octokit.issues.createComment(issueComment);
    }
}
