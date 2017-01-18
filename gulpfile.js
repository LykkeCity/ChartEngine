var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var del = require('del');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var gulpTslint = require("gulp-tslint");
var tslint = require("tslint");
var merge = require('merge2');

//delete the output file(s)
gulp.task('clean', function () {
    //del is an async function and not a gulp plugin (just standard nodejs)
    //It returns a promise, so make sure you return that from this task function
    //  so gulp knows when the delete is complete
    return del(['dist/**/*']);
});

gulp.task("tslint", () => {
    // https://github.com/panuhorsmalahti/gulp-tslint
    //var program = tslint.Linter.createProgram("./tsconfig.json");

    tsProject.src()
        .pipe(gulpTslint({
            formatter: "verbose"
        }))
        //.pipe(gulpTslint({ program }))    
        .pipe(gulpTslint.report())
});

gulp.task("build-js", function () {
    var tsResult = tsProject.src()
        .pipe(tsProject())

    return merge([
        tsResult.dts.pipe(gulp.dest('dist/definitions')),
        tsResult.js.pipe(gulp.dest('dist/js'))
    ]);        
});

gulp.task("build-bundle", ['clean'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/lychart.ts'],
        cache: {},
        packageCache: {},
        standalone: 'Bundle'
        // ,shim: {
        //     "jquery": {
        //         path: './node_modules/jquery/dist/jquery.min.js',
        //         exports: '$'
        //     }            
        // }
    })
    //.ignore('jquery')
    .plugin(tsify)  // tsify plugin instead of gulp-typescript
    .bundle()
    .pipe(source('bundle.js'))
    //-- minify
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    //.pipe(uglify())
    .pipe(sourcemaps.write('./'))
    // ---
    .pipe(gulp.dest("dist"));     
});

gulp.task("build", ['clean', 'build-js', 'build-bundle']);
