import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { globalStatePFEnte } from './utils/ente/sessioneEnte';

const authFile = path.join(__dirname, "playwright/.auth/user.json");

// Sessione ente scritta direttamente nello storageState: nessuna chiamata al backend reale (vedi CLAUDE.md).
// I test mockano tutte le API tramite tests/fixtures.ts, quindi token e nonce fittizi sono sufficienti.
setup('authenticate', async () => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(authFile, JSON.stringify({
    cookies: [],
    origins: [{
      origin: "http://localhost:3000",
      localStorage: [{ name: "globalStatePF", value: JSON.stringify(globalStatePFEnte()) }],
    }],
  }, null, 2));
});
