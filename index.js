var mysql = require('mysql');

/*
 * Create database:
 * create database <DATABASENAME> default character set utf8 default collate utf8_bin;
 * GRANT ALL PRIVILEGES ON <DATABASENAME>.* to <USERNAME>@'localhost' IDENTIFIED BY '<PASSWORD>';
 */

var db = {};

/**
 * Muss als erstes aufgerufen werden
 */
db.connect = async function(host, database, user, password) {
    db.connection = mysql.createConnection({
        host: host,
        database: database,
        user: user,
        password: password,
        multipleStatements: true
    });
    return new Promise(function(resolve, reject) {
        db.connection.connect(function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

/**
 * Promisified query function.
 */
db.query = async function(query, params) {
    return new Promise(function(resolve, reject) {
        db.connection.query(query, params, function(err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

/**
 * Schema der Datenbank aktualisieren. Sollte nach jeder Aktualisierung der Anwendung aufgerufen werden. Oder besser bei jedem Start.
 * Als Primärschlüssel wird stets eine Zeichnfolge "id" mit 255 Zeichen verwendet.
 * schema:
 * [
 *  {
 *   tablename: "aaa",
 *   columns: [
 *    { name: "title", type: "varchar(255)" },
 *   ]
 *  },
 * ]
 */
db.init = async function(schema) {
    console.log('DB: Updating schema');
    var tablesresult = await db.query('show tables;');
    var tablenames = tablesresult.map(function(d) { return d[Object.keys(d)[0]]; });
    var queries = [];
    for (var i = 0; i < schema.length; i++) {
        var tabledef = schema[i];
        var tablename = tabledef.tablename;
        var columns = tabledef.columns;
        var columnnames = [];
        if (tablenames.indexOf(tablename) < 0) {
            queries.push('create table ' + tablename + '(id varchar(255) not null, primary key (id));');
        } else {
            var columnsresult = await db.query('show columns from ' + tablename + ';');
            columnnames = columnsresult.map(function(d) { return d.Field; });
        }
        for (var j = 0; j < columns.length; j++) {
            var columndef = columns[j];
            var columnname = columndef.name;
            if (columnnames.indexOf(columnname) < 0) {
                queries.push('alter table ' + tablename + ' add column ' + columndef.name + ' ' + columndef.type + ';');
            }
        }
    }
    if (queries.length > 0) {
        var joinedqueries = queries.join(' ');
        await db.query(joinedqueries);
        console.log(queries.join('\n'));
    }
}

module.exports = db;
