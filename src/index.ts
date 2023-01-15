import { Probot } from "probot";
require("dotenv").config();
require("./structures/listener");

module.exports = (app: Probot) => {

    // Issues opened
    app.on("issues.opened", async (context) => {
        if (context.payload.sender.login === 'Muunatic') return;
        const username = context.payload.sender.login;
        const issueComment = context.issue({
            body: `Hello @${username} Thank you for submitting Issues, please wait for next notification after we review your Issues.`,
        });
        console.log('Issues created');
        await context.octokit.issues.addLabels(
            context.issue({
                labels: ['pending']
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
        console.log('Issues closed')
        await context.octokit.issues.addLabels(
            context.issue({
                labels: ['closed']
            })
        );
        await context.octokit.issues.removeLabel(
            context.issue({
                name: 'pending'
            })
        );
        await context.octokit.issues.createComment(issueClosed);
    });

    // Pull request openened
    app.on("pull_request.opened", async (context) => {
        if (context.payload.sender.type == "Bot") {
            return;
        } else {
            const username = context.payload.sender.login;
            const propened = context.issue({
                body: `Hello @${username} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
            });
            console.log('Pull request opened');
            await context.octokit.issues.createComment(propened)
            await context.octokit.issues.addLabels(
                context.issue({
                    labels: ['pending']
                })
            );
        }
    });

    // Pull request comment
    app.on("pull_request_review.submitted", async (context) => {
        if (context.payload.sender.type == "User") {
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
                        body: `@${context.payload.pull_request.user.login} your pull request has requested changes by @${context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`,
                        event: "COMMENT",
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
                        body: `@${context.payload.pull_request.user.login} your pull request has requested changes by repository contributor @${context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`,
                        event: "COMMENT",
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
        } else {
            return;
        }
    });

    // re-requested reviewer
    app.on("pull_request.synchronize", async (context) => {
        if (context.payload.pull_request.user.type == "User") {
            context.octokit.issues.listLabelsOnIssue({
                owner: context.payload.repository.owner.login,
                repo: context.payload.repository.name,
                issue_number: context.payload.pull_request.number
            }).then(async (res) => {
                let i: number;
                if (res.data.find(a => a.name == "Requested Changes")) {
                    await context.octokit.pulls.listReviews({
                        owner: context.payload.repository.owner.login,
                        repo: context.payload.repository.name,
                        pull_number: context.payload.pull_request.number,
                    }).then(async (res) => {
                        const reviewersArray: string[] = [];
                        const tagReviewers: string[] = [];
                        for (i = 0; i < res.data.length; i++) {
                            if (res.data[i].user.type == "User") {
                                const datastate: string[] = [
                                    "CHANGES_REQUESTED",
                                    "APPROVED"
                                ];
                                if (res.data[i].state == datastate.find(a => a == res.data[i].state)) { 
                                    if (res.data[i].user.login != reviewersArray.find(a => a == res.data[i].user.login)) {
                                        const username: string = res.data[i].user.login;
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
                        context.octokit.issues.listLabelsOnIssue({
                            owner: context.payload.repository.owner.login,
                            repo: context.payload.repository.name,
                            issue_number: context.payload.pull_request.number,
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
                    context.octokit.pulls.get({
                        owner: context.payload.repository.owner.login,
                        repo: context.payload.repository.name,
                        pull_number: context.payload.workflow_run.pull_requests[0].number,
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
                    })
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
        } else {
            return;
        }
    });

};
