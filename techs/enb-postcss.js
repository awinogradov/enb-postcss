var vow     = require('vow'),
    path    = require('path'),
    postcss = require('postcss'),
    pimport = require('postcss-import');

module.exports = require('enb/techs/css').buildFlow()
    .name('enb-postcss')
    .target('target', '?.css')
    .defineOption('plugins')
    .defineOption('sourcemap', false)
    .useFileList(['css', 'post.css'])
    .builder(function(files) {
        var def = vow.defer(),
            _this = this,
            dirname = _this.node.getDir(),
            filename = path.join(dirname, _this._target),
            css = files.map(function(file) {
                return '@import "' + path.relative(dirname, file.fullname) + '";';
            }).join('\n'),
            output;

        output = postcss([pimport()].concat(_this._plugins))
            .process(css, {
                from: filename,
                to: filename,
                map: _this._sourcemap
            })
            .catch(function(error) {
                if (error.name === 'CssSyntaxError') {
                    process.stderr.write(error.message + error.showSourceCode());
                } else {
                    throw error;
                }
            })
            .then(function(result) {
                result.warnings().forEach(function(warn) {
                    process.stderr.write(warn.toString());
                });

                def.resolve(result);
            });

        return def.promise();
    })
    .createTech();
