var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var del = require('del');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var tslint = require("tslint");
var gulpTslint = require('gulp-tslint');
var merge = require('merge2');

//delete the output file(s)
gulp.task('clean', function () {
    //del is an async function and not a gulp plugin (just standard nodejs)
    //It returns a promise, so make sure you return that from this task function
    //  so gulp knows when the delete is complete
    return del(['dist/**/*', 'sample-usage-ts/dist/**/*', './sample-webserver/demo/dist/**/*']);
});

gulp.task('tslint', (cb) => {
    var program = tslint.Linter.createProgram('./tsconfig.json');
    tsProject.src()
        .pipe(gulpTslint({
            formatter: 'verbose'
        }))
        .pipe(gulpTslint.report())
    cb();
});

gulp.task('build-js', ['clean'], function () {
    var tsResult = tsProject.src()
        .pipe(tsProject())

    return merge([
        tsResult.dts.pipe(gulp.dest('dist/definitions')),
        tsResult.js.pipe(gulp.dest('dist/js'))
    ]);
});

gulp.task('build-bundle', ['clean', 'build-js'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/lychart.ts'],
        cache: {},
        packageCache: {},
        standalone: 'Bundle'
        // ,shim: {
        //     'jquery': {
        //         path: './node_modules/jquery/dist/jquery.min.js',
        //         exports: '$'
        //     }            
        // }
    })
    .ignore('jquery')
    .plugin(tsify)  // tsify plugin instead of gulp-typescript
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    //.pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));     
});

gulp.task('build-bundle-sample', ['build-bundle'], function () {
    return browserify({
        basedir: './sample-usage-ts',
        debug: true,
        entries: ['ts/App.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('sampleapp.bundle.js'))
    .pipe(gulp.dest("./sample-usage-ts/dist")); 
});

gulp.task('build-bundle-demo', ['build-bundle'], function () {
    return browserify({
        basedir: './demo',
        debug: true,
        entries: ['app/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('demo.bundle.js'))
    .pipe(gulp.dest("./sample-webserver/demo/dist")); 
});

gulp.task('build', ['clean', 'build-js', 'build-bundle', 'build-bundle-sample', 'build-bundle-demo']);
