/**
 * This file contains tests that require Kubernetes to be running.
 */

import os from 'os';
import path from 'path';
import util from 'util';

import fetch from 'node-fetch';
import { Application } from 'spectron';
import * as childProcess from '../src/utils/childProcess';
import NavBarPage from './pages/navbar';

const electronPath = require('electron');

jest.setTimeout(600_000);

async function tool(tool: string, ...args: string[]): Promise<string> {
  const srcDir = path.dirname(__dirname);
  const filename = os.platform().startsWith('win') ? `${ tool }.exe` : tool;
  const exe = path.join(srcDir, 'resources', os.platform(), 'bin', filename);

  try {
    const { stdout } = await childProcess.spawnFile(
      exe, args, { stdio: ['ignore', 'pipe', 'inherit'] });

    return stdout;
  } catch (ex:any) {
    console.error(`Error running ${ tool } ${ args.join(' ') }`);
    console.error(`stdout: ${ ex.stdout }`);
    console.error(`stderr: ${ ex.stderr }`);
    throw ex;
  }
}

async function kubectl(...args: string[] ): Promise<string> {
  return await tool('kubectl', ...args);
}

describe('Rancher Desktop', () => {
  let app: Application;
  let navBarPage: NavBarPage;

  beforeAll(async() => {
    app = new Application({
      // 'any' typing is required for now as other alternate usage/import
      //  cause issues running the tests. Without 'any' typescript
      //  complains of type mismatch.
      path:                   electronPath as unknown as string,
      args:                   [path.dirname(__dirname)],
      // In GitHub Actions, it can take very long for things to start.
      connectionRetryTimeout: 60_000,
    });

    await app.start();
    const progress = await app.client.$('.progress');
    // Wait for the progress bar to exist
    await progress.waitForExist({ timeout: 15_000 });
    // Wait for progress bar to disappear again
    await progress.waitForExist({ timeout: 600_000, reverse: true });
    navBarPage = new NavBarPage(app);
  });

  afterAll(async() => {
    if (!app?.isRunning()) {
      console.error('afterAll: app is not running');

      return;
    }

    // Due to graceful Kubernetes shutdown, we need to try to quit harder.
    // The actual object here doesn't match the TypeScript definitions.
    const remoteApp = (app.electron as any).remote.app;

    await remoteApp.quit() as Promise<void>;
    await app.stop();
  });

  it('should run Kubernetes', async() => {
    const output = await kubectl('cluster-info');
    // Filter out ANSI escape codes (colours).
    const filteredOutput = output.replaceAll(/\033\[.*?m/g, '');

    expect(filteredOutput).toMatch(/Kubernetes master is running at ./);
  });

  it('should deploy nginx server sample', async() => {
    // let response;

    try {
      // Create namespace
      await kubectl('create', 'namespace', 'rd-nginx-demo');

      // Check that the namespace is created;
      const namespaces = (await kubectl('get', 'namespace', '--output=name')).trim();
      const filteredNamespaces = namespaces.replaceAll(/\033\[.*?m/g, '');

      expect(filteredNamespaces).toContain('rd-nginx-demo');

      // Apply resource
      const yamlFilePath = path.join(path.dirname(__dirname), 'e2e', 'assets', 'nginx-deployment-sample', 'nginx-app.yaml');

      await kubectl('apply', '-f', yamlFilePath, '-n', 'rd-nginx-demo');
      for (let i = 0; i < 10; i++) {
        const podName = (await kubectl('get', 'pods', '--output=name', '-n', 'rd-nginx-demo')).trim();

        if (podName) {
          expect(podName).not.toBeFalsy();
          break;
        }
        await util.promisify(setTimeout)(5_000);
      }
      await kubectl('wait', '--for=condition=ready', 'pod', '-l', 'app=nginx', '-n', 'rd-nginx-demo');

      // Forward port via UI button click, and capture the port number
      const portForwardingPage = await navBarPage.getPortForwardingPage();
      const port = await portForwardingPage?.portForward();

      // Access app and check the welcome message
      const response = await fetch(`http://localhost:${ port }`);

      expect(response.ok).toBeTruthy();
      response.text().then((text) => {
        expect(text).toContain('Welcome to nginx!');
      });
    } finally {
      // Delete namespace
      await kubectl('delete', 'namespace', 'rd-nginx-demo');
      const namespaces = (await kubectl('get', 'namespace', '--output=name')).trim();
      const filteredNamespaces = namespaces.replaceAll(/\033\[.*?m/g, '');

      expect(filteredNamespaces).not.toContain('rd-nginx-demo');
    }
  });
});
