enb-postcss
===========

Usage:
```bash
npm i --save-dev enb-postcss
```

```js
nodeConfig.addTech(
    [require('enb-postcss/techs/enb-postcss'), {
        comments : true,
        sourcemap : true,
        plugins : [require('cssnext')()],
        oneOfSourceSuffixes : [['post.css', 'css'], ['ie.post.css', 'ie.css']] // keep just one of found tech. Default is undefined
    } ],
);
```
