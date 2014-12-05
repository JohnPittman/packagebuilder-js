package-builder-js
==================

Node module for cranking out JavaScript packages. Builds with front-end source maps, tests, minifies, and versioning.

<h1>Development</h1>

<h4>Requirements</h4>

- nodejs
- npm install
- npm install -g gulp

<h4>Gulp Commands</h4>

Each process is dependent upon the previous. If one fails the build process exits.

- gulp
- gulp test (Unit specifications)
- gulp build (Test, folder clean-ups, minification, source maps, renaming)
- gulp deploy (Test, build, versioning)
- gulp deploy--version-down

Note: Look through the packagebuilder.js module for more commands, however, the main ones just use others as helper tasks to fix things the they couldn't could not do as one. Things like the deploy--version-down task was made because I bump the version by the wrong type sometimes and would have to go into each file to change and save then re-run gulp deploy so it makes it less tidious.

<h1>Usage</h1>

<h4>Installation</h4>

npm: npm install packagebuilder

<h4>How to use...</h4>

- npm install gulp --save-dev. (recommended to put the version as '*' to always install the latest)
- npm install packagebuilder --save-dev. (recommended to put the version as '*' to always install the latest)
- Create gulpfile.js in the root directory of the project this is being used for.
- In the gulpfile.js copy and paste this line:

    require('packagebuilder')(require('gulp'));

Now you can open up a terminal in the project folder and run any of the gulp tasks listed in the Gulp Commands section above on the project.

Note: Right now the source directory that the build needs is src/ in the main project directory which the build needs to start the processes. You can change the locations of source files, distribution folder, etc. manually in the config.js that's included in the packagebuilder module under node_modules. This will be overwritten each time you reinstalled the package at the moment.

<h1>Release Notes</h1>

To be continued... The goal is to eventually have an initial setup run through to configure the paths of source and distribution so this can be use for large web projects as well.
