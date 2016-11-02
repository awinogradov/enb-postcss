var vow       = require('vow'),
    EOL       = require('os').EOL,
    path      = require('path'),
    postcss   = require('postcss'),
    buildFlow = require('enb').buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('enb-postcss')
    .target('target', '?.css')
    .defineOption('plugins')
    .defineOption('parser')
    .defineOption('comments', false)
    .defineOption('sourcemap', false)
    .useFileList(['post.css', 'css'])
    .builder(function (files) {
        var _this = this,
            dirname = this.node.getDir(),
            filename = this.node.resolvePath(this._target),
            targetDir = path.dirname(filename),
            added = {},
            css = files.filter(function (file) { // keep just first of b1.post.css and b1.css
                var filename = file.name.substring(0, file.name.indexOf('.')),
                    ext = file.name.replace(filename, '').split('.').reverse();

                if(ext[1]) {
                    // alow multidotted extensions
                    filename += '.' + ext[1];
                }
                var basename = path.join(path.dirname(file.fullname), filename);

                if (added[basename]) {
                    return false;
                }

                added[basename] = true;

                return true;
            }).map(function (file) {
                var url = path.relative(targetDir, file.fullname),
                    importState = _this.getImportState(file, url),
                    pre = '',
                    post = '';

                if (_this._comments) {
                    pre = '/* ' + url + ':begin */' + EOL;
                    post = '/* ' + url + ':end */' + EOL;
                    return pre + importState + EOL + post;
                } else {
                    return importState;
                }
            }).join('\n');

        return postcss(_this._plugins)
            .process(css, {
                from: filename,
                to: filename,
                map: _this._sourcemap,
                parser: _this._parser
            })
            .then(function (result) {
                return result.css;
            })
            .catch(function (error) {
                if (error.name === 'CssSyntaxError') {
                    process.stderr.write(error.message + error.showSourceCode());
                } else {
                    throw error;
                }
            });
    })
    .methods({
        /**
         * @param {Object} file
         * @param {string} relativePath
         * @return {string}
         */
        getImportState: function (file, relativePath) {
            return '@import "' + relativePath + '";';
        }
    })
    .createTech();
