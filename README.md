enb-postcss
===========

Usage:
```bash
npm i --save-dev enb-postcss
```

```js
nodeConfig.addTech([
    [require('enb-postcss/techs/enb-postcss'), {
        sourcemap : true,
        plugins : [require('cssnext')()]
    } ],
]);
```
