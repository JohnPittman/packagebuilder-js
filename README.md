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

<h1>Usage</h1>

<h4>Installation</h4>

npm: npm install packagebuilder

<h4>How to use...</h4>

- Create gulpfile.js in the root project directory.
- npm install packagebuilder --save-dev. (recommended to put the version as '*' to always install the latest)
- In the gulpfile.js:

    var gulp = require('gulp');
    var packagebuilder = require('packagebuilder');
    packagebuilder(gulp);

<h1>Release Notes</h1>
