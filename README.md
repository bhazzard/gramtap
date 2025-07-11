# 📟 Gramtap

**Gramtap** is a lightweight, scriptable, and user-friendly **command-line interface for Telegram** — built for developers, hackers, and terminal lovers.

No GUI. No distractions. Just your messages, your chats, and the raw power of the Telegram API from the comfort of your terminal.

---

## 🚀 What is Gramtap?

Gramtap lets you:

- ✅ Log in to your Telegram account securely
- ✅ Browse your recent chats from the terminal
- ✅ Read message history from any conversation
- ✅ Communicate with other tools via an optional **MCP (Multi-Client Protocol)** stdio server
- ✅ Do all of this with minimal dependencies and fast startup

Built on [GramJS](https://gram.js.org), Gramtap wraps Telegram’s powerful MTProto API in a CLI you’ll actually enjoy using.

---

## ⚠️ Project Status: Pre-Release (v0.1)

Gramtap is currently under active development. The MVP feature set is being finalized, including:

- `gramtap login` — Authenticate with Telegram via phone number and 2FA
- `gramtap chats` — View a list of your recent conversations
- `gramtap read <chat>` — Read messages from a specific chat
- `gramtap mcp` — Start a stdio-based MCP server for programmatic interaction

**⚒️ Currently:** Core structure and commands are in place. Login and session handling are functional. Additional features and polish are in progress.

We welcome early feedback and contributions from adventurous developers!

---

## 📦 Installation

Once released, installing Gramtap will be as easy as:

```bash
npm install -g gramtap
````

No native dependencies. No build tools. Just Node and your Telegram credentials.

---

## ✨ Why Gramtap?

* 🧠 **Minimal dependencies** – No bloated installs
* 🛠️ **Built for scripting** – Ideal for power users, automation, and TUI shells
* ⚡ **Fast and focused** – Gets out of your way
* 🧪 **Fully tested** – Unit-tested with [`uvu`](https://github.com/lukeed/uvu) and integration-tested with [`judo`](https://github.com/intuit/judo)

---

## 🧰 Usage Examples

```bash
# Authenticate with Telegram
gramtap login

# List your recent chats
gramtap chats

# Read the last 20 messages from a chat
gramtap read "My Best Friend"
```

---

## 🔐 Getting Started

To use Gramtap, you’ll need a Telegram **API ID** and **API Hash**. Don’t worry — we’ll walk you through it on first run. The short version:

1. Visit [my.telegram.org](https://my.telegram.org)
2. Log in and click **API Development Tools**
3. Create a new app and save your credentials
4. Run `gramtap login` and follow the prompts

---

## 🛤️ Roadmap for v1.0

* [ ] Session-based user login
* [ ] Chat list viewer
* [ ] Message reader
* [ ] MCP stdio server
* [ ] Interactive message navigation
* [ ] First public release to npm

---

## 🧠 Contributing

Contributions are welcome! Please:

* Fork the repo
* Follow the coding style
* Include tests for new features
* Keep the CLI output clean and accessible

You can run tests with:

```bash
npm test
```

We use [`uvu`](https://github.com/lukeed/uvu) for unit testing and [`judo`](https://github.com/intuit/judo) for full CLI integration testing.

---

## 🧙 About the Name

> **Gramtap** = *Gram* (Telegram) + *Tap* (as in tapping into it)
> It's a terminal tap into the Telegram firehose.

---

## 🗣️ License

MIT License. Open source, always.
