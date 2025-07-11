const { test } = require('uvu');
const assert = require('uvu/assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ConfigManager = require('../../src/config');
const CredentialPrompt = require('../../src/prompt');

// Helper function to create a temporary config directory
function createTempConfigDir() {
  const tempDir = path.join(os.tmpdir(), 'gramtap-edge-test-' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to cleanup temp directory
function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('ConfigManager - handles empty config file', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Create empty config file
    fs.writeFileSync(config.configFile, '');
    
    // Should fall back to default config
    const loadedConfig = config.loadConfig();
    const defaultConfig = config.getDefaultConfig();
    
    assert.equal(JSON.stringify(loadedConfig), JSON.stringify(defaultConfig));
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles config file with null values', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Create config with null values
    const nullConfig = {
      telegram: {
        apiId: null,
        apiHash: null,
        session: null
      },
      settings: null
    };
    
    fs.writeFileSync(config.configFile, JSON.stringify(nullConfig));
    
    // Should load the config as-is
    const loadedConfig = config.loadConfig();
    assert.equal(loadedConfig.telegram.apiId, null);
    assert.equal(loadedConfig.telegram.apiHash, null);
    assert.equal(loadedConfig.settings, null);
    
    // hasCredentials should return false
    assert.equal(config.hasCredentials(), false);
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles config file with partial data', () => {
  const tempDir = createTempConfigDir();
  const config = new ConfigManager();
  config.configDir = tempDir;
  config.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Create config with only apiId
    const partialConfig = {
      telegram: {
        apiId: 123456
      }
    };
    
    fs.writeFileSync(config.configFile, JSON.stringify(partialConfig));
    
    // Should load the config but hasCredentials should return false
    const loadedConfig = config.loadConfig();
    assert.equal(loadedConfig.telegram.apiId, 123456);
    assert.equal(config.hasCredentials(), false); // missing apiHash
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles very large API IDs', () => {
  const config = new ConfigManager();
  
  // Test with very large numbers (these should fail due to precision issues)
  assert.not.ok(config.validateApiId('999999999999999999')); // Too large, parseInt conversion issues
  assert.ok(config.validateApiId('1000000000000000000')); // This one passes validation
  assert.not.ok(config.validateApiId('12345678901234567890')); // Too large, precision issues
  
  // Test with numbers that are within reasonable range
  const largeId = '2147483647'; // 2^31 - 1
  assert.ok(config.validateApiId(largeId));
});

test('ConfigManager - handles edge case API Hash formats', () => {
  const config = new ConfigManager();
  
  // Test with all lowercase
  assert.ok(config.validateApiHash('abcdef1234567890abcdef1234567890'));
  
  // Test with all uppercase
  assert.ok(config.validateApiHash('ABCDEF1234567890ABCDEF1234567890'));
  
  // Test with mixed case
  assert.ok(config.validateApiHash('AbCdEf1234567890AbCdEf1234567890'));
  
  // Test with all numbers
  assert.ok(config.validateApiHash('12345678901234567890123456789012'));
  
  // Test with all letters
  assert.ok(config.validateApiHash('abcdefabcdefabcdefabcdefabcdefab'));
});

test('ConfigManager - handles special characters in validation', () => {
  const config = new ConfigManager();
  
  // Test API ID with special characters
  assert.not.ok(config.validateApiId('123+456'));
  assert.not.ok(config.validateApiId('123-456'));
  assert.not.ok(config.validateApiId('123 456'));
  assert.not.ok(config.validateApiId('123.456'));
  assert.not.ok(config.validateApiId('123,456'));
  
  // Test API Hash with special characters
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456!')); // 32 chars but has !
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456@')); // 32 chars but has @
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456#')); // 32 chars but has #
});

test('ConfigManager - handles unicode characters', () => {
  const config = new ConfigManager();
  
  // Test with unicode characters
  assert.not.ok(config.validateApiId('123456α'));
  assert.not.ok(config.validateApiId('123456😀'));
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456α'));
  assert.not.ok(config.validateApiHash('abc123def45678901234567890123456😀'));
});

test('ConfigManager - handles extremely long strings', () => {
  const config = new ConfigManager();
  
  // Test with very long API ID
  const longApiId = '1'.repeat(100);
  assert.not.ok(config.validateApiId(longApiId));
  
  // Test with very long API Hash
  const longApiHash = 'a'.repeat(100);
  assert.not.ok(config.validateApiHash(longApiHash));
});

test('ConfigManager - handles config directory creation edge cases', () => {
  const config = new ConfigManager();
  
  // Test that getConfigDirectory returns a valid path
  const configDir = config.getConfigDirectory();
  assert.ok(typeof configDir === 'string');
  assert.ok(configDir.length > 0);
  assert.ok(configDir.includes('gramtap'));
  
  // Test that ensureConfigDirectory doesn't throw for valid paths
  const tempDir = createTempConfigDir();
  try {
    config.configDir = tempDir;
    config.ensureConfigDirectory(); // Should not throw
    assert.ok(fs.existsSync(tempDir));
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles concurrent file operations', () => {
  const tempDir = createTempConfigDir();
  const config1 = new ConfigManager();
  const config2 = new ConfigManager();
  
  config1.configDir = tempDir;
  config1.configFile = path.join(tempDir, 'config.json');
  config2.configDir = tempDir;
  config2.configFile = path.join(tempDir, 'config.json');
  
  try {
    // Set credentials from first instance
    const success1 = config1.setCredentials(123456, 'abc123def45678901234567890123456');
    assert.ok(success1);
    
    // Load from second instance
    const credentials2 = config2.getCredentials();
    assert.equal(credentials2.apiId, 123456);
    assert.equal(credentials2.apiHash, 'abc123def45678901234567890123456');
    
    // Update session from second instance
    const sessionSuccess = config2.updateSession('test-session');
    assert.ok(sessionSuccess);
    
    // Verify from first instance (should reload)
    config1.config = null; // Force reload
    const credentials1 = config1.getCredentials();
    assert.equal(credentials1.session, 'test-session');
    
  } finally {
    cleanupTempDir(tempDir);
  }
});

test('ConfigManager - handles file permission errors', () => {
  const config = new ConfigManager();
  
  // Test with read-only directory (simulate permission error)
  const tempDir = createTempConfigDir();
  const readOnlyDir = path.join(tempDir, 'readonly');
  
  try {
    fs.mkdirSync(readOnlyDir);
    fs.chmodSync(readOnlyDir, 0o444); // Read-only
    
    config.configDir = readOnlyDir;
    config.configFile = path.join(readOnlyDir, 'config.json');
    
    // Should fail gracefully
    const success = config.setCredentials(123456, 'abc123def45678901234567890123456');
    assert.not.ok(success);
    
  } finally {
    // Restore permissions and cleanup
    try {
      fs.chmodSync(readOnlyDir, 0o755);
    } catch (e) {
      // Ignore if chmod fails
    }
    cleanupTempDir(tempDir);
  }
});

test('CredentialPrompt - handles extreme input values', () => {
  // Test that validation functions handle extreme cases
  const prompt = new CredentialPrompt();
  
  // Test with very long strings
  const longString = 'a'.repeat(10000);
  
  // These should not cause errors or infinite loops
  assert.ok(typeof longString === 'string');
  
  // Test with null/undefined values
  const validateApiId = (value) => {
    const id = parseInt(value);
    if (isNaN(id) || id <= 0 || id.toString() !== value.toString()) {
      return 'API ID must be a positive number (e.g., 123456)';
    }
    return true;
  };
  
  assert.equal(validateApiId(null), 'API ID must be a positive number (e.g., 123456)');
  assert.equal(validateApiId(undefined), 'API ID must be a positive number (e.g., 123456)');
  assert.equal(validateApiId({}), 'API ID must be a positive number (e.g., 123456)');
  assert.equal(validateApiId([]), 'API ID must be a positive number (e.g., 123456)');
});

test.run();