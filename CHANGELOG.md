# Changelog

All notable changes to Bit Twiddler are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026

### Added

#### Core Application
- Initial Electron application scaffold with main process, preload, and renderer architecture
- `nodeIntegration: false` + `contextIsolation: true` security model with a narrow `contextBridge` surface
- Native application menu with standard OS conventions
- esbuild-based JS bundler pipeline (`src/renderer.js` → `src/bundle.js`)
- Tailwind CSS v4 design system with dark-mode-first styling
- Build pipeline: `build:html`, `build:css`, `build:js`, `build:all` npm scripts
- HTML partial system — `src/views/*.html` stitched into `src/index.html` via `build-html.js`
- electron-builder configuration for macOS (dmg/zip), Windows (NSIS), and Linux (AppImage) distributables
- GitHub Actions CI workflow and release workflow
- Dependabot configuration for automated dependency updates

#### Sidebar & UI
- Categorized accordion sidebar with 7 collapsible tool categories
- Sidebar state persisted to `localStorage` across sessions
- Real-time tool search — press `/` to focus; matching categories auto-expand
- Favorites — star any tool to pin it to the top; persisted in `localStorage`
- Four accent color themes: Ocean (default), Violet, Emerald, Rose
- Animated sliding pill indicator tracking the active tool
- Keyboard shortcuts: `/` for search, `⌘1`–`⌘9` / `Ctrl+1`–`Ctrl+9` to jump to tools
- Fully responsive layout that scales gracefully to arbitrary window sizes

#### Security & Encoding Tools
- **Base64 Encoder / Decoder** — bidirectional live split-pane encoding/decoding
- **Hash Generator** — live MD5, SHA-1, SHA-256, SHA-512 for text; streaming file hashing via `fs.createReadStream`; live file watching with 300 ms debounce
- **JWT Decoder** — client-side Header/Payload/Signature extraction with collapsible tree views and search
- **Password Generator** — cryptographically secure via `window.crypto`; configurable length and character sets; real-time strength indicator
- **PEM / Certificate Inspector** — X.509 field extraction (subject, issuer, validity, serial, algorithm)
- **URL Encoder / Decoder** — bidirectional `%XX` encoding for URLs and query strings
- **HTML Entity Encoder / Decoder** — named and numeric entity support

#### Data & Time Tools
- **JSON Formatter** — dual-pane with syntax highlighting, interactive collapsible tree view, and in-page search
- **YAML ⟷ JSON** — bidirectional conversion with inline error reporting
- **SQL Formatter** — pretty-print and minify across PostgreSQL, MySQL, SQLite, and other dialects
- **HTML / XML Beautifier** — consistent indentation for minified or machine-generated markup
- **Epoch Converter** — bidirectional Unix timestamp utility with "Now" button
- **Unit Converter** — data sizes (bits → TB) and time durations (nanoseconds → years)

#### Network Tools
- **CIDR / Subnet Calculator** — network address, broadcast, mask, host range, and host count for IPv4

#### Low-Level & Embedded Tools
- **Bits & Masks** — 64-bit visual bit grid with live decimal/hex/binary display and AND/OR/XOR mask generation
- **CRC & Checksum** — CRC-8, CRC-16, CRC-32, CRC-CCITT for hex byte and ASCII input
- **Endianness Swapper** — 16/32/64-bit little-endian ↔ big-endian hex conversion
- **C-Array Formatter** — hex bytes to `uint8_t` C/C++ array declarations with configurable name and width
- **Integer Limits Reference** — `int8_t` through `uint64_t` decimal and hex min/max values
- **Resistor Color Code** — 4, 5, and 6-band decoder with tolerance and temperature coefficient
- **Voltage Divider / Ohm's Law** — output voltage, current, and power dissipation calculator
- **Baud Rate Error** — UART prescaler, actual baud rate, and percentage error calculator
- **Fixed-Point Q-Format** — floating-point ↔ fixed-point (Qm.n) conversion
- **COBS Framing** — Consistent Overhead Byte Stuffing encoder/decoder for serial framing
- **Protocol Reference Cards** — I²C, SPI, UART, CAN, USB signal names and configuration reference

#### Development Tools
- **Regex Tester** — live validity badge, split-pane match highlighting, match count, and capture group detail; zero-width match protection
- **Diff Viewer** — pure LCS diff with unified output (`+`/`-` lines), stats bar; no external library
- **Cron Expression Parser** — human-readable cron descriptions via `cronstrue`; next N run times; 5- and 6-field support
- **QR Code Generator** — live generation via `qrcode` over IPC; Base64 PNG preview; one-click download
- **Markdown Previewer** — live split-pane rendering via `marked` over IPC with full typography styling

#### Content & Misc Tools
- **Lorem Ipsum Generator** — configurable paragraphs, sentences, or words
- **String Inspector** — character, word, line, sentence, byte, and unique character counts; frequency breakdown
- **Color Converter** — HEX → RGB, HSL, CMYK with live color swatch
- **Case Converter** — camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE, Title Case, UPPER, lower
- **Text Transformer** — sort, deduplicate, reverse, trim, number lines, and more
- **Variable & Function Naming Helper** — naming suggestions across all major conventions from plain-English input

#### Reference Tools
- **HTTP Status Codes** — searchable 1xx–5xx reference with plain-English descriptions
- **MIME Type Lookup** — search by extension or type string across hundreds of MIME types

### Changed
- Migrated from Tailwind CSS v3 to v4 syntax and CLI
- Upgraded Electron from v30 → v39 → v41
- Upgraded `actions/checkout` and `actions/setup-node` to latest major versions
- Modularized architecture: IPC handlers split into `src-main/ipc/crypto-handlers.js` and `src-main/ipc/qr-handlers.js`
- Refactored sidebar into modular JS components under `src/js/core/`

### Fixed
- Resolved broken module scope for keyboard shortcuts and favorites
- Fixed `hash-file` IPC error on large files
- Fixed Color Converter tool visibility in the sidebar
- Resolved CI build failure caused by Tailwind v3 → v4 syntax incompatibility
- Optimized UI layout for maximized windows

### Security
- All npm audit vulnerabilities resolved as of v1.0.0
- Strict Electron security defaults enforced throughout

---

[1.0.0]: https://github.com/arunkumar-mourougappane/bit-twiddler/releases/tag/v1.0.0
