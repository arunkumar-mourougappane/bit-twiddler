# Bit Twiddler v1.0.0 — Release Notes

> **Release date:** 2026-04-11
> **Platform support:** macOS · Windows · Linux

---

## 🎉 First Release

Bit Twiddler is a native desktop application built with Electron that gives developers instant, offline access to 40+ everyday utility tools — encoding, hashing, formatting, decoding, converting, and more. Everything runs **100% locally** with no network requests and no telemetry.

---

## ✨ Highlights

### 40+ Developer Tools in One App

Seven categories of tools covering the full developer workflow:

| Category             | Tools                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security & Encoding  | Base64, Hash Generator, JWT Decoder, Password Generator, PEM Inspector, URL Encoder, HTML Entities                                                                                           |
| Data & Time          | JSON Formatter, YAML↔JSON, SQL Formatter, HTML/XML Beautifier, Epoch Converter, Unit Converter                                                                                               |
| Network              | CIDR / Subnet Calculator                                                                                                                                                                     |
| Low-Level & Embedded | Bits & Masks, CRC & Checksum, Endianness Swapper, C-Array Formatter, Integer Limits, Resistor Color Code, Voltage Divider, Baud Rate Error, Q-Format, COBS Framing, Protocol Reference Cards |
| Development          | Regex Tester, Diff Viewer, Cron Parser, QR Code Generator, Markdown Previewer                                                                                                                |
| Content & Misc       | Lorem Ipsum, String Inspector, Color Converter, Case Converter, Text Transformer, Naming Helper                                                                                              |
| Reference            | HTTP Status Codes, MIME Type Lookup                                                                                                                                                          |

### Privacy-First, Offline-Only

No data ever leaves your machine. No accounts, no telemetry, no cloud dependencies.

### Smart Sidebar

- Press `/` to search and filter tools in real time
- Star ☆ any tool to pin it as a favorite
- Accordion categories remember their open/closed state across sessions
- Four accent themes: Ocean, Violet, Emerald, Rose
- Keyboard shortcuts `⌘1`–`⌘9` for instant tool navigation

### Secure Electron Architecture

- `nodeIntegration: false` + `contextIsolation: true` enforced throughout
- All Node.js access goes through a typed `contextBridge` in `preload.js`
- No renderer process has direct access to the file system or Node APIs

---

## 📦 Downloads

| Platform | Package                 |
| -------- | ----------------------- |
| macOS    | `.dmg` · `.zip`         |
| Windows  | `.exe` (NSIS installer) |
| Linux    | `.AppImage`             |

---

## 🛠 Tech Stack

Electron v41 · Node.js v18+ · jQuery v4 · Tailwind CSS v4 · esbuild

---

## 📄 License

Bit Twiddler is dual-licensed:

- **MIT License** — free for personal, academic, and open-source (non-commercial) use
- **Commercial License** — required for revenue-generating or commercial use

See [`LICENSE`](./LICENSE) for full terms.

---

## 🔗 Links

- [Repository](https://github.com/arunkumar-mourougappane/bit-twiddler)
- [Full Changelog](./CHANGELOG.md)
- [License](./LICENSE)
