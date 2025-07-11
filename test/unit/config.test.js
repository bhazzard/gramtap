const { test } = require('uvu');
const assert = require('uvu/assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ConfigManager = require('../../src/config');

// Helper function to create a temporary config directory
function createTempConfigDir() {
  const tempDir = path.join(os.tmpdir(), 'gramtap-test-' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to cleanup temp directory
function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('ConfigManager - constructor sets correct config paths', () => {
  const config = new ConfigManager();
  const configDir = config.getConfigDirectory();
  const configPath = config.getConfigPath();
  
  assert.ok(configDir.includes('gramtap'));
  assert.ok(configPath.includes('config.json'));
  assert.ok(configPath.startsWith(configDir));
});

test('ConfigManager - getConfigDirectory returns platform-specific paths', () => {
  const config = new ConfigManager();
  const configDir = config.getConfigDirectory();
  const platform = os.platform();
  
  if (platform === 'darwin') {
    assert.ok(configDir.includes('Library/Application Support/gramtap'));
  } else if (platform === 'win32') {
    assert.ok(configDir.includes('gramtap'));
  } else {
    assert.ok(configDir.includes('.config/gramtap') || configDir.includes('gramtap'));
  }
});

test('ConfigManager - getDefaultConfig returns proper structure', () => {
  const config = new ConfigManager();
  const defaultConfig = config.getDefaultConfig();
  
  assert.ok(defaultConfig.telegram);
  assert.ok(defaultConfig.settings);
  assert.equal(defaultConfig.telegram.apiId, null);
  assert.equal(defaultConfig.telegram.apiHash, null);
  assert.equal(defaultConfig.telegram.session, null);
  assert.equal(defaultConfig.settings.defaultChatLimit, 20);
  assert.equal(defaultConfig.settings.outputFormat, 'text');
});

test('ConfigManager - loadConfig returns default config when no file exists', () => {
  const config = new ConfigManager();
  // Override config path to non-existent location
  config.configFile = '/tmp/non-existent-gramtap-config.json';
  
  const loadedConfig = config.loadConfig();
  const defaultConfig = config.getDefaultConfig();
  
  assert.equal(JSON.stringify(loadedConfig), JSON.stringify(defaultConfig));
});

test('ConfigManager - hasCredentials returns false for default config', () => {
  const config = new ConfigManager();
  config.configFile = '/tmp/non-existent-gramtap-config.json';
  
  assert.equal(config.hasCredentials(), false);
});

test('ConfigManager - validateApiId validates correctly', () => {
  const config = new ConfigManager();
  
  // Valid API IDs
  assert.ok(config.validateApiId('123456'));
  assert.ok(config.validateApiId('1'));
  assert.ok(config.validateApiId('999999999'));
  
  // Invalid API IDs
  assert.not.ok(config.validateApiId('abc'));
  assert.not.ok(config.validateApiId('123abc'));
  assert.not.ok(config.validateApiId('0'));
  assert.not.ok(config.validateApiId('-123'));
  assert.not.ok(config.validateApiId(''));
  assert.not.ok(config.validateApiId('123.456'));
});

test('ConfigManager - validateApiHash validates correctly', () => {
  const config = new ConfigManager();
  
  // Valid API Hashes (32 character hex strings)
  assert.ok(config.validateApiHash('abc123def45678901234567890123456'));
  assert.ok(config.validateApiHash('1234567890abcdef1234567890abcdef'));
  assert.ok(config.validateApiHash('ABCDEF1234567890abcdef1234567890'));
  
  // Invalid API Hashes
  assert.not.ok(config.validateApiHash('abc123')); // too short
  assert.not.ok(config.validateApiHash('abc123def456789012345678901234567890')); // too long
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456g')); // invalid character
  assert.not.ok(config.validateApiHash('')); // empty
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456 ')); // contains space
});

test('ConfigManager - setCredentials and getCredentials work correctly', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Set credentials
    const success = config.setCredentials(123456, 'abc123def45678901234567890123456');
    assert.ok(success);
    
    // Check hasCredentials
    assert.ok(config.hasCredentials());
    
    // Get credentials
    const credentials = config.getCredentials();
    assert.equal(credentials.apiId, 123456);
    assert.equal(credentials.apiHash, 'abc123def45678901234567890123456');
    assert.equal(credentials.session, null);
    
    // Verify config file was created
    assert.ok(fs.existsSync(config.configFile));
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - updateSession updates session correctly', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Set initial credentials
    config.setCredentials(123456, 'abc123def45678901234567890123456');
    
    // Update session
    const sessionString = 'test-session-string';
    const success = config.updateSession(sessionString);
    assert.ok(success);
    
    // Verify session was updated
    const credentials = config.getCredentials();
    assert.equal(credentials.session, sessionString);
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles file system errors gracefully', () => {
  const config = new ConfigManager();
  // Set config path to invalid location (root directory that we can't write to)
  config.configFile = '/invalid/path/config.json';
  
  // Should return false on save failure
  const success = config.setCredentials(123456, 'abc123def45678901234567890123456');
  assert.not.ok(success);
});

test('ConfigManager - loads existing config file correctly', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Create a config file manually
    const testConfig = {
      telegram: {
        apiId: 999999,
        apiHash: 'test123hash45678901234567890123',
        session: 'test-session'
      },
      settings: {
        defaultChatLimit: 50,
        outputFormat: 'json'
      }
    };
    
    fs.writeFileSync(config.configFile, JSON.stringify(testConfig, null, 2));
    
    // Load config
    const loadedConfig = config.loadConfig();
    
    assert.equal(loadedConfig.telegram.apiId, 999999);
    assert.equal(loadedConfig.telegram.apiHash, 'test123hash45678901234567890123');
    assert.equal(loadedConfig.telegram.session, 'test-session');
    assert.equal(loadedConfig.settings.defaultChatLimit, 50);
    assert.equal(loadedConfig.settings.outputFormat, 'json');
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles malformed JSON gracefully', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Create malformed JSON file
    fs.writeFileSync(config.configFile, '{ invalid json }');
    
    // Should fall back to default config
    const loadedConfig = config.loadConfig();
    const defaultConfig = config.getDefaultConfig();
    
    assert.equal(JSON.stringify(loadedConfig), JSON.stringify(defaultConfig));
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test.run();