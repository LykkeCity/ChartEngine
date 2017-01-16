var gulp = require("gulp");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var del = require('del');

//delete the output file(s)
gulp.task('clean', function () {
    //del is an async function and not a gulp plugin (just standard nodejs)
    //It returns a promise, so make sure you return that from this task function
    //  so gulp knows when the delete is complete
    return del(['dist/**/*']);
});

gulp.task("build", ['clean'], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js
        //.pipe(uglify())
        .pipe(gulp.dest("dist"));
});