import fetch from "node-fetch";
import { Probot } from "probot";
import { Octokit } from "octokit";
import { token } from "./data/config";
import { getUserData, getEvent } from "./structures/interface";
require("dotenv").config();
require("./structures/listener");

const octokit = new Octokit({auth: token});

module.exports = (app: Probot) => {

    app.on("push", async (context) => {
        let event1: string;
        let event2: string;
        let event3: string;
        let event4: string;
        let event5: string;
        async function userActivity() {
            const arrayActivity: getUserData = {"userData": []};
            await fetch('https://api.github.com/users/Muunatic/events/public', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }).then((res) => {
                return res.json();
            }).then((res: [getEvent]) => {
                let i: number;
                for (i = 0; i < res.length; i++) {
                    if (res[i].type == "PushEvent") {
                        if (arrayActivity.userData.length < 5) {
                            arrayActivity.userData.push({event: `Commit on [${res[i].payload.head.slice(0, 7)}](https://github.com/${res[i].repo.name}/commit/${res[i].payload.commits[0].sha}) in [${res[i].repo.name}](https://github.com/${res[i].repo.name})`});
                        } else {
                            break;
                        }
                    } else if (res[i].type == "PullRequestEvent") {
                        if (res[i].payload.pull_request.user.login == "Muunatic") {
                            if (arrayActivity.userData.length < 5) {
                                arrayActivity.userData.push({event: `Pull Request on [\#${res[i].payload.pull_request.number.toString()}](https://github.com/${res[i].repo.name}/pull/${res[i].payload.pull_request.number}) in [${res[i].repo.name}](https://github.com/${res[i].repo.name})`});
                            } else {
                                break;
                            }
                        } else {
                            continue;
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
        if (context.payload.repository.owner.login == "Muunatic") {
            if (context.payload.sender.login == "Muunatic") {
                await userActivity();
                await context.octokit.repos.getContent({
                    owner: "Muunatic",
                    repo: "Muunatic",
                    path: "README.MD",
                    ref: "main"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }).then(async (res: any) => {
                    const textcontent = `# ɢɪᴛʜᴜʙ sᴛᴀᴛs  <p align="left"> <a href="https://github-readme-stats-rongronggg9.vercel.app/api?username=Muunatic&show_icons=true&count_private=true&include_all_commits=true&theme=tokyonight&custom_title=Muunatic%20GitHub%20Stats&hide_border=true"><img src="https://github-readme-stats-rongronggg9.vercel.app/api?username=Muunatic&show_icons=true&count_private=true&include_all_commits=true&theme=tokyonight&custom_title=Muunatic%20GitHub%20Stats&hide_border=true"> </p> <p align="left"> <a href="https://github-readme-stats-git-masterrstaa-rickstaa.vercel.app/api/top-langs?username=Muunatic&layout=compact&langs_count=10&theme=tokyonight&hide_border=true"><img src="https://github-readme-stats-git-masterrstaa-rickstaa.vercel.app/api/top-langs?username=Muunatic&layout=compact&langs_count=10&theme=tokyonight&hide_border=true"> </p> \nUpdated ${new Date().toUTCString()} \n\n1. ${event1}\n2. ${event2}\n3. ${event3}\n4. ${event4}\n5. ${event5}`;
                    await context.octokit.repos.createOrUpdateFileContents({
                        content: Buffer.from(textcontent, "utf-8").toString("base64"),
                        path: "README.md",
                        message: "Update Activities ✔️",
                        owner: "Muunatic",
                        repo: "Muunatic",
                        branch: "main",
                        sha: res.data.sha
                    });
                });
            }
        }
    });

    // Issues opened
    app.on("issues.opened", async (context) => {
        if (context.payload.sender.login === 'Muunatic') return;
        const username = context.payload.sender.login;
        const issueComment = context.issue({
            body: `Hello @${username} Thank you for submitting Issues, please wait for next notification after we review your Issues.`
        });
        console.log('Issues created');
        await context.octokit.issues.addLabels(
            context.issue({
                labels: ['Pending']
            })
        );
        await context.octokit.issues.createComment(issueComment);
    });

    // Issues closed
    app.on("issues.closed", async (context) => {
        const username = context.payload.sender.login;
        const issueClosed = context.issue({
            body: `Issue closed by @${username}.`
        });
        console.log('Issues closed');
        await context.octokit.issues.addLabels(
            context.issue({
                labels: ['closed']
            })
        );
        await context.octokit.issues.removeLabel(
            context.issue({
                name: 'Pending'
            })
        );
        await context.octokit.issues.createComment(issueClosed);
    });

    // Pull request openened
    app.on("pull_request.opened", async (context) => {
        if (context.payload.sender.type == "User") {
            if (context.payload.sender.login != context.payload.repository.owner.login) {
                if (context.payload.repository.html_url == "https://github.com/Muunatic/github-AutoResponse") {
                    await context.octokit.pulls.listFiles({
                        owner: 'Muunatic',
                        repo: 'github-AutoResponse',
                        pull_number: context.payload.number
                    }).then((res) => {
                        return res.data;
                    }).then(async (data) => {
                        if (data.find(a => a.filename == "src/index.ts")) {
                            const username = context.payload.sender.login;
                            const propened = context.issue({
                                body: `Hello @${username} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
                            });
                            console.log('Pull request opened');
                            await context.octokit.issues.createComment(propened);
                            await context.octokit.issues.addLabels(
                                context.issue({
                                    labels: ['Pending', 'Core']
                                })
                            );
                            let shaRef: string;
                            await octokit.rest.pulls.get({
                                owner: 'Muunatic',
                                repo: 'github-AutoResponse',
                                pull_number: context.payload.number
                            }).then(async (res) => {
                                shaRef = res.data.head.sha;
                                await octokit.rest.repos.getContent({
                                    owner: 'Muunatic',
                                    repo: 'github-AutoResponse',
                                    ref: shaRef,
                                    path: "tsconfig.json"
                                }).then(async (res) => {
                                    if ("content" in res.data) {
                                        const textContent:string = res.data.content;
                                        const decodeContent:string = Buffer.from(textContent, "base64").toString("utf-8");
                                        if (decodeContent.includes('"noImplicitAny": true') && decodeContent.includes('"noImplicitThis": true') && decodeContent.includes('"strictFunctionTypes": true') && decodeContent.includes('"strictNullChecks": true')) {
                                            return;
                                        } else {
                                            await context.octokit.issues.addLabels(
                                                context.issue({
                                                    labels: ['Config Invalid']
                                                })
                                            );
                                            const configInvalid = context.issue({
                                                body: `[tsconfig](${res.data.html_url}) need [*noImplicitAny*, *noImplicitThis*, *strictFunctionTypes*, *strictNullChecks*] to true value`
                                            });
                                            await context.octokit.issues.createComment(configInvalid);
                                        }
                                    } else {
                                        return;
                                    }
                                });
                            });
                        } else {
                            return;
                        }
                    });
                } else {
                    const username = context.payload.sender.login;
                    const propened = context.issue({
                        body: `Hello @${username} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
                    });
                    console.log('Pull request opened');
                    await context.octokit.issues.createComment(propened);
                    await context.octokit.issues.addLabels(
                        context.issue({
                            labels: ['Pending']
                        })
                    );
                }
            } else {
                const propened = context.issue({
                    body: `PRs by \`[OWNER]\`${context.payload.pull_request.user.login}!`
                });
                console.log('Pull request opened');
                await context.octokit.issues.createComment(propened);
                await context.octokit.issues.addLabels(
                    context.issue({
                        labels: ['Pending']
                    })
                );
            }
        } else {
            return;
        }
    });

    // Pull request comment
    app.on("pull_request_review.submitted", async (context) => {
        if (context.payload.sender.type == "User") {
            switch (context.payload.pull_request.user.type) {
                case "User":
                    if (context.payload.sender.login == context.payload.repository.owner.login) {
                        // Owner
                        if (context.payload.review.state == "approved") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `@${context.payload.pull_request.user.login} your pull request has been approved by @${context.payload.review.user.login}, please type \`Ready to merge\` for merging`,
                                event: "COMMENT"
                            });
                            if (context.payload.pull_request.labels.find(a => a.name == "Requested Changes")) {
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Requested Changes'
                                    })
                                );
                                console.log('Label removed');
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            }
                        } else if (context.payload.review.state == "changes_requested") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: ``,
                                event: "COMMENT"
                            });
                            if (context.payload.pull_request.labels.find(a => a.name == "Approved")) {
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Approved'
                                    })
                                );
                                console.log('Label removed');
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Requested Changes']
                                    })
                                );
                                console.log('PRs Requested Changes');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Requested Changes']
                                    })
                                );
                                console.log('PRs Requested Changes');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            }
                        }
                    } else {
                        // Others Approved
                        if (context.payload.review.state == "approved") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `@${context.payload.pull_request.user.login} your pull request has been approved by @${context.payload.review.user.login}, even though please wait for the \`CODEOWNERS\` to review`,
                                event: "COMMENT"
                            });
                            if (context.payload.pull_request.labels.find(a => a.name == "Requested Changes")) {
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Requested Changes'
                                    })
                                );
                                console.log('Label removed');
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Others Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Others Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            }
                        } else if (context.payload.review.state == "changes_requested") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `Pull request has requested changes by @${context.payload.review.user.login}. PING! @${context.payload.repository.owner.login} Please address their comments before I'm merging this PR, thanks!`,
                                event: "COMMENT"
                            });
                            await context.octokit.issues.addLabels(
                                context.issue({
                                    labels: ['Requested Changes']
                                })
                            );
                            console.log('PRs Requested Changes');
                            await context.octokit.issues.removeLabel(
                                context.issue({
                                    name: 'Pending'
                                })
                            );
                        }
                    }
                    break;
                case "Bot":
                    if (context.payload.sender.login == context.payload.repository.owner.login) {
                        // Owner
                        if (context.payload.review.state == "approved") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `@${context.payload.pull_request.user.login} Pull request has been approved by @${context.payload.review.user.login}, please type \`Merge\` for merging @${context.payload.review.user.login}`,
                                event: "COMMENT"
                            });
                            if (context.payload.pull_request.labels.find(a => a.name == "Requested Changes")) {
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Requested Changes'
                                    })
                                );
                                console.log('Label removed');
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            }
                        } else if (context.payload.review.state == "changes_requested") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `@${context.payload.pull_request.user.login} your pull request has requested changes by @${context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`,
                                event: "COMMENT"
                            });
                            if (context.payload.pull_request.labels.find(a => a.name == "Approved")) {
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Approved'
                                    })
                                );
                                console.log('Label removed');
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Requested Changes']
                                    })
                                );
                                console.log('PRs Requested Changes');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Requested Changes']
                                    })
                                );
                                console.log('PRs Requested Changes');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            }
                        }
                    } else {
                        // Others Approved
                        if (context.payload.review.state == "approved") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `@${context.payload.pull_request.user.login} your pull request has been approved by @${context.payload.review.user.login}, even though please wait for the \`CODEOWNERS\` to review`,
                                event: "COMMENT"
                            });
                            if (context.payload.pull_request.labels.find(a => a.name == "Requested Changes")) {
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Requested Changes'
                                    })
                                );
                                console.log('Label removed');
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Others Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Others Approved']
                                    })
                                );
                                console.log('PRs Approved');
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            }
                        } else if (context.payload.review.state == "changes_requested") {
                            await context.octokit.pulls.createReview({
                                repo: context.payload.repository.name,
                                owner: context.payload.repository.owner.login,
                                pull_number: context.payload.pull_request.number,
                                body: `@${context.payload.pull_request.user.login} your pull request has requested changes by repository contributor @${context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`,
                                event: "COMMENT"
                            });
                            await context.octokit.issues.addLabels(
                                context.issue({
                                    labels: ['Requested Changes']
                                })
                            );
                            console.log('PRs Requested Changes');
                            await context.octokit.issues.removeLabel(
                                context.issue({
                                    name: 'Pending'
                                })
                            );
                        }
                    }
                    break;
                default:
                    return;
            }
        } else {
            return;
        }
    });

    // re-requested reviewer
    app.on("pull_request.synchronize", async (context) => {
        if (context.payload.pull_request.user.type == "User") {
            if (context.payload.repository.homepage == "https://github.com/Muunatic/github-AutoResponse") {
                let shaRef: string;
                await octokit.rest.pulls.get({
                    owner: 'Muunatic',
                    repo: 'github-AutoResponse',
                    pull_number: context.payload.number
                }).then(async (res) => {
                    shaRef = res.data.head.sha;
                    await octokit.rest.repos.getContent({
                        owner: 'Muunatic',
                        repo: 'github-AutoResponse',
                        ref: shaRef,
                        path: "tsconfig.json"
                    }).then(async (res) => {
                        if ("content" in res.data) {
                            const textContent:string = res.data.content;
                            const decodeContent:string = Buffer.from(textContent, "base64").toString("utf-8");
                            if (decodeContent.includes('"noImplicitAny": true') && decodeContent.includes('"noImplicitThis": true') && decodeContent.includes('"strictFunctionTypes": true') && decodeContent.includes('"strictNullChecks": true')) {
                                await context.octokit.issues.listLabelsOnIssue({
                                    owner: context.payload.repository.owner.login,
                                    repo: context.payload.repository.name,
                                    issue_number: context.payload.pull_request.number
                                }).then(async (res) => {
                                    if (res.data.find(a => a.name == "Config Invalid")) {
                                        await context.octokit.issues.removeLabel(
                                            context.issue({
                                                name: 'Config Invalid'
                                            })
                                        );
                                    } else {
                                        return;
                                    }
                                });
                            } else {
                                const configInvalid = context.issue({
                                    body: `[tsconfig](${res.data.html_url}) need [*noImplicitAny*, *noImplicitThis*, *strictFunctionTypes*, *strictNullChecks*] to true value`
                                });
                                await context.octokit.issues.createComment(configInvalid);
                            }
                        } else {
                            return;
                        }
                    });
                });
            }
            await context.octokit.issues.listLabelsOnIssue({
                owner: context.payload.repository.owner.login,
                repo: context.payload.repository.name,
                issue_number: context.payload.pull_request.number
            }).then(async (res) => {
                let i: number;
                if (res.data.find(a => a.name == "Requested Changes")) {
                    await context.octokit.pulls.listReviews({
                        owner: context.payload.repository.owner.login,
                        repo: context.payload.repository.name,
                        pull_number: context.payload.pull_request.number
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
                                        await context.octokit.pulls.requestReviewers({
                                            owner: context.payload.repository.owner.login,
                                            repo: context.payload.repository.name,
                                            pull_number: context.payload.pull_request.number,
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
                        await context.octokit.issues.createComment(
                            context.issue({
                                owner: context.payload.repository.owner.login,
                                repo: context.payload.repository.name,
                                issue_number: context.payload.pull_request.number,
                                body: `PING! ${tagReviewers.join(", ")}. The author has pushed new commits since your last review. please review @${context.payload.sender.login} new commit before merge, thanks!`
                            })
                        );
                        await context.octokit.issues.listLabelsOnIssue({
                            owner: context.payload.repository.owner.login,
                            repo: context.payload.repository.name,
                            issue_number: context.payload.pull_request.number
                        }).then(async (res) => {
                            if (res.data.find(a => a.name == "Requested Changes")) {
                                context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Requested Changes'
                                    })
                                );
                            } else {
                                return;
                            }
                        });
                    });
                } else if (res.data.find(a => a.name == "Approved")) {
                    return;
                }
            });
        } else {
            return;
        }
    });

    // Check CI
    app.on("workflow_run.completed", async (context) => {
        if (context.payload.workflow_run.event == "pull_request") {
            if (context.payload.sender.type == "User") {
                if (context.payload.workflow_run.conclusion == "success") {
                    await context.octokit.pulls.get({
                        owner: context.payload.repository.owner.login,
                        repo: context.payload.repository.name,
                        pull_number: context.payload.workflow_run.pull_requests[0].number
                    }).then(async (res) => {
                        if (res.data.labels.find(a => a.name == "CI Failed")) {
                            await context.octokit.issues.removeLabel(
                                context.issue({
                                    owner: context.payload.repository.owner.login,
                                    repo: context.payload.repository.name,
                                    issue_number: context.payload.workflow_run.pull_requests[0].number,
                                    name: 'CI Failed'
                                })
                            );
                            console.log('CI Passed!');
                        } else {
                            return;
                        }
                    });
                } else if (context.payload.workflow_run.conclusion == "failure") {
                    console.log('CI Failure!');
                    await context.octokit.issues.addLabels(
                        context.issue({
                            owner: context.payload.repository.owner.login,
                            repo: context.payload.repository.name,
                            issue_number: context.payload.workflow_run.pull_requests[0].number,
                            labels: ['CI Failed']
                        })
                    );
                    await context.octokit.issues.createComment(
                        context.issue({
                            owner: context.payload.repository.owner.login,
                            repo: context.payload.repository.name,
                            issue_number: context.payload.workflow_run.pull_requests[0].number,
                            body: `CI build failed! for more information please review the [logs](${context.payload.workflow_run.html_url}).`
                        })
                    );
                } else {
                    return;
                }
            } else {
                if (context.payload.workflow_run.conclusion == "failure") {
                    await context.octokit.issues.addLabels(
                        context.issue({
                            owner: context.payload.repository.owner.login,
                            repo: context.payload.repository.name,
                            issue_number: context.payload.workflow_run.pull_requests[0].number,
                            labels: ['CI Failed']
                        })
                    );
                    await context.octokit.issues.createComment(
                        context.issue({
                            owner: context.payload.repository.owner.login,
                            repo: context.payload.repository.name,
                            issue_number: context.payload.workflow_run.pull_requests[0].number,
                            body: `CI build failed! for more information please review the [logs](${context.payload.workflow_run.html_url}).`
                        })
                    );
                } else {
                    return;
                }
            }
        } else {
            return;
        }
    });

    // Comment created
    app.on("issue_comment.created", async (context) => {
        if (context.payload.comment.user.type == "User") {
            switch (context.payload.issue.user.type) {
                case "User":
                        // Merge pull request
                        if (context.payload.comment.body.toLowerCase() == "ready to merge") {
                            if (context.payload.issue.user.login == context.payload.comment.user.login) {
                                let i: number;
                                for (i = 0; i < context.payload.issue.labels.length; i++) {
                                    if (context.payload.issue.labels[i].name == "Approved") {
                                        console.log("Merging");
                                        await context.octokit.pulls.merge({
                                            repo: context.payload.repository.name,
                                            owner: context.payload.repository.owner.login,
                                            pull_number: context.payload.issue.number,
                                            commit_title: `Merge PR #${context.payload.issue.number} ${context.payload.issue.title}`,
                                            commit_message: context.payload.issue.title
                                        });
                                        console.log("Merged!");
                                        await context.octokit.issues.createComment(
                                            context.issue({
                                                body: `Merged by ${context.payload.comment.user.login}!`
                                            })
                                        );
                                        break;
                                    } else if (context.payload.issue.labels[i].name == "Requested Changes") {
                                        console.log('PRs Blocked');
                                        await context.octokit.issues.createComment(
                                            context.issue({
                                                body: `Merging blocked because PRs has requested changes! @${context.payload.comment.user.login}`
                                            })
                                        );
                                        break;
                                    } else {
                                        continue;
                                    }
                                }
                            } else {
                                return;
                            }
                        }

                        if (context.payload.comment.body.toLowerCase() == "merge") {
                            if (context.payload.sender.login == context.payload.repository.owner.login) {
                                await context.octokit.pulls.merge({
                                    repo: context.payload.repository.name,
                                    owner: context.payload.repository.owner.login,
                                    pull_number: context.payload.issue.number,
                                    commit_title: `Merge PR #${context.payload.issue.number} ${context.payload.issue.title}`,
                                    commit_message: context.payload.issue.title
                                });
                                console.log("Merged!");
                                await context.octokit.issues.createComment(
                                    context.issue({
                                        body: `Merged by \`[OWNER]\`${context.payload.comment.user.login}!`
                                    })
                                );
                                await context.octokit.issues.addLabels(
                                    context.issue({
                                        labels: ['Owner Merge']
                                    })
                                );
                                await context.octokit.issues.removeLabel(
                                    context.issue({
                                        name: 'Pending'
                                    })
                                );
                            } else {
                                return;
                            }
                        }
                    break;
                case "Bot":
                        // Merge pull request
                        if (context.payload.comment.body.toLowerCase() == "ready to merge") {
                            if (context.payload.issue.user.login == context.payload.comment.user.login) {
                                let i: number;
                                for (i = 0; i < context.payload.issue.labels.length; i++) {
                                    if (context.payload.issue.labels[i].name == "Approved") {
                                        console.log("Merging");
                                        await context.octokit.pulls.merge({
                                            repo: context.payload.repository.name,
                                            owner: context.payload.repository.owner.login,
                                            pull_number: context.payload.issue.number,
                                            commit_title: `Merge PR #${context.payload.issue.number} ${context.payload.issue.title}`,
                                            commit_message: context.payload.issue.title
                                        });
                                        console.log("Merged!");
                                        await context.octokit.issues.createComment(
                                            context.issue({
                                                body: `Merged by ${context.payload.comment.user.login}!`
                                            })
                                        );
                                        break;
                                    } else if (context.payload.issue.labels[i].name == "Requested Changes") {
                                        console.log('PRs Blocked');
                                        await context.octokit.issues.createComment(
                                            context.issue({
                                                body: `Merging blocked because PRs has requested changes! @${context.payload.comment.user.login}`
                                            })
                                        );
                                        break;
                                    } else {
                                        continue;
                                    }
                                }
                            } else {
                                return;
                            }
                        }

                        if (context.payload.comment.body.toLowerCase() == "merge") {
                            if (context.payload.sender.login == context.payload.repository.owner.login) {
                                await context.octokit.pulls.merge({
                                    repo: context.payload.repository.name,
                                    owner: context.payload.repository.owner.login,
                                    pull_number: context.payload.issue.number,
                                    commit_title: `Merge PR #${context.payload.issue.number} ${context.payload.issue.title}`,
                                    commit_message: context.payload.issue.title
                                });
                                console.log("Merged!");
                                await context.octokit.issues.createComment(
                                    context.issue({
                                        body: `Merged by ${context.payload.comment.user.login}!`
                                    })
                                );
                            } else {
                                return;
                            }
                        }
                    break;
                default:
                    break;
            }
        } else {
            return;
        }
    });

};
