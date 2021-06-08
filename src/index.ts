import { Probot } from "probot";

export = (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const username = context.payload.sender.login;
    const issueComment = context.issue({
      body: `Halo @${username} terima kasih sudah melaporkan, anda akan mendapatkan notifikasi setalah kami meninjau issues.`,
    });
    console.log('Issues created')
    await context.octokit.issues.createComment(issueComment);
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ['pending']
      })
    )
  });

  app.on("issues.closed", async (context) => {
    const username = context.payload.sender.login
    const issueClosed = context.issue({
      body: `Issues ditutup oleh @${username}.`
    });
    console.log('Issues closed')
    await context.octokit.issues.createComment(issueClosed)
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