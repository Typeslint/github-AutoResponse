import { Context, Probot } from "probot";
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { token } from "./data/config";
import { IssuesClose, IssuesComment, IssuesOpen, PRsStale, PullRequestOpen, PullRequestReview, PullRequestSynchronize, Push, WorkflowCheck } from "./structures/constant";
import { getEvent, getUserData } from "./structures/type";
import "./structures/listener";
import dotenv from "dotenv";
dotenv.config();

const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
        appId: process.env.APP_ID,
        privateKey: process.env.PRIVATE_KEY,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        installationId: 21573969
    }
});

module.exports = (app: Probot) => {

    app.on("push", async (context): Promise<void> => {
        await new Push(context).push();
    });

    app.on("issues.opened", async (context): Promise<void> => {
        await new IssuesOpen(context).open();
    });

    app.on("issue_comment.created", async (context): Promise<void> => {
        if (context.payload.comment.user.type == "User") {
            switch (context.payload.issue.user.type) {
                case "User":
                    await new IssuesComment(context).userPRsComment();
                    break;
                case "Bot":
                    await new IssuesComment(context).botPRsComment();
                    break;
                default:
                    break;
            }
        }
    });

    app.on("issues.closed", async (context): Promise<void> => {
        if (context.payload.issue.state_reason == "not_planned") {
            await new IssuesClose(context).invalid();
        } else {
            await new IssuesClose(context).closed();
        }
    });

    app.on("pull_request.opened", async (context): Promise<void> => {
        if (context.payload.sender.type == "User") {
            if (context.payload.repository.html_url == "https://github.com/Typeslint/github-AutoResponse") {
                await new PullRequestOpen(context).openCore();
            } else {
                await new PullRequestOpen(context).open();
            }
        } else {
            return;
        }
    });

    app.on("pull_request_review.submitted", async (context): Promise<void> => {
        if (context.payload.sender.type == "User") {
            switch (context.payload.pull_request.user.type) {
                case "User":
                    await new PullRequestReview(context).userPRs();
                    break;
                case "Bot":
                    await new PullRequestReview(context).botPRs();
                    break;
                default:
                    break;
            }
        }
    });

    app.on("pull_request.synchronize", async (context): Promise<void> => {
        if (context.payload.pull_request.user.type == "User") {
            if (context.payload.repository.homepage == "https://github.com/Typeslint/github-AutoResponse") {
                await new PullRequestSynchronize(context).synchronizeCore();
            }
            await new PullRequestSynchronize(context).sync();
        } else {
            return;
        }
    });

    app.on("workflow_run.completed", async (context): Promise<void> => {
        if (context.payload.workflow_run.event == "pull_request") {
            if (context.payload.sender.type == "User") {
                await new WorkflowCheck(context).CheckUserCI();
            } else {
                await new WorkflowCheck(context).checkCI();
            }
        } else {
            return;
        }
    });

};

setInterval(() => {
    (async () => {
        await new PRsStale().checkStale();
    })().catch((err: Error) => {
        console.error(err);
    });
}, 3600000);

export default Context;
export { octokit, token };
export type { getEvent, getUserData };
