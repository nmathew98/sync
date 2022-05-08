## About

A simple application to sync and redeploy servers when new commits are pushed to GitHub

## Usage

1. Add a webhook to your GitHub repository to the path `/github/webhook`
2. Fill in the configuration file `sync.config.ts`
3. Launch this application, anytime a webhook event is received the necessary servers should be updated, rebuilt and redeployed.

## Other notes

- The commands are not filled in on purpose to allow for flexibility but ordinarily you would:

```
git -C ${repo} reset --hard
git -C ${repo} clean -df
git -C ${repo} pull -f origin master
npm -C ${repo} install --development
npm -C ${repo} run build
npm -C ${repo} run start
```

- `repo` above is the directory of the project
