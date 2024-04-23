import Context, { octokit } from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class PullRequestOpen {

    /**
     * @private
     * @type Context<"pull_request.opened">
     */
    private context: Context<"pull_request.opened">;

    /**
     * @constructor
     * @param {Context<"pull_request.opened">} context
     */
    constructor(context: Context<"pull_request.opened">) {
        this.context = context;
    }

    /**
     * @private
     * @async
     * @returns {Promise<void>}
     */
    private async checkChanges(): Promise<void> {
        let totalChanges: number = 0;
        await this.context.octokit.pulls.listFiles({
            owner: this.context.payload.repository.owner.login,
            repo: this.context.payload.repository.name,
            pull_number: this.context.payload.number
        }).then(async (res) => {
            const filterFiles = res.data.filter((a) => a.filename !== "package.json" && a.filename !== "package-lock.json");
            for (let i = 0; i < filterFiles.length; i++) {
                totalChanges += filterFiles[i].changes;
            }

            if (totalChanges > 1000) {
                await this.context.octokit.issues.addLabels(
                    this.context.issue({
                        labels: ["Huge Changes"]
                    })
                );
            }
        });
    }

    /**
     * @private
     * @async
     * @returns {Promise<void>}
     */
    private async giveLabels(): Promise<void> {
        const fileLabels: string[] = [];
        const filteredlabels: string[] = [];
        await this.context.octokit.pulls.listFiles({
            owner: "Typeslint",
            repo: "github-AutoResponse",
            pull_number: this.context.payload.number
        }).then(async (res) => {
            const listFiles = res.data.map((a) => a.filename);
            for (let i = 0; i < listFiles.length; i++) {
                if (/src\/index/i.test(listFiles[i])) {
                    fileLabels.push("Core");
                } else if (/src\/class\/prs/i.test(listFiles[i])) {
                    fileLabels.push("lib: Pull Request");
                } else if (/src\/class\/issues/i.test(listFiles[i])) {
                    fileLabels.push("lib: Issues");
                } else if (/src\/class\/push/i.test(listFiles[i])) {
                    fileLabels.push("lib: Push");
                } else if (/src\/class\/workflow/i.test(listFiles[i])) {
                    fileLabels.push("lib: Workflow");
                } else {
                    continue;
                }
            }

            if (fileLabels.length > 0) {
                new Set(fileLabels).forEach((a) => filteredlabels.push(a));
                await this.context.octokit.issues.addLabels(
                    this.context.issue({
                        labels: filteredlabels
                    })
                );
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
    public async open(): Promise<void> {

        if (this.context.payload.sender.login !== this.context.payload.repository.owner.login) {
            const propened = this.context.issue({
                body: `Hello @${this.context.payload.sender.login} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
            });
            console.log("Pull request opened");
            await this.context.octokit.issues.createComment(propened);
            await this.context.octokit.issues.addLabels(
                this.context.issue({
                    labels: ["Pending"]
                })
            );
            await this.checkChanges();
        } else {
            const propened = this.context.issue({
                body: `PRs by \`[OWNER]\`${this.context.payload.pull_request.user.login}!`
            });
            console.log("Pull request opened");
            await this.context.octokit.issues.createComment(propened);
            await this.context.octokit.issues.addLabels(
                this.context.issue({
                    labels: ["Pending"]
                })
            );
            await this.checkChanges();
        }
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async openCore(): Promise<void> {
        const propened = this.context.issue({
            body: `Hello @${this.context.payload.sender.login} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
        });
        console.log("Pull request opened");
        await this.context.octokit.issues.createComment(propened);
        await this.context.octokit.issues.addLabels(
            this.context.issue({
                labels: ["Pending"]
            })
        );
        await this.giveLabels();
        await this.checkChanges();
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
                        return;
                    } else {
                        await this.context.octokit.issues.addLabels(
                            this.context.issue({
                                labels: ["Config Invalid"]
                            })
                        );
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
