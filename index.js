const express = require('express');
const app = express();
const morgan=require('morgan');
const exec = require('child_process').exec;

//Configuraciones
app.set('port', process.env.PORT || 3005);
app.set('host', process.env.HOST || '0.0.0.0');
app.set('json spaces', 2)
 
//Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const isRunningService = (query, cb) => {
    let cmd = 'ps -A';
    /*switch (process.platform) {
        case 'win32' : cmd = `tasklist`; break;
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
        case 'linux' : cmd = `ps -A`; break;
        default: break;
    }*/
    console.log({type: 'service', check: query});
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}

const isRunningDocker = (containerName, cb) => {
    let cmd = `docker inspect --format='{{.State.Status}}' ${containerName}`;
    console.log({type: 'docker', check: containerName});
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().replace(/(\r\n|\n|\r)/gm, '') == 'running');
    });
}
 
//Nuestro primer WS Get
app.get('/service', (req, res) => {    
    if (!req.query.service) {
        res.json({message: 'You have to send ?service=serviceName to check correctly'});  
    }
    isRunningService(req.query.service, (status) => {
        res.json( { status: status } );
    });
});

app.get('/docker', (req, res) => {

    if (!req.query.docker) {
        res.json({message: 'You have to send ?docker=containerName to check correctly'});  
    }

    isRunningDocker(req.query.docker, (status) => {
        res.json( { status: status } );
    });
})
 
//Iniciando el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
});