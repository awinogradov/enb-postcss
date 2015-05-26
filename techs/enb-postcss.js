var postCSS = require('postcss');

module.exports = require('enb/lib/build-flow').create()
    .name('enb-postcss')
    .defineRequiredOption('sourceTarget')
    .optionAlias('sourceTarget', 'source')
    .defineOption('destTarget')
    .optionAlias('destTarget', 'target')
    .defineOption('plugins')
    .target('destTarget', '?.css')
    .useSourceText('sourceTarget')
    .builder(function(css) {
        return postCSS(this._plugins || []).process(css).css;
    })
    .createTech();
