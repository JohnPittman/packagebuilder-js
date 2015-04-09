module.exports = {
    paths: {
        SRC: 'src/',
        JS_SRC: 'src/**/*.js',
        CSS_SRC: 'src/**/*.css',
        HTML_SRC: 'src/**/*.html',
        JSON_SRC: 'src/**/*.json',
        XML_SRC: 'src/**/*.xml',
        DIST: 'dist/',
        TEXT_DIST: 'dist/**/*.{html,xml,json,css,js}',
        JS_DIST: 'dist/**/*.js',
        CSS_DIST: 'dist/**/*.css',
        CSS_BUILD: 'bundle.min.css',
        SOURCE_MAPS: 'dist/**/*.map',
        SPECS: 'test/*Spec.js',
        PACKAGE_CONFIGS: '*.json',
    },
    packages: ['bower.json', 'package.json']
};
