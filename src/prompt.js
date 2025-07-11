const prompts = require('prompts');

class CredentialPrompt {
  async promptForCredentials() {
    console.log('\n🔐 Telegram API Credentials Setup');
    console.log('=====================================\n');
    console.log('To use Gramtap, you need to provide your Telegram API credentials.');
    console.log('If you haven\'t created an app yet, run: gramtap login --setup\n');

    const questions = [
      {
        type: 'text',
        name: 'apiId',
        message: 'Enter your API ID (numbers only):',
        validate: (value) => {
          const id = parseInt(value);
          if (isNaN(id) || id <= 0 || id.toString() !== value.toString()) {
            return 'API ID must be a positive number (e.g., 123456)';
          }
          return true;
        }
      },
      {
        type: 'text',
        name: 'apiHash',
        message: 'Enter your API Hash (32 character hex string):',
        validate: (value) => {
          if (typeof value !== 'string' || value.length !== 32) {
            return 'API Hash must be exactly 32 characters long';
          }
          if (!/^[a-f0-9]{32}$/i.test(value)) {
            return 'API Hash must contain only hexadecimal characters (0-9, a-f)';
          }
          return true;
        }
      }
    ];

    try {
      const response = await prompts(questions, {
        onCancel: () => {
          console.log('\n❌ Setup cancelled. Run the command again when you\'re ready.');
          process.exit(1);
        }
      });

      return {
        apiId: parseInt(response.apiId),
        apiHash: response.apiHash.toLowerCase()
      };
    } catch (error) {
      console.error('Error during credential setup:', error.message);
      process.exit(1);
    }
  }

  async promptForPhoneNumber() {
    console.log('\n📱 Phone Number Authentication');
    console.log('===============================\n');

    const response = await prompts({
      type: 'text',
      name: 'phoneNumber',
      message: 'Enter your phone number (with country code, e.g., +1234567890):',
      validate: (value) => {
        if (!value.startsWith('+')) {
          return 'Phone number must start with + and include country code';
        }
        if (!/^\+\d{10,15}$/.test(value)) {
          return 'Phone number must be in format +1234567890 (10-15 digits)';
        }
        return true;
      }
    }, {
      onCancel: () => {
        console.log('\n❌ Login cancelled.');
        process.exit(1);
      }
    });

    return response.phoneNumber;
  }

  async promptForVerificationCode() {
    console.log('\n🔐 Verification Code');
    console.log('=====================\n');
    console.log('A verification code has been sent to your Telegram app.');

    const response = await prompts({
      type: 'text',
      name: 'code',
      message: 'Enter the verification code:',
      validate: (value) => {
        if (!/^\d{5}$/.test(value)) {
          return 'Verification code must be 5 digits';
        }
        return true;
      }
    }, {
      onCancel: () => {
        console.log('\n❌ Login cancelled.');
        process.exit(1);
      }
    });

    return response.code;
  }

  async promptForPassword() {
    console.log('\n🔒 Two-Factor Authentication');
    console.log('=============================\n');
    console.log('Your account has 2FA enabled. Please enter your password.');

    const response = await prompts({
      type: 'password',
      name: 'password',
      message: 'Enter your 2FA password:',
      validate: (value) => {
        if (!value || value.length < 1) {
          return 'Password cannot be empty';
        }
        return true;
      }
    }, {
      onCancel: () => {
        console.log('\n❌ Login cancelled.');
        process.exit(1);
      }
    });

    return response.password;
  }

  showSuccess(configPath) {
    console.log('\n✅ Configuration Complete!');
    console.log('==========================\n');
    console.log('🎉 Your Telegram API credentials have been saved successfully!');
    console.log(`📁 Configuration stored at: ${configPath}`);
    console.log('\n🚀 You can now use Gramtap to access your Telegram account.');
    console.log('   Try running: gramtap chats');
  }

  showError(error) {
    console.log('\n❌ Configuration Failed');
    console.log('========================\n');
    console.error('Error saving credentials:', error.message);
    console.log('\n💡 Try running the setup again with: gramtap login');
  }
}

module.exports = CredentialPrompt;