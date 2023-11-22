const express = require('express');
const app = express();
const morgan=require('morgan');
const exec = require('child_process').exec;

//Configuraciones
app.set('port', process.env.PORT || 3005);
app.set('json spaces', 2)
 
//Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32' : cmd = `tasklist`; break;
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
        case 'linux' : cmd = `ps -A`; break;
        default: break;
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}
 
//Nuestro primer WS Get
app.get('/service', (req, res) => {    
    if (!req.query.service) {
        res.json({message: 'You have to send ?service=serviceName to check correctly'});  
    }
    isRunning(req.query.service, (status) => {
        res.json(
            {
                status: status
            }
        );
    });
});

app.get('/docker', (req, res) => {

    if (!req.query.service) {
        res.json({message: 'You have to send ?docker=containerName to check correctly'});  
    }

    var a = exec('docker ps -la', (err, stdout, stderr) => {
        return stdout;
    });
    

    res.json(
        {
            a: a
        }
    );
})
 
//Iniciando el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
});