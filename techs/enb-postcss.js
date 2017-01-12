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
    .defineOption('oneOfSourceSuffixes')
    .useFileList(['post.css', 'css'])
    .builder(function (files) {
        var _this = this,
            dirname = this.node.getDir(),
            filename = this.node.resolvePath(this._target),
            targetDir = path.dirname(filename),
            css = (this._oneOfSourceSuffixes ?
                filterByOneOfSourceSuffixes(files, this._oneOfSourceSuffixes) :
                files).map(function (file) {
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

function filterByOneOfSourceSuffixes(files, rules) {
    if (!rules) return files;

    Array.isArray(rules) || (rules = [rules]);
    rules.filter(Array.isArray).length || (rules = [rules]);

    var added = rules.map(function () { return {}; });

    return files.filter(function (file) {
        var basename = path.join(path.dirname(file.fullname), file.name.substring(0, file.name.indexOf('.'))),
            tech = file.fullname.replace(basename + '.', ''),
            ruleIdx = rules.reduce(function (res, rule, idx) {
                if (res > -1) return res;

                return typeof rule === 'string' ?
                    (rule === tech ? idx : -1) :
                    rule.indexOf(tech) > -1 ? idx : -1;
            }, -1);

        if (ruleIdx === -1 || added[ruleIdx][basename]) {
            return false;
        }

        added[ruleIdx][basename] = true;

        return true;
    });
}
