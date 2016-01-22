// Load IPC module here because we won't have access to it in the "webpage"
const $$electronIpc = require('electron').ipcRenderer;
process.once('loaded', () => {
	global.$$electronIpc = $$electronIpc;
});
