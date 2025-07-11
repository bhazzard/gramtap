const { TelegramApi } = require('telegram');
const { StringSession } = require('telegram/sessions');

class TelegramClient {
  constructor(apiId, apiHash, session = '') {
    this.apiId = apiId;
    this.apiHash = apiHash;
    this.session = new StringSession(session);
    this.client = null;
  }

  async initialize() {
    this.client = new TelegramApi(this.session, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
    await this.client.start();
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  getSession() {
    return this.client ? this.client.session.save() : '';
  }

  isConnected() {
    return this.client && this.client.connected;
  }
}

module.exports = TelegramClient;