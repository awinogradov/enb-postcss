enb-postcss
===========

Usage:
```js
nodeConfig.addTech([
    [require('enb/techs/css'), { target : '?.pre.css' } ],
    [require('enb-postcss/techs/enb-postcss'), {
        sourceTarget : '?.pre.css',
        plugins : [require('cssnext')()]
    } ],
]);
```
