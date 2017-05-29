let gulp = require('gulp');
let nodemon = require('gulp-nodemon');

gulp.task('default', () => {
    nodemon({
        script : 'app.js',
        ext : 'js',
        ignore : ['./node_modules/**']
    })
    .on('restart', () => {
        console.log('Restart');
    });
});

