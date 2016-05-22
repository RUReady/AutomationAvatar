var testServer = require('./TestServer'), 
    config = require('./config'), 
    exec = require('child_process').exec,
    sleep = require('sleep'),
    fs = require('fs'),
    date = require('date-and-time'),
    filename,
    pushCommand = testServer.pushCommand,
    pushKill = testServer.pushKill,
    clientStatus = {},
    stdoutString = {},
    userCounter = 0,
    commandIndex = 0,
    commandClientFinishCounter = 0;

function compare(){
  for(var employee in stdoutString[config.commands[commandIndex]['commandID']]){
    var contents = stdoutString[config.commands[commandIndex]['commandID']][employee],
        oldExpectIndex = -2;

    for(var index in config.commands[commandIndex]['expects']){
      var expect = config.commands[commandIndex]['expects'][index];

      if(contents.indexOf(expect) === -1){
        console.log('employee:' + employee + ', commandID:' + config.commands[commandIndex]['commandID'] + ', expect:' + expect + ' failed');
        break;
      } 
      else if(contents.indexOf(expect) < oldExpectIndex){
        console.log('employee:' + employee + ', commandID:' + config.commands[commandIndex]['commandID'] + ', expect:' + expect + ' failed');
        break;
      } 
      else if(Number(index) === (config.commands[commandIndex]['expects'].length - 1)){
        console.log('employee:' + employee + ', commandID:' + config.commands[commandIndex]['commandID'] + ' PASS!!!');
      } 

      oldExpectIndex = contents.indexOf(expect);
    }
  }
}

function pullCloseCallback(clientID){
  if(typeof obj === 'undefined')
    return ;
  if(config.client.indexOf(obj['clientID']) === -1)
    return ;
  
  if(clientStatus[clientID]){
    console.log('------Client ' + obj['clientID'] + ' closed------');

    userCounter--;
    clientStatus[clientID] = false;
  }
}

function connectedCallback(obj){
  if(config.client.indexOf(obj['clientID']) === -1)
    return ;

  console.log('------Client ' + obj['clientID'] + ' connected------');

  if(++userCounter <= config.client.length){
    clientStatus[obj['clientID']] = true;

    if(userCounter === config.client.length)
      mainFunction();
  }
  else
    userCounter--;
}

function stdoutCallback(obj){
  var now = new Date();
  var context = '[' + date.format(now, 'YYYY-MM-DD_HH:mm:ss') + '] ' + obj['message'];

  stdoutString[obj['commandID']][obj['clientID']] = stdoutString[obj['commandID']][obj['clientID']] + context;
  fs.appendFile(filename + obj['clientID'] + '_' + obj['commandID'], context, function (err) {});
}

function stderrCallback(obj){
  //fs.appendFile(filename + obj['clientID'], obj['message'], function (err) {});
}

function commandExitCallback(obj){
  console.log('================Exit ID=' + obj['clientID']+ ', cmdID=' + obj['commandID'] + '================');

  if(++commandClientFinishCounter === config.commands[commandIndex]['employees'].length){
    sleep.sleep(5); 
    compare();

    if(commandIndex < config.commands.length -1){
      commandClientFinishCounter = 0;
      commandIndex++;
      mainFunction();
    }
  }
}

function mainFunction(){
  var now = new Date();
  stdoutString[config.commands[commandIndex]['commandID']] = {};

  filename = date.format(now, 'YYYY-MM-DD_HH:mm:ss_');

  console.log('<<<<< ' + config.commands[commandIndex]['command'] + ' >>>>>');

  config.commands[commandIndex]['employees'].forEach(function(employee){
    pushCommand(employee, config.commands[commandIndex]['commandID'], config.commands[commandIndex]['command']);
    stdoutString[config.commands[commandIndex]['commandID']][employee] = '';
  });
}

testServer.setTestServerCallback(connectedCallback, stdoutCallback, stderrCallback, commandExitCallback, pullCloseCallback);
testServer.startTestServer();
