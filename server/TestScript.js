var testServer = require('./TestServer'),
    pushCommand = testServer.pushCommand,
    pushKill = testServer.pushKill,
    clientStatus = {},
    userAmount = 1,
    userCounter = 0;

function pullCloseCallback(clientID){
  if(clientStatus[clientID]){
    userCounter--;
    clientStatus[clientID] = false;
  }
}

function connectedCallback(obj){
  console.log('------Client ' + obj['clientID'] + ' connected------');
 
  if(++userCounter <= userAmount){
    clientStatus[obj['clientID']] = true;
    mainFunction();
  }
  else
    userCounter--;
}

function stdoutCallback(obj){
  //console.log('================stdout================');
  //console.log(obj);
}

function stderrCallback(obj){
  console.log('================stderr================');
  console.log(obj);
}

function commandExitCallback(obj){
  console.log('================Exit ID=' + obj['clientID']+ ', cmdID=' + obj['commandID'] + '================');
}

function mainFunction(){
  pushCommand('pull', '#1', 'apt-get -y install docker');
}

testServer.setTestServerCallback(connectedCallback, stdoutCallback, stderrCallback, commandExitCallback, pullCloseCallback);
testServer.startTestServer();
