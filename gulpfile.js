var gulp = require("gulp");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var gulpTslint = require("gulp-tslint");
var tslint = require("tslint");

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

gulp.task("build", ['clean'], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js
        //.pipe(uglify())
        .pipe(gulp.dest("dist"));
});