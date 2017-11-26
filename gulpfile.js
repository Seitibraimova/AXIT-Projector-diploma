	const gulp = require('gulp'),
    sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    ghPages = require('gulp-gh-pages'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyHTML = require('gulp-minify-html'),
    spritesmith = require('gulp.spritesmith'),
    autoprefixer = require('gulp-autoprefixer'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create();
	
gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: "7777"
    });

    gulp.watch(['./**/*.html']).on('change', browserSync.reload);
    gulp.watch('./js/**/*.js').on('change', browserSync.reload);

    gulp.watch([
        './templates/**/*.html'
    ], ['fileinclude']);

    gulp.watch('./sass/**/*', ['sass']);
});

gulp.task('fileinclude', () => {
    gulp.src('./templates/index.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }).on('error', gutil.log))
        .on('error', notify.onError())
        .pipe(gulp.dest('./'))
});

gulp.task('sass', () => {
    gulp.src(['./sass/**/*.scss', './sass/**/*.sass'])
        .pipe(sourcemaps.init())
        .pipe(
            sass({ outputStyle: 'expanded' })
            .on('error', gutil.log)
        )
        .on('error', notify.onError())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.stream());
});

gulp.task('sprite', function () {
    let spriteData = gulp.src('pic/sprite/*.png').pipe(
        spritesmith({
            imgName: 'sprite.png',
            cssName: '_icon-mixin.scss',
            cssVarMap: (sprite) => {sprite.name = 'icon-' + sprite.name}
        })
    );

    let imgStream = spriteData.img.pipe(gulp.dest('pic/'));
    let cssStream = spriteData.css.pipe(gulp.dest('sass/'));

    return merge(imgStream, cssStream);
});

gulp.task('default', ['server', 'sass', 'fileinclude']);

// зтиснення css
gulp.task('minify:css', function() {
    gulp.src('./css/style.css')
        .pipe(autoprefixer({
            browsers: ['last 30 versions'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(gulp.dest('./dist/css/'));
});

// зтиснення html
gulp.task('minify:html', function() {
    var opts = {
        conditionals: true,
        spare: true
    };

    return gulp.src(['./index.html'])
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('./dist/'));
});

// зтиснення svg, png, jpeg
gulp.task('minify:img', function() {
    // беремо всі картинки крім папки де лежать картинки для спрайту
    return gulp.src(['./image/*'])
        .pipe(imagemin().on('error', gutil.log))
        .pipe(gulp.dest('./dist/image/'));
});

// публікація на gh-pages
gulp.task('deploy', () => 
    gulp.src('./dist/**/*').pipe(ghPages())
);

// при виклику команди gulp production
// будуть стиснуті всі ресурси в папку public
// після чого командою gulp deploy їх можна опублікувати на github
gulp.task('production', ['minify:html', 'minify:css', 'minify:img']);