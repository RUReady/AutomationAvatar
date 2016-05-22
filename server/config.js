module.exports = 
{client: ['pull', 'Tester'],
 commands: [{commandID: '#1', employees:['pull'], command: 'curl icanhazip.com', expects:['101.8.100.38']},
            {commandID: '#2', employees:['pull', 'Tester'], command: 'git config -l', expects:['user.name=RUReady2', 'user.email=ruready566@gmail.com']}]};
