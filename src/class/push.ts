import Context, { getEvent, getUserData, octokit, token } from "../index";

/**
 * @class
 * @default
 * @exports
 */
export default class Push {

    /**
     * @private
     * @type Context<"push">
     */
    private context: Context<"push">;

    /**
     * @constructor
     * @param {Context<"push">} context
     */
    constructor(context: Context<"push">) {
        this.context = context;
    }

    /**
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async push(): Promise<void> {
        let event1: string, event2: string, event3: string, event4: string, event5: string;
        /**
         * @function
         * @async
         * @returns {Promise<void>}
         */
        async function userActivity(): Promise<void> {
            const arrayActivity: getUserData = { "userData": [] };
            await fetch("https://api.github.com/users/Muunatic/events/public", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }).then((res: Response) => {
                return res.json();
            }).then((res: [getEvent]) => {
                let i: number;
                for (i = 0; i < res.length; i++) {
                    if (res[i].type == "PushEvent") {
                        if (arrayActivity.userData.length < 5) {
                            let commitsI: number;
                            for (commitsI = 0; commitsI < res[i].payload.commits.length; commitsI++) {
                                if (res[i].payload.commits[commitsI].author.name == "Muunatic") {
                                    if (arrayActivity.userData.length < 5) {
                                        arrayActivity.userData.push({ event: `Commit on [${res[i].payload.commits[commitsI].sha.slice(0, 7)}](https://github.com/${res[i].repo.name}/commit/${res[i].payload.commits[commitsI].sha}) in [${res[i].repo.name}](https://github.com/${res[i].repo.name})` });
                                    } else {
                                        break;
                                    }
                                } else {
                                    continue;
                                }
                            }
                        } else {
                            break;
                        }
                    } else if (res[i].type == "PullRequestEvent") {
                        if (arrayActivity.userData.length < 5) {
                            if (res[i].payload.pull_request.user.login == "Muunatic") {
                                arrayActivity.userData.push({ event: `Pull Request on [\#${res[i].payload.pull_request.number.toString()}](https://github.com/${res[i].repo.name}/pull/${res[i].payload.pull_request.number}) in [${res[i].repo.name}](https://github.com/${res[i].repo.name})` });
                            } else {
                                continue;
                            }
                        } else {
                            break;
                        }
                    } else {
                        continue;
                    }
                }
                event1 = arrayActivity.userData[0].event;
                event2 = arrayActivity.userData[1].event;
                event3 = arrayActivity.userData[2].event;
                event4 = arrayActivity.userData[3].event;
                event5 = arrayActivity.userData[4].event;
                return;
            });
        }
        if (this.context.payload.repository.owner.login == "Muunatic") {
            if (this.context.payload.sender.login == "Muunatic") {
                await userActivity();
                await this.context.octokit.repos.getContent({
                    owner: "Muunatic",
                    repo: "Muunatic",
                    path: "README.md",
                    ref: "main"
                }).then(async (res) => {
                    if ("sha" in res.data) {
                        const textcontent = `# ɢɪᴛʜᴜʙ sᴛᴀᴛs  <p align="left"> <a href="https://github-readme-stats-rongronggg9.vercel.app/api?username=Muunatic&show_icons=true&count_private=true&include_all_commits=true&theme=tokyonight&custom_title=Muunatic%20GitHub%20Stats&hide_border=true"><img src="https://github-readme-stats-rongronggg9.vercel.app/api?username=Muunatic&show_icons=true&count_private=true&include_all_commits=true&theme=tokyonight&custom_title=Muunatic%20GitHub%20Stats&hide_border=true"> </p> <p align="left"> <a href="https://github-readme-stats-git-masterrstaa-rickstaa.vercel.app/api/top-langs?username=Muunatic&layout=compact&langs_count=10&theme=tokyonight&hide_border=true"><img src="https://github-readme-stats-git-masterrstaa-rickstaa.vercel.app/api/top-langs?username=Muunatic&layout=compact&langs_count=10&theme=tokyonight&hide_border=true"> </p> \nUpdated ${new Date().toUTCString()} \n\n1. ${event1}\n2. ${event2}\n3. ${event3}\n4. ${event4}\n5. ${event5}`;
                        await this.context.octokit.repos.createOrUpdateFileContents({
                            content: Buffer.from(textcontent, "utf-8").toString("base64"),
                            path: "README.md",
                            message: "Update Readme.md",
                            owner: "Muunatic",
                            repo: "Muunatic",
                            branch: "main",
                            sha: res.data.sha
                        });
                    } else {
                        return;
                    }
                });
            } else if (this.context.payload.sender.login == "typeslint-cli[bot]") {
                if (this.context.payload.repository.name == "Muunatic") {
                    await octokit.rest.checks.create({
                        owner: "Muunatic",
                        repo: "Muunatic",
                        name: "typeslint/ci",
                        head_sha: this.context.payload.head_commit?.id,
                        status: "in_progress"
                    }).then(async (resId) => {
                        await octokit.rest.checks.update({
                            owner: "Muunatic",
                            repo: "Muunatic",
                            name: "typeslint/ci",
                            check_run_id: resId.data.id,
                            status: "completed",
                            conclusion: "success",
                            output: {
                                title: "Update Activities ✔️",
                                summary: "@" + this.context.payload.sender.login + " README Update"
                            }
                        });
                    });
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }
}
