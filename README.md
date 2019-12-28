# db

MySQL Wrapper für meine Anwendungen.

## Verwendung

```js
var db = require('@levelupsoftware/db');
// Verbindung herstellen
await db.connect(
    process.env.DBHOST,
    process.env.DBNAME,
    process.env.DBUSERNAME,
    process.env.DBPASSWORD,
);
await db.init();
```

## Howto create NPM package

```
npm install npm@latest -g
npm init --scope=@levelupsoftware
npm adduser // hilderonny, npm@hildebrandt2014.de
npm publish --access public
```

For all following deployments to NPM you need to update the version in the ```package.json``` file and run ```npm publish```.

In dependent projects the lib can be updated to the newest version with ```npm up```.
