# Bit Twiddler 🛠️

> [!WARNING]
> **This repository is archived and no longer maintained.**
> Development has moved to the Rust rewrite: **[bit-twiddler-rs](https://github.com/arunkumar-mourougappane/bit-twiddler-rs)**
> Please use that project for all new work and issue reports. This repo is kept for historical reference only.

---

> **A Swiss-Army Developer Toolkit — offline-first, privacy-respecting, and blazingly fast.**

[![GitHub Release](https://img.shields.io/github/v/release/arunkumar-mourougappane/bit-twiddler?label=release)](https://github.com/arunkumar-mourougappane/bit-twiddler/releases/latest)
[![CI](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/ci.yml/badge.svg)](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/ci.yml)
[![Release](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/release.yml/badge.svg)](https://github.com/arunkumar-mourougappane/bit-twiddler/actions/workflows/release.yml)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025E8C?logo=dependabot)](https://github.com/arunkumar-mourougappane/bit-twiddler/blob/main/.github/dependabot.yml)
[![License: MIT + Commercial](https://img.shields.io/badge/License-MIT%20%2B%20Commercial-blue.svg)](./LICENSE)
[![Electron](https://img.shields.io/badge/Electron-v41-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Bit Twiddler is a native desktop application built with **Electron** that gives developers instant, secure access to 40+ everyday utility tasks — encoding, hashing, formatting, decoding, converting, and more. Everything runs **100% locally**; no network requests, no telemetry.

---

## Table of Contents

- [Features](#features)
  - [Security & Encoding](#security--encoding)
  - [Data & Time](#data--time)
  - [Network](#network)
  - [Low-Level & Embedded](#low-level--embedded)
  - [Development](#development)
  - [Content & Misc](#content--misc)
  - [Reference](#reference)
- [Sidebar & UI](#sidebar--ui)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Build System](#build-system)
- [Getting Started](#getting-started)
- [License](#license)

---

## Features

Tools are organized into seven categories in the sidebar.

---

### Security & Encoding

#### Base64 Encoder / Decoder

Instantly encode plaintext to Base64 or decode Base64 back to plaintext in a live split-pane view.

- **Real-time** — output updates on every keystroke
- **Bidirectional** — type in either pane; the other updates automatically
- **Copy to clipboard** — one-click copy button on the output side

#### Hash Generator

Generate cryptographic hashes for both **text strings** and **files**, powered by Node.js's native `crypto` module over a secure IPC bridge.

- **Text hashing** — live output for **MD5**, **SHA-1**, **SHA-256**, and **SHA-512** simultaneously as you type
- **File hashing** — memory-efficient streaming via `fs.createReadStream`, handles files of any size without blocking the UI
- **Live file watching** — uses `fs.watch` with a 300 ms debounce to automatically recalculate whenever the file changes on disk
- Visual loading spinner during calculation; "Calculation Complete" badge on finish

#### JWT Decoder

Decode any JSON Web Token (JWT) into its three constituent parts without sending it anywhere.

- Decodes **Header**, **Payload**, and **Signature** from a pasted Base64Url token
- Header and Payload rendered as syntax-highlighted, collapsible **Tree Views**
- **Searchable** — find any claim key or value instantly
- Pure client-side Base64Url manipulation; no secrets leave the machine

#### Password Generator

Generate cryptographically secure passwords using the Web Crypto API (`window.crypto`).

- Configure length, and toggle inclusion of uppercase, lowercase, numbers, and symbols
- Strength indicator updates in real time
- One-click copy to clipboard

#### PEM / Certificate Inspector

Inspect and decode X.509 certificates and PEM-encoded blocks.

- Paste any PEM block (certificate, public key, private key) for structured field extraction
- Displays subject, issuer, validity dates, serial number, and key algorithm

#### URL Encoder / Decoder

Safely encode or decode URL components and query parameters.

- **Bidirectional** — encode special characters to `%XX` form or decode them back
- Handles full URLs as well as individual query string components

#### HTML Entity Encoder / Decoder

Convert characters to HTML entities and vice versa for safe web rendering.

- Encodes `<`, `>`, `&`, `"`, `'`, and extended Unicode characters
- Decodes named (`&amp;`) and numeric (`&#x26;`) entities

---

### Data & Time

#### JSON Formatter

A dual-pane JSON workspace with syntax highlighting and interactive tree exploration.

- **Text View** — pretty-printed JSON with colour-coded syntax highlighting
- **Tree View** — fully interactive collapsible tree with type badges (Object, Array, String, Number, Boolean, Null)
- **Search** — uses `window.find()` for instant in-page search across formatted output
- Copy formatted JSON or clear both panes with one click

#### YAML ⟷ JSON

Convert between YAML and JSON formats bidirectionally.

- Paste YAML to get JSON, or paste JSON to get YAML
- Error messages displayed inline for invalid input

#### SQL Formatter

Pretty-print and minify SQL queries for various dialects.

- Supports multiple SQL dialects (PostgreSQL, MySQL, SQLite, etc.)
- Toggle between **formatted** and **minified** output

#### HTML / XML Beautifier

Clean up and format messy HTML or XML markup.

- Indents nested tags consistently
- Useful for minified or machine-generated markup

#### Epoch Converter

A bidirectional Unix timestamp utility.

- **Timestamp → Date** — enter seconds or milliseconds to get local time and UTC
- **Date → Timestamp** — pick a date/time and read back the Unix epoch value
- **"Now" button** — instantly populate the current timestamp

#### Unit Converter

Convert data sizes and time durations across all common units.

- **Data sizes** — bits, bytes, KB, MB, GB, TB
- **Time durations** — nanoseconds through years

---

### Network

#### CIDR / Subnet Calculator

Calculate IP ranges, masks, and network details for IPv4.

- Enter a CIDR notation address (e.g., `192.168.1.0/24`)
- Outputs network address, broadcast address, subnet mask, host range, and total host count

---

### Low-Level & Embedded

#### Bits & Masks

Interactive bit-level manipulator for 64-bit values.

- Toggle individual bits with a visual bit grid
- Input a value in decimal or hex; see the binary representation update live
- Generate bitmasks and display AND/OR/XOR results

#### CRC & Checksum

Calculate data integrity check values for common polynomials.

- Supports **CRC-8**, **CRC-16**, **CRC-32**, and **CRC-CCITT**
- Input data as hex bytes or ASCII text

#### Endianness Swapper

Instantly swap byte order for 16, 32, and 64-bit integer values.

- Enter a value in hex; get both little-endian and big-endian representations
- Useful when debugging protocol captures or memory dumps

#### C-Array Formatter

Convert data streams into formatted C/C++ byte arrays for firmware integration.

- Paste hex bytes and get a `uint8_t buf[] = { ... };` declaration
- Configurable variable name, width, and output style

#### Integer Limits Reference

Quick-glance reference for standard C/C++ integer types (`stdint.h`).

- Shows min/max values for `int8_t` through `uint64_t`
- Displays both decimal and hex limits

#### Resistor Color Code

Decode resistance values from 4, 5, and 6-band color codes.

- Select colors from dropdown menus for each band
- Displays resistance value, tolerance, and temperature coefficient

#### Voltage Divider / Ohm's Law

Calculate voltage dividers and basic circuit parameters.

- Input two resistor values and supply voltage
- Outputs output voltage, current, and power dissipation

#### Baud Rate Error

Analyze timing errors between clock frequency and target UART baud rates.

- Enter system clock and desired baud rate
- Calculates actual achievable baud rate, prescaler, and percentage error

#### Fixed-Point Q-Format

Convert between floating-point and fixed-point representations (Qm.n).

- Specify the Q-format (e.g., Q8.8, Q1.15)
- Converts a floating-point value to its integer fixed-point equivalent and back

#### COBS Framing

Consistent Overhead Byte Stuffing for reliable serial data framing.

- Encode raw hex byte sequences to COBS framing
- Decode COBS-encoded frames back to original data

#### Protocol Reference Cards

Quick-glance reference for common hardware communication protocols and pinouts.

- Covers **I²C**, **SPI**, **UART**, **CAN**, **USB**, and more
- Shows signal names, timing diagrams, and key configuration parameters

---

### Development

#### Regex Tester

Write, test, and debug regular expressions against live test strings with instant visual feedback.

- Supports all standard JS flags: `g`, `i`, `m`, `s`
- **Validity badge** — `✓ valid` in green or exact error in red as you type
- **Split pane** — left is the editable test string; right highlights every match with `<mark>`
- Match count in header; detail list below showing position, value, and capture groups
- Zero-width match protection prevents infinite loops

#### Diff Viewer

Compare two blocks of text and see exactly what changed, line by line.

- Pure LCS diff algorithm implemented with an `Int32Array` DP table — no library
- **Unified diff output** with `+` (added), `-` (removed), and context lines
- Stats bar shows `+N added / -N removed` or "Identical" in real time

#### Cron Expression Parser

Validate and explain Crontab expressions in plain English.

- Powered by the `cronstrue` library
- Shows the next N scheduled run times
- Supports standard 5-field and 6-field (with seconds) expressions

#### QR Code Generator

Turn any string or URL into a scannable QR code in real time.

- Live generation on every keystroke via `qrcode` npm package over IPC
- Rendered as a `<img>` from a Base64 PNG Data URL
- **Download** as `qrcode.png` with one click

#### Markdown Previewer

Write Markdown on the left and see the rendered preview on the right instantly.

- Rendered server-side via the `marked` library over IPC (`render-markdown`)
- Styled with a full typography system (headings, code blocks, tables, blockquotes)

---

### Content & Misc

#### Lorem Ipsum Generator

Generate professional placeholder text for mockups and designs.

- Choose number of paragraphs, sentences, or words
- Copy generated text to clipboard

#### String Inspector

Analyze any text string and extract detailed statistics instantly.

- Character count, word count, line count, sentence count
- Byte count (UTF-8), unique character count, average word length
- Character frequency breakdown

#### Color Converter

Explore a color across multiple color spaces from a single hex input.

- Enter any 3-digit (`#abc`) or 6-digit (`#aabbcc`) hex string
- Live **color swatch** at the top of the output panel
- Real-time outputs: **HEX**, **RGB**, **HSL**, and **CMYK**

#### Case Converter

Instantly convert text between different naming and letter-case conventions.

- Converts to: `camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `SCREAMING_SNAKE`, `Title Case`, `UPPER`, `lower`

#### Text Transformer

Sort, filter, and modify text lists in bulk.

- Sort lines alphabetically or by length
- Deduplicate, reverse, trim whitespace, number lines, and more

#### Variable & Function Naming Helper

Get naming suggestions for your code based on common conventions.

- Enter a plain-English description; get suggestions in all major naming styles

---

### Reference

#### HTTP Status Codes

Quick reference for HTTP response status codes and their meanings.

- Searchable list of all 1xx–5xx status codes
- Each entry shows the code, name, and a plain-English description

#### MIME Type Lookup

Find MIME types by file extension or vice-versa.

- Search by extension (e.g., `.json`) or type string (e.g., `application/json`)
- Covers hundreds of common and uncommon MIME types

---

## Sidebar & UI

- **Categorized accordion** — tools are grouped into 7 collapsible categories; state is persisted in `localStorage`
- **Search** — press `/` to focus the search bar and filter tools by name in real time; matching categories auto-expand
- **Favorites** — click the ☆ star on any tool to pin it to the top of the list; persisted across sessions
- **Theme picker** — choose from four accent color schemes: Ocean (default), Violet, Emerald, and Rose
- **Animated sliding pill** — a smooth indicator tracks the active tool as you navigate

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus sidebar search |
| `⌘1` – `⌘9` / `Ctrl+1` – `Ctrl+9` | Jump to tool by position |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Shell** | [Electron](https://www.electronjs.org/) v41 | Native window, IPC, file system access |
| **Frontend** | HTML5 + [jQuery](https://jquery.com/) v4 | DOM structure and reactive event handling |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 | Utility-first dark-mode design system |
| **Bundler** | [esbuild](https://esbuild.github.io/) | Fast JS bundling for the renderer |
| **Crypto** | Node.js `crypto` (built-in) | MD5 / SHA hashing via secure IPC bridge |
| **File I/O** | Node.js `fs` (built-in) | Streaming file hashing + `fs.watch` live monitoring |
| **QR Code** | [`qrcode`](https://www.npmjs.com/package/qrcode) | Server-side QR matrix generation as PNG Data URL |
| **Markdown** | [`marked`](https://marked.js.org/) | Markdown-to-HTML rendering over IPC |
| **Cron** | [`cronstrue`](https://www.npmjs.com/package/cronstrue) | Human-readable cron expression parsing |
| **SQL** | [`sql-formatter`](https://www.npmjs.com/package/sql-formatter) | SQL pretty-printing across dialects |
| **YAML** | [`js-yaml`](https://www.npmjs.com/package/js-yaml) | YAML ↔ JSON conversion |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                     │
│  (Chromium — index.html + bundle.js + jQuery)           │
│                                                         │
│  src/js/core/      navigation, shortcuts, favorites,    │
│                    theme                                │
│  src/js/tools/     one module per tool (40+)            │
│  src/js/sidebar-logic.js  accordion, search, persist    │
└──────────────────────────┬──────────────────────────────┘
                           │  contextBridge (preload.js)
                           │  window.api.{generateHashes,
                           │    hashFile, stopFileWatch,
                           │    onFileHashUpdate, generateQR,
                           │    renderMarkdown, getPathForFile}
┌──────────────────────────▼──────────────────────────────┐
│                     Main Process                        │
│  (Node.js — main.js)                                    │
│                                                         │
│  src-main/ipc/crypto-handlers.js                        │
│    generate-hashes  → crypto.createHash()               │
│    hash-file        → fs.createReadStream() + fs.watch  │
│  src-main/ipc/qr-handlers.js                            │
│    generate-qr      → qrcode.toDataURL()                │
│  render-markdown    → marked.parse()                    │
│  src-main/menu.js   → application menu setup            │
└─────────────────────────────────────────────────────────┘
```

**Security model**: `nodeIntegration: false` + `contextIsolation: true`. Node APIs are never exposed directly to the renderer — all cross-process communication goes through a narrow, explicitly-typed `contextBridge` surface defined in `preload.js`.

---

## Build System

The project uses a three-step build pipeline, all orchestrated through `npm` scripts.

```bash
# Build HTML — stitch all src/views/*.html partials into src/index.html
npm run build:html

# Build CSS — compile Tailwind from src/input.css → src/styles.css
npm run build:css

# Build JS — bundle src/renderer.js → src/bundle.js via esbuild
npm run build:js

# Build everything (HTML + CSS + JS)
npm run build:all

# Build + launch in development
npm start

# Build + package (directory, no installer)
npm run pack

# Build + create distributable installers (dmg/zip on macOS, nsis on Windows, AppImage on Linux)
npm run dist
```

> **Note:** `src/index.html`, `src/styles.css`, and `src/bundle.js` are all **generated files** — edit the source files in `src/views/`, `src/input.css`, and `src/js/` respectively, then rebuild.

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

This builds the HTML, CSS, and JS, then launches the Electron window.

---

## License

Dual licensed — see [`LICENSE`](./LICENSE) for details.

- **MIT License** — free for personal, academic, and open-source (non-commercial) use
- **Commercial License** — required for any revenue-generating or commercial use; contact [Arunkumar Mourougappane](https://github.com/arunkumar-mourougappane) to obtain one
