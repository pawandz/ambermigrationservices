const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
sass.compiler = require("node-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const gulp = require("gulp");
const webp = require("gulp-webp");
var htmlmin = require("gulp-html-minifier");

function css() {
  return src("scss/*.scss")
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write("."))
    .pipe(dest("css"));
}

gulp.task("webp", function () {
  gulp.src("images/**/*.*").pipe(webp()).pipe(gulp.dest("images/webp"));
});

gulp.task("minify", function () {
  gulp
    .src("./src/*.php")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./dist"));
});

// Watch files
function watchFiles() {
  watch(["scss"], css);
}

exports.default = css;
exports.watch = watchFiles;
