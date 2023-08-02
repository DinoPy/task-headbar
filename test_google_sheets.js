const fs = require('fs');

const credentials = fs.openSync('./credentials.json');
const cred = require('./credentials.json');

console.log(credentials);
console.log(cred);



