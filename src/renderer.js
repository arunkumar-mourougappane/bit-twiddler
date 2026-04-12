import { copyToClipboard, escHtml } from './js/utils.js';
window.copyToClipboard = copyToClipboard;
window.escHtml = escHtml;

import './js/core/navigation.js';
import './js/core/shortcuts.js';
import './js/core/favorites.js';
import './js/core/theme.js';
import './js/tools/base64.js';
import './js/tools/hash.js';
import './js/tools/epoch.js';
import './js/tools/json.js';
import './js/tools/jwt.js';
import './js/tools/color.js';
import './js/tools/uuid.js';
import './js/tools/qr.js';
import './js/tools/regex.js';
import './js/tools/diff.js';
import './js/tools/base.js';
import './js/tools/lorem.js';
import './js/tools/string.js';
import './js/tools/password.js';
import './js/tools/markdown.js';
import './js/tools/unit.js';
import './js/tools/yaml.js';
import './js/tools/url.js';
import './js/tools/case.js';
import './js/tools/entities.js';
import './js/tools/transform.js';
import './js/tools/sql.js';
import './js/tools/beautify.js';
import './js/tools/cron.js';
import './js/tools/cidr.js';
import './js/tools/http.js';
import './js/tools/mime.js';
import './js/tools/naming.js';
import './js/tools/pem.js';
import './js/tools/bits.js';
import './js/tools/crc.js';
import './js/tools/endian.js';
import './js/tools/carray.js';
import './js/tools/limits.js';
import './js/tools/resistor.js';
import './js/tools/divider.js';
import './js/tools/baud.js';
import './js/tools/qformat.js';
import './js/tools/cobs.js';
import './js/tools/protocols.js';

import { initSidebar } from './js/sidebar-logic.js';

// Global Init
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
});
