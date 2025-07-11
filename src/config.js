const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = this.getConfigDirectory();
    this.configFile = path.join(this.configDir, 'config.json');
    this.config = null;
  }

  getConfigDirectory() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    switch (platform) {
      case 'win32':
        return path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'gramtap');
      case 'darwin':
        return path.join(homeDir, 'Library', 'Application Support', 'gramtap');
      default:
        return path.join(process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config'), 'gramtap');
    }
  }

  ensureConfigDirectory() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  loadConfig() {
    if (this.config) {
      return this.config;
    }

    try {
      if (fs.existsSync(this.configFile)) {
        const configData = fs.readFileSync(this.configFile, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        this.config = this.getDefaultConfig();
      }
    } catch (error) {
      console.error('Error loading config:', error.message);
      this.config = this.getDefaultConfig();
    }

    return this.config;
  }

  getDefaultConfig() {
    return {
      telegram: {
        apiId: null,
        apiHash: null,
        session: null
      },
      settings: {
        defaultChatLimit: 20,
        outputFormat: 'text'
      }
    };
  }

  saveConfig() {
    try {
      this.ensureConfigDirectory();
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving config:', error.message);
      return false;
    }
  }

  hasCredentials() {
    const config = this.loadConfig();
    return !!(config.telegram.apiId && config.telegram.apiHash);
  }

  getCredentials() {
    const config = this.loadConfig();
    return {
      apiId: config.telegram.apiId,
      apiHash: config.telegram.apiHash,
      session: config.telegram.session
    };
  }

  setCredentials(apiId, apiHash, session = null) {
    const config = this.loadConfig();
    config.telegram.apiId = apiId;
    config.telegram.apiHash = apiHash;
    if (session) {
      config.telegram.session = session;
    }
    this.config = config;
    return this.saveConfig();
  }

  updateSession(session) {
    const config = this.loadConfig();
    config.telegram.session = session;
    this.config = config;
    return this.saveConfig();
  }

  validateApiId(apiId) {
    const id = parseInt(apiId);
    return !isNaN(id) && id > 0 && id.toString() === apiId.toString();
  }

  validateApiHash(apiHash) {
    return typeof apiHash === 'string' && 
           apiHash.length === 32 && 
           /^[a-f0-9]{32}$/i.test(apiHash);
  }

  getConfigPath() {
    return this.configFile;
  }
}

module.exports = ConfigManager;