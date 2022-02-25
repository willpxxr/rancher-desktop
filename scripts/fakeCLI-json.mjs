/**
 * Fake CLI/client to talk to the command-line server.
 *
 *
 */

import path from 'path';

import fs from 'fs';
import net from 'net';
import os from 'os';

const options = [
  ['--settings', 'returns a JSON hash of all the settings'],
  ['--setting', 'returns status of setting X', /\w+/],
  ['--versions', 'aLl supported k8s versions'],
  ['--version', 'change to the specified version', /.+/],
  ['--set', 'change setting NAME to VALUE: boolean|string|number', /\w+=.*/],
  ['--reset', 'Restart Kubernetes'],
  ['--reset-all', 'Restart Kubernetes/VM, clear state'],
  ['--shutdown', 'Shut down the UI'],
];

const helpText = `Command-line syntax:\n${ options.map(part => `${ part[0] } - ${ part[1] }`).join('\n') }`;

function showHelp(message) {
  if (message) {
    console.log(`Error: ${ message }`);
  }
  console.log(helpText);
  process.exit(message ? 1 : 0);
}

const APP_NAME = 'rancher-desktop';
const portFile = path.join(os.homedir(), 'Library', 'Application Support', APP_NAME, '.rdCliPort');
const port = (() => {
  try {
    return parseInt(fs.readFileSync(portFile, { encoding: 'utf-8' }), 10);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`File ${ portFile } doesn't exist, can't talk to the server`);
      process.exit(1);
    }
  }
})();

const dataPieces = [];
let timeoutID;

function continueWithClient() {
  console.log('Waiting for more events...');
  timeoutID = setTimeout(continueWithClient, 1000);
}

function sendCommand(command) {
  const client = new net.Socket();

  console.log(`QQQ: -client.connect(port: ${ port }`);
  client.connect(port, '127.0.0.1', () => {
    console.log('connected...');
    client.write(command);
  });
  client.on('data', (data) => {
    // console.log(`Got data: ${ data }`);
    dataPieces.push(data.toString());
  });
  client.on('close', () => {
    console.log('Connection closed');
    // gotClose = true;
    clearTimeout(timeoutID);
    console.log(`Got back all data: ${ dataPieces.join('') }`);
    try {
      const result = JSON.parse(dataPieces.join(''));
      switch (result.status) {
      case 'help':
        console.log(result.message);
      case 'error':
        console.log(result.message);
      case 'true':
      case 'false':
        console.log(result.message ?? result.value);
      }
    } catch(e) {
      console.log(`Error showing ${ dataPieces.join('') }: `, e);
    }
  });
  client.on('error', (err) => {
    console.log(`Got an error: ${ err }`);
    process.exit(1);
  });
  timeoutID = setTimeout(continueWithClient, 1);
}
sendCommand(JSON.stringify(process.argv.slice(2)));
