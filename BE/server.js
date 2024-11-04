//CJS module
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello Node!');
    res.end();
});

server.listen(3080, ()=>{
    console.log('Server is running on port 3080');
});
