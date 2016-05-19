var zmq = require('zmq'), 
    ip = require('ip'),
    os = require('os'),
    pull = zmq.socket('pull'),
    push = zmq.socket('push'),
    ip = require('ip'),
    serverIP = '192.168.0.181',
    port = '3000',
    executingCommandList = {},
    spawnCommand = require('spawn-command')
    service = {'ServerConnected': ServerConnected,
               'ServerCommand': ServerCommand,
               'ServerTerminate': ServerTerminate};
 
pull.bind('tcp://' + ip.address() + ':' + port);
push.connect('tcp://' + serverIP + ':' + port);

console.log('Producer bound to port 3000');

function ServerConnected(obj){
  console.log('Server Connected');
}
 
function pushStdout(commandID, stdoutMessage){
  var userObj = {};

  userObj['type'] = 'ClientStdout';
  userObj['clientID'] = os.hostname();
  userObj['commandID'] = commandID;
  userObj['message'] = stdoutMessage;

  push.send(JSON.stringify(userObj));
}

function pushStderr(commandID, stderrMessage){
  var userObj = {};

  userObj['type'] = 'ClientStderr';
  userObj['clientID'] = os.hostname();
  userObj['commandID'] = commandID;
  userObj['message'] = stderrMessage;

  push.send(JSON.stringify(userObj));
}

function pushExit(commandID, exitCode){
  var userObj = {};

  userObj['type'] = 'ClientCommandExit';
  userObj['clientID'] = os.hostname();
  userObj['commandID'] = commandID;
  userObj['exitCode'] = exitCode;

  push.send(JSON.stringify(userObj));
}

function ServerCommand(obj){
  var command = spawnCommand(obj['command']);

  //console.log('[command] ' + obj['command'] + ' ' + obj['parameter'].toString());
 
  executingCommandList[obj['commandID']] = command;

  command.stdout.setEncoding('utf8');
  command.stdout.on('data', function (data) {
    console.log('[stdout] ' + data);
    pushStdout(obj['commandID'], data);
  });

  command.stderr.setEncoding('utf8');
  command.stderr.on('data', function (data) {
    console.log('[stderr] ' + data);
    pushStderr(obj['commandID'], data);
  });

  command.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    pushExit(obj['commandID'], code);
  }); 
}

function ServerTerminate(obj){
  console.log('[terminate] ' + obj['commandID']);
  executingCommandList[obj['commandID']].kill();
}

function connectToTestServer(){
  var userObj = {};

  userObj['type'] = 'ClientConnected';
  userObj['clientID'] = os.hostname();
  userObj['ip'] = ip.address();

  push.send(JSON.stringify(userObj));
}

pull.on('message', function(msg){
  var obj = JSON.parse(msg.toString());

  console.log(obj);
  try{
    if(obj['clientID'] === os.hostname())
      service[obj['type']](obj);
  }
  catch(e){
    if (e instanceof TypeError){
      console.log('TypeError:' + e);
    }
    else{
      console.log('Unhandled error: ' + e);
    }

    console.log(e.stack);
  }
});

push.monitor(500, 0);
connectToTestServer();

