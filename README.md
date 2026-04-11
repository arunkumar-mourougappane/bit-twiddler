# Bit Twiddler 🛠️

> **A Swiss-Army Developer Toolkit — offline-first, privacy-respecting, and blazingly fast.**

[![CI](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/ci.yml/badge.svg)](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/ci.yml)
[![Release](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/release.yml/badge.svg)](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/release.yml)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025E8C?logo=dependabot)](https://github.com/arunkumar-mourougappane/bit-twiddler/blob/main/.github/dependabot.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Electron](https://img.shields.io/badge/Electron-v39-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Bit Twiddler is a native desktop application built with **Electron** that gives developers instant, secure access to everyday utility tasks — encoding, hashing, formatting, decoding, converting, and more. Everything runs **100% locally**; no network requests, no telemetry.

---

## Table of Contents

- [Features](#features)
  - [Base64 Encoder / Decoder](#1-base64-encoder--decoder)
  - [Hash Generator](#2-hash-generator)
  - [Epoch Converter](#3-epoch-converter)
  - [JSON Formatter](#4-json-formatter--parser)
  - [JWT Decoder](#5-jwt-decoder)
  - [Color Converter](#6-color-converter)
  - [UUID Generator](#7-uuid-generator)
  - [QR Code Generator](#8-qr-code-generator)
  - [Regex Tester](#9-regex-tester)
  - [Diff Viewer](#10-diff-viewer)
  - [Base Converter](#11-base-converter)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

### 1. Base64 Encoder / Decoder

Instantly encode plaintext to Base64 or decode Base64 back to plaintext in a live split-pane view.

- **Real-time** — output updates on every keystroke
- **Bidirectional** — type in either pane; the other updates automatically
- **Copy to clipboard** — one-click copy button on the output side

---

### 2. Hash Generator

Generate cryptographic hashes for both **text strings** and **files**, powered by Node.js's native `crypto` module over a secure IPC bridge.

#### Text Hashing

- Hashes update live as you type
- Simultaneous output for **MD5**, **SHA-1**, **SHA-256**, and **SHA-512**

#### File Hashing

- Select any file via the native file picker
- Memory-efficient streaming via `fs.createReadStream` — handles files of any size without blocking the UI
- **Live watching** — uses `fs.watch` with a 300 ms debounce to automatically recalculate hashes whenever the file changes on disk
- Visual loading spinner during calculation and a "Calculation Complete" badge on completion

---

### 3. Epoch Converter

A bidirectional Unix timestamp utility.

- **Timestamp → Date**: Enter a Unix timestamp in seconds or milliseconds to get the equivalent local time and UTC (GMT)
- **Date → Timestamp**: Pick a date and time from a native date picker and read back its Unix epoch value
- **"Now" button**: Instantly populate the current Unix timestamp

---

### 4. JSON Formatter & Parser

A dual-pane JSON workspace with syntax highlighting and interactive tree exploration.

- **Paste raw JSON** on the left; the right pane renders it immediately
- **Text View**: Pretty-printed JSON with colour-coded syntax highlighting for strings, numbers, booleans, and null values
- **Tree View**: Fully interactive, collapsible tree. Each node shows:
  - The key name
  - A colour-coded **type badge** (Object, Array, String, Number, Boolean, Null) placed directly after the colon
  - The value (or a fold/unfold chevron for nested structures)
- **Search**: Uses the native browser `window.find()` API for instant in-page searching across the formatted output
- **Copy JSON**: Copies the entire formatted JSON string to the clipboard with one click
- **Clear**: Resets both panes

---

### 5. JWT Decoder

Decode any JSON Web Token (JWT) into its three constituent parts without sending it to any server.

- **Paste a raw JWT** (Base64Url-encoded) into the input pane
- The decoder splits the token and decodes:
  - **Header** — algorithm, token type
  - **Payload** — claims (sub, iat, exp, custom fields, etc.)
  - **Signature** — raw Base64Url string, displayed for reference
- Header and Payload are rendered using the same syntax-highlighted, collapsible **Tree View** as the JSON Formatter
- **Searchable** — find any claim key or value instantly
- **No secrets leave the machine** — decoding is pure Base64Url string manipulation in the renderer

---

### 6. Color Converter

Explore a color across multiple color spaces from a single hex input.

- Enter any **3-digit** (`#abc`) or **6-digit** (`#aabbcc`) hex string
- A large **rounded color swatch** renders the exact color at the top of the output panel
- Real-time conversion outputs:
  - **HEX** — normalized 6-digit representation
  - **RGB** — `rgb(R, G, B)` with 0–255 channels
  - **HSL** — `hsl(H°, S%, L%)` hue-saturation-lightness
  - **CMYK** — `cmyk(C%, M%, Y%, K%)` print color model
- All math is performed locally in the renderer with no rounding hacks

---

### 7. UUID Generator

Generate batches of cryptographically secure UUIDs (v4) in one click.

- **Quantity**: Configure from 1 to 1,000 UUIDs per generation
- **Uppercase toggle**: Output in `UPPERCASE` format
- **Remove Hyphens toggle**: Strip `-` delimiters for raw 32-character hex strings
- **Copy All**: Copies the entire list to the clipboard
- Uses `window.crypto.randomUUID()` — a browser-native CSPRNG, no third-party dependency

---

### 8. QR Code Generator

Turn any string or URL into a scannable QR Code in real-time.

- **Live generation** — the QR code re-renders on every keystroke
- Uses the `qrcode` npm package on the **main process** via IPC (`ipcMain.handle('generate-qr')`) to ensure compatibility with Electron's renderer sandbox
- Renders as a native `<img>` element from a Base64 PNG Data URL
- **Download**: Export the generated QR code as a `qrcode.png` file with one click
- **Clear**: Reset input and hide the output image

---

### 9. Regex Tester

Write, test, and debug regular expressions against live test strings with instant visual feedback.

- **Pattern bar**: Styled with `/` delimiters; supports all standard JS flags:
  - `g` — global (default on)
  - `i` — case-insensitive
  - `m` — multiline
  - `s` — dot-all (`.` matches newlines)
- **Validity badge**: Shows `✓ valid` in green or the exact error message in red as you type
- **Split pane**:
  - Left — editable test string textarea
  - Right — the same text but with every match wrapped in a `<mark>` highlight
- **Match count** displayed in the panel header
- **Match detail list** below the highlights — each entry shows:
  - Match number
  - Character position (`@N`)
  - Matched value
  - Capture groups (`$1`, `$2`, ...)
- Zero-width match protection prevents infinite loops on empty-string matches

---

### 10. Diff Viewer

Compare two blocks of text and see exactly what changed, line by line.

- **Two input panes** — Original (red dot) and Modified (green dot)
- **Pure LCS diff algorithm** implemented in-house using an `Int32Array` DP table — no external library, no network call
- **Unified diff output**:
  - `+` lines — added (green background, green text)
  - `-` lines — removed (red background, red strikethrough)
  - ` ` lines — unchanged context (muted gray)
- **Stats bar** shows `+N added` / `-N removed` or "Identical" live
- Updates on every keystroke in either input

---

### 11. Base Converter

Convert any integer between the four most common number bases simultaneously.

- **Input field** with a **source base selector** (Binary / Octal / Decimal / Hex)
- Strict per-base input validation (e.g., binary rejects `2–9` and letters)
- **Four output cards** updating in real-time:
  - **BIN** (Base 2) — space-separated nibbles (`1101 0110`)
  - **OCT** (Base 8)
  - **DEC** (Base 10)
  - **HEX** (Base 16) — `0x`-prefixed uppercase
- Each card has a **hover-reveal Copy** button
- **Bit visualization panel** — renders the binary value as individual colored bit cells:
  - `1` bits in amber, `0` bits in muted gray
  - Byte groups separated by `|` dividers
  - Auto-sizes to **8, 16, 32, or 64-bit** width based on the magnitude of the value

---

## Tech Stack

| Layer        | Technology                                           | Purpose                                             |
| ------------ | ---------------------------------------------------- | --------------------------------------------------- |
| **Shell**    | [Electron](https://www.electronjs.org/) v36          | Native window, IPC, file system access              |
| **Frontend** | HTML5 + [jQuery](https://jquery.com/)                | DOM structure and reactive event handling           |
| **Styling**  | [Tailwind CSS](https://tailwindcss.com/) v3          | Utility-first dark-mode design system               |
| **Crypto**   | Node.js `crypto` (built-in)                          | MD5 / SHA hashing via secure IPC bridge             |
| **File I/O** | Node.js `fs` (built-in)                              | Streaming file hashing + `fs.watch` live monitoring |
| **QR Code**  | [`qrcode`](https://www.npmjs.com/package/qrcode) npm | Server-side QR matrix generation as PNG Data URL    |

---

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│                  Renderer Process                   │
│  (Chromium — index.html + renderer.js + jQuery)     │
│                                                     │
│  All UI logic, tool computations (regex, diff,      │
│  base conversion, color math, JWT decode, etc.)     │
└───────────────────┬─────────────────────────────────┘
                    │  contextBridge (preload.js)
                    │  window.api.{hashText, hashFile,
                    │             generateQR, onFileHashUpdate}
┌───────────────────▼─────────────────────────────────┐
│                   Main Process                      │
│  (Node.js — main.js)                                │
│                                                     │
│  ipcMain handlers:                                  │
│    generate-hashes  → crypto.createHash()           │
│    hash-file        → fs.createReadStream() + watch │
│    generate-qr      → qrcode.toDataURL()            │
└─────────────────────────────────────────────────────┘
```

**Security model**: `nodeIntegration: false` + `contextIsolation: true`. Node APIs are never exposed directly to the renderer — all cross-process communication goes through a narrow, explicitly-typed `contextBridge` surface defined in `preload.js`.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes `npm`)

### Installation

```bash
git clone https://github.com/arunkumar-mourougappane/bit-twiddler.git
cd bit-twiddler
npm install
```

### Running

```bash
npm start
```

This command **compiles Tailwind CSS** from `src/input.css` into `src/styles.css` first, then launches the Electron window.

### Building CSS only

```bash
npm run build:css
```

---

## Project Structure

```
bit-twiddler/
├── main.js              # Main process: window lifecycle, IPC handlers, fs.watch
├── preload.js           # contextBridge: exposes api.{hashText,hashFile,generateQR}
├── package.json
├── tailwind.config.js
└── src/
    ├── index.html       # App shell + all tool section HTML
    ├── input.css        # Tailwind source + custom keyframe animations
    ├── styles.css       # Compiled Tailwind output (generated, do not edit)
    └── renderer.js      # All frontend tool logic (jQuery event handlers)
```

---

## License

ISC License — see [`LICENSE`](./LICENSE) for details.
