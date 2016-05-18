var zmq = require('zmq'), 
    ip = require('ip'),
    os = require('os'),
    pull = zmq.socket('pull'),
    testClientList = {},
    port = 3000,
    connectedCallback,
    stdoutCallback,
    stderrCallback,
    service = {'ClientConnected': ClientConnected,
               'ClientStdout': ClientStdout,
               'ClientStderr': ClientStderr};
 
function ClientConnected(obj){
  var push = zmq.socket('push');

  push.connect('tcp://' + obj['ip'] + ':' + port);
  testClientList[obj['clientID']] = push;

  var userObj = {};

  userObj['type'] = 'ServerConnected';
  userObj['clientID'] = obj['clientID'];

  push.send(JSON.stringify(userObj));

  if(connectedCallback)
    connectedCallback(obj);
}

function ClientStdout(obj){
  console.log('================Stdout(clientID: ' + obj['clientID'] + ', commandID: ' + obj['commandID'] + '================');
  console.log(obj['message']);

  if(stdoutCallback)
    stdoutCallback(obj);
}

function ClientStderr(obj){
  console.log('================Stderr(clientID: ' + obj['clientID'] + ', commandID: ' + obj['commandID'] + '================');
  console.log(obj['message']);

  if(stderrCallback)
    stderrCallback(obj);
}

function pushCommand(clientID, commandID, command, parameters){
  var userObj = {};

  userObj['type'] = 'ServerCommand';
  userObj['clientID'] = clientID;
  userObj['commandID'] = commandID;
  userObj['command'] = command;
  userObj['parameters'] = parameters;

  testClientList[clientID].send(JSON.stringify(userObj));
}

function pushKill(clientID, commandID){
  var userObj = {};

  userObj['type'] = 'ServerTerminate';
  userObj['clientID'] = clientID;
  userObj['commandID'] = commandID;

  testClientList[clientID].send(JSON.stringify(userObj));
}

function startTestServer(){
  pull.bind('tcp://' + ip.address() + ':' + port);

  pull.on('message', function(msg){
    var obj = JSON.parse(msg.toString());

    try{
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
}

function setTestServerCallback(connectedCB, stdoutCB, stderrCB){
  connectedCallback = connectedCB;
  stdoutCallback = stdoutCB;
  stderrCallback = stderrCB;
}

exports.startTestServer = startTestServer;
exports.setTestServerCallback = setTestServerCallback;
exports.pushCommand = pushCommand;
exports.pushKill = pushKill;
