const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("COLOR_CHANGER.db");

async function all(sql) {
    const promise = new Promise((resolve, reject) => {
        db.all(sql, (err, res) => {
            if(err) {
                console.log(err);
                reject(err)
            } else {
                resolve(res)
            }
        });
    });
    return promise;
}

module.exports = {all}