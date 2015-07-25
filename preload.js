// Load IPC module here because we won't have access to it in the "webpage"
window.__electron__ipc = require('ipc');