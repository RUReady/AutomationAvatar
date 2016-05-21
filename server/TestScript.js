var testServer = require('./TestServer'),
    pushCommand = testServer.pushCommand,
    pushKill = testServer.pushKill,
    userAmount = 1,
    userCounter = 0;

function connectedCallback(obj){
  console.log('------Client ' + obj['clientID'] + ' connected------');
 
  if(++userCounter === userAmount)
    mainFunction();
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

testServer.setTestServerCallback(connectedCallback, stdoutCallback, stderrCallback, commandExitCallback);
testServer.startTestServer();
