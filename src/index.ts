import { Probot } from "probot";

export = (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const username = context.payload.sender.login
    const issueComment = context.issue({
      body: `Halo @${username} terima kasih sudah mengirimkan issues`,
    });
    console.log('comment created')
    await context.octokit.issues.createComment(issueComment);
  });
};
