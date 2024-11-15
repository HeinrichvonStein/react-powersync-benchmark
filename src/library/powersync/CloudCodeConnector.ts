import {v4 as uuid} from 'uuid';

import {AbstractPowerSyncDatabase, CrudBatch, PowerSyncBackendConnector} from '@powersync/web';

export type DemoConfig = {
  backendUrl: string;
  powersyncUrl: string;
};

const USER_ID_STORAGE_KEY = 'ps_user_id';

export class CloudCodeConnector implements PowerSyncBackendConnector {
  readonly config: DemoConfig;
  readonly userId: string;

  private _clientId: string | null;

  constructor() {
    let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (!userId) {
      userId = uuid();
      localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    }
    this.userId = userId;
    this._clientId = null;

    this.config = {
      backendUrl: import.meta.env.VITE_BACKEND_URL,
      powersyncUrl: import.meta.env.VITE_POWERSYNC_URL
    };
  }

  async fetchCredentials() {
    const tokenEndpoint = 'token';
    const res = await fetch(`${this.config.backendUrl}/${tokenEndpoint}?user_id=${this.userId}`);

    if (!res.ok) {
      throw new Error(`Received ${res.status} from ${tokenEndpoint}: ${await res.text()}`);
    }
    const body = await res.json();
    return {
      endpoint: this.config.powersyncUrl,
      token: body.token
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const batchAmount = 2000;
    let transaction = await database.getCrudBatch(batchAmount);
    if (!transaction) {
      return;
    }
    if(!transaction.haveMore) {
      await this.processBatch(transaction);
      await transaction.complete();
      return;
    }

    while(transaction?.haveMore) {
      await this.processBatch(transaction);
      await transaction.complete();
      transaction = await database.getCrudBatch(batchAmount);
      if(!transaction) {
        break;
      }
    }
    return;
  }

  private async processBatch (batch: CrudBatch): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch.crud)
      });

      if (!response.ok) {
        throw new Error(`Received ${response.status} from /upload: ${await response.text()}`);
      }
    } catch (ex: any) {
      console.debug(ex);
      throw ex;
    }
  }
}
