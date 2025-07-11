const { test } = require('uvu');
const assert = require('uvu/assert');
const TelegramClient = require('../../src/telegram');

test('TelegramClient - constructor initializes correctly', () => {
  const client = new TelegramClient(123456, 'abc123def45678901234567890123456');
  
  assert.equal(client.apiId, 123456);
  assert.equal(client.apiHash, 'abc123def45678901234567890123456');
  assert.ok(client.session);
  assert.equal(client.client, null);
});

test('TelegramClient - constructor accepts session parameter', () => {
  const sessionString = ''; // Empty string is valid for StringSession
  const client = new TelegramClient(123456, 'abc123def45678901234567890123456', sessionString);
  
  assert.equal(client.apiId, 123456);
  assert.equal(client.apiHash, 'abc123def45678901234567890123456');
  assert.ok(client.session);
});

test('TelegramClient - isConnected returns falsy when not initialized', () => {
  const client = new TelegramClient(123456, 'abc123def45678901234567890123456');
  
  assert.not.ok(client.isConnected()); // Returns null, which is falsy
});

test('TelegramClient - getSession returns empty string when not initialized', () => {
  const client = new TelegramClient(123456, 'abc123def45678901234567890123456');
  
  assert.equal(client.getSession(), '');
});

test.run();