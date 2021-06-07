import { Probot } from "probot";

export = (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Hello, World!",
    });
    await context.octokit.issues.createComment(issueComment);
  });
};
