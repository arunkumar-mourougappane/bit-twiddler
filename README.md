# Bit Twiddler 🛠️

> **A Swiss-Army Developer Toolkit.**

Bit Twiddler is an offline-first Electron desktop application designed to provide developers with instant, secure access to common menial tasks. Built with a sleek, dark-mode user interface using Tailwind CSS and powered by jQuery.

## Features

* **Base64 Tool:** Instantly encode and decode strings to and from Base64.
* **Hash Generator:** Generate real-time hashes for any string using Node's native `crypto` module. Supports MD5, SHA-1, SHA-256, and SHA-512 instantly on a keystroke.
* **Epoch Converter:** Seamlessly convert Unix timestamps (seconds or milliseconds) to readable local dates and UTC. Also allows picking a date/time to retrieve its Unix epoch equivalent.

## Tech Stack

- **Electron**: Handles the robust, secure window lifecycle and bridges Node capability.
- **Node `crypto` module**: Handles heavy lifting for high-performance string hashing on the backend.
- **Tailwind CSS v3**: Pre-compiled class-based styling for a beautiful desktop interface without the bloat.
- **jQuery**: Handles fast and familiar reactive DOM manipulation for the user interface.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with `npm`.

### Installation

1. Clone or download this repository.
2. Install the application dependencies:
   ```bash
   npm install
   ```

### Running the Application

To launch Bit Twiddler, run the following command. Note that this command will automatically compile the Tailwind CSS styles before spinning up the Electron environment:

```bash
npm start
``` 

## Project Structure
- `main.js`: Main Electron thread and window initialization.
- `preload.js`: Exposes secure node capabilities (like `crypto`) logic to the isolated renderer block.
- `src/index.html`: The frontend layout, styled heavily with utility-first Tailwind classes.
- `src/renderer.js`: The frontend jQuery logic reacting to UI input events.
- `tailwind.config.js` / `src/input.css`: Configuration parameters and injection zones for Tailwind.

## License

ISC License
