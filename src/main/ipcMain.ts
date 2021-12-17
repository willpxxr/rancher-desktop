import Electron from 'electron';

const ipcMainProxy = new Proxy(Electron.ipcMain, {
  get: (target, property) => {
    if (property === 'on') {
      return (channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void) => {
        const newListener = (event: Electron.IpcMainEvent, ...args: any[]) => {
          const printableArgs = args.map(arg => JSON.stringify(arg));
          console.debug(`ipcMain: "${ event }" triggered: ${ printableArgs.join(', ') }`);
          listener(event, ...args);
        }
        return target[property](channel, newListener);
      }
    }
    return Reflect.get(target, property);
  },
});

export default ipcMainProxy;
