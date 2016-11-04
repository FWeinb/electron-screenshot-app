// Load IPC module here because we won't have access to it in the "webpage"
// eslint-disable-next-line import/no-extraneous-dependencies
const $$electronIpc = require('electron').ipcRenderer;

process.once('loaded', () => {
	global.$$electronIpc = $$electronIpc;
});
