const fs = require('fs');
const content = fs.readFileSync('payment_server.log', 'utf8');
console.log(content);
