import { Probot } from "probot";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export = (app: Probot) => {

  app.on("issues.opened", async (context) => {
    if (context.payload.sender.login === 'Muunatic') return
    const username = context.payload.sender.login;
    const issueComment = context.issue({
      body: `Hello @${username} Thank you for submitting Issues, please wait for next notification after we review your Issues.`,
    })
    console.log('Issues created')
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ['pending']
      })
    )
    await context.octokit.issues.createComment(issueComment)
  });

  app.on("issues.closed", async (context) => {
    const username = context.payload.sender.login
    const issueClosed = context.issue({
      body: `Issues ditutup oleh @${username}.`
    })
    console.log('Issues closed')
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ['closed']
      })
    )
    await context.octokit.issues.removeLabel(
      context.issue({
        name: 'pending'
      })
    )
    if (context.payload.sender.login === 'Muunatic') return
    await context.octokit.issues.createComment(issueClosed)
  });

  app.on("pull_request.opened", async (context) => {
    if (context.payload.sender.login === 'Muunatic') return
    const username = context.payload.sender.login
    const propened = context.issue({
      body: `Hello @${username} Thank you for submitting Pull Request, please wait for next notification after we review your Pull Request`
    })
    console.log('Pull request opened')
    await context.octokit.issues.createComment(propened)
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ['pending']
      })
    )
    if (context.payload.pull_request.state === 'failure') { 
      const Failedcomment = context.issue({
        body: `@${username} CI Failed, Please fix code before merge.`
      })
      await context.octokit.issues.createComment(Failedcomment)
      await context.octokit.issues.addLabels(
        context.issue({
          labels: ['CI Failed']
        })
      )
    }
  });

  app.on("pull_request.closed", async (context) => {
    if (context.payload.sender.login === 'Muunatic') return
    const username = context.payload.sender.login
    const prClosed = context.issue({
      body: `Pull request ditutup oleh @${username}.`
    })
    console.log('Pull request closed')
    await context.octokit.issues.createComment(prClosed)
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ['closed']
      })
    )
    await context.octokit.issues.removeLabel(
      context.issue({
        name: 'pending'
      })
    )
  });

};
