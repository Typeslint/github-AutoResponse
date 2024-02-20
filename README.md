# github-AutoResponse
This GitHub Automaton is a Probot-based application that automates various actions and responses to different events within a GitHub repository. It utilizes Probot, Octokit, and various event listeners to handle actions such as closing issues, commenting on issues and pull requests, managing pull requests, and performing checks on workflow runs.

## Features
- Push Event Handling: Responds to push events in the repository.
- Issues Management: Handles opening, closing, and commenting on issues.
- Pull Request Management: Manages opening, reviewing, and synchronizing pull requests.
- Workflow Run Handling: Performs checks based on workflow run completion events.
- Stale Pull Requests: Regularly checks for stale pull requests.

## Configuration
Environment Variables
To use this application, set the following environment variables in a .env file:

- APP_ID: Your GitHub App's ID.
- PRIVATE_KEY: Your GitHub App's private key.
- CLIENT_ID: Your GitHub App's client ID.
- CLIENT_SECRET: Your GitHub App's client secret.

## Usage
To use this application, install the dependencies and configure the environment variables. Run the application using the appropriate command `npm run build:start`.

## Contributing
Contributions are welcome! Please see this <a href="https://github.com/Typeslint/github-AutoResponse/blob/main/CONTRIBUTING.md">**Contribution Guide**</a> and adhere to <a href="https://github.com/Typeslint/github-AutoResponse/blob/main/CODE_OF_CONDUCT.md">**Code Of Conduct**</a>. If you have any improvements, feel free to submit a pull request.

## License
This project is licensed under the ISC License.
