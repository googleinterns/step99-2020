# client

This folder is where all of the client side code in this project belongs.

## directory structure

All CSS must be stored in subfolders of the `css` directory, and all JavaScript must be stored in
subfolders of the `js` directory.

## linting

We are using [ESLint](https://eslint.org/) to lint JavaScript, and
[Stylelint](https://stylelint.io/) to lint CSS. These programs will flag any stylistic errors in
your JS and CSS code, and can even automatically fix some of them. They are written in JavaScript,
so you have to have Node.js installed in order to run them.

Once Node.js is installed, you can take the following steps to run the linters:
  - `cd client`: Make sure you are in the `client` folder.
  - `npm install`: You only need to do this the first time. This will install the linters.
  - Then you can run one of six linting commands.
    - `npm run lint`: This will run both ESLint and Stylelint. It will only report errors, it will
      not auto-fix anything.
    - `npm run lint:script`: This will run ESLint only.
    - `npm run lint:style`: This will run Stylelint only.
    - `npm run lint:fix`: This will run ESLint and Stylelint. It will report errors and attempt to
      auto-fix any errors it encounters.
    - `npm run lint:fix:script`: This will run ESLint only. It will report errors and attempt to
      auto-fix any errors it encounters.
    - `npm run lint:fix:style`: This will run ESLint only. It will report errors and attempt to
      auto-fix any errors it encounters.
  - You can also run a dev server for local testing.
    - `npm run serve`: Runs the development server. You have to run the actual backend at the same time. It will proxy all requests that begin with `/api` to the backend server.

  - **Q: How do I install Node.js on the cloud shell?**
  - A: It's already installed.
  - **Q: How do I install Node.js on my Chromebook / Crostini?**
  - A: The easiest way is to install [`nvm`](https://github.com/nvm-sh/nvm)
    - Run the `curl | sh` or `wget | sh` command listed on the page to install `nvm`
    - Run `nvm install 12` to install Node.js v12.
  - **Q: Why do I want to run the linter myself?**
  - A: GitHub will run the linter on your branch automatically when you try to merge a PR into
    `master`. Merging will be prevented if there are any linter errors, and isn't it more convenient
    to fix things like that _before_ uploading everything to GitHub?
  - **Q: Isn't there an easier way?**
  - A: There is! If you are using VSCode or the hacked version of `code-server`, then there are
    [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and
    [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
    extensions available in the extension gallery that you can just install. These extensions will
    automatically lint your code as you are writing it and give you a keyboard shortcut for fixing
    errors.
