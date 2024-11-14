import {v4 as uuid} from 'uuid';

import {AbstractPowerSyncDatabase, PowerSyncBackendConnector} from '@powersync/web';

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
    console.log(res.status);

    if (!res.ok) {
      throw new Error(`Received ${res.status} from ${tokenEndpoint}: ${await res.text()}`);
    }

    const body = await res.json();
    console.log(`body: ${JSON.stringify(body)}`);
    return {
      endpoint: this.config.powersyncUrl,
      token: body.token
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }
    // TODO REMOVE the following
      console.log('Upload data waiting...');
    setTimeout(async () => {
      await transaction.complete();
    }, 5000);
    return;
    if (!this._clientId) {
      this._clientId = await database.getClientId();
    }

    try {
      let batch: any[] = [];
      for (let operation of transaction.crud) {
        let payload = {
          op: operation.op,
          table: operation.table,
          id: operation.id,
          data: operation.opData
        };
        batch.push(payload);
      }

      const response = await fetch(`${this.config.backendUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batch })
      });

      if (!response.ok) {
        throw new Error(`Received ${response.status} from /upload: ${await response.text()}`);
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      throw ex;
    }
  }
}
