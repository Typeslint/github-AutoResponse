import { Probot } from "probot";

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
      const username = context.payload.sender.login;
      const propened = context.issue({
        body: `Hello @${username} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
      });

      console.log('Pull request opened')

      await context.octokit.issues.createComment(propened)
      await context.octokit.issues.addLabels(
        context.issue({
          labels: ['pending']
        })
      );
    });

    // Pull request comment
    app.on("pull_request_review.submitted", async (context) => {
        if (context.payload.review.state == "approved") {
            await context.octokit.pulls.createReview({
                repo: context.payload.repository.name,
                owner: context.payload.repository.owner.login,
                pull_number: context.payload.pull_request.number,
                body: `@${context.payload.pull_request.user.login} your pull request has been approved by @${context.payload.review.user.login}, please type \`Ready to merge\` for merging`,
                event: "COMMENT",
            });

            await context.octokit.issues.addLabels(
                context.issue({
                    labels: ['Approved']
                })
            );

            await context.octokit.issues.removeLabel(
                context.issue({
                    name: 'Pending'
                })
            );
        } else if (context.payload.review.state == "changes_requested") {
            await context.octokit.pulls.createReview({
                repo: context.payload.repository.name,
                owner: context.payload.repository.owner.login,
                pull_number: context.payload.pull_request.number,
                body: `@${context.payload.pull_request.user.login} your pull request has requested changes by @${context.payload.review.user.login}. Please address their comments before I'm merging this PR, thanks!`,
                event: "COMMENT",
            });

            await context.octokit.issues.addLabels(
                context.issue({
                    labels: ['Requested Changes']
                })
            );

            await context.octokit.issues.removeLabel(
                context.issue({
                    name: 'Pending'
                })
            );
        }
    })

    // Merge pull request
    app.on("issue_comment.created", async (context) => {

        // Merge
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
                        await context.octokit.issues.removeLabel(
                            context.issue({
                                name: 'Approved'
                            })
                        );
                        break;
                    } else if (context.payload.issue.labels[i].name == "Requested Changes") {
                        await context.octokit.issues.createComment(
                            context.issue({
                                body: `Merging blocked because reviewers has requested changes! @${context.payload.comment.user.login}`
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


    });

};
