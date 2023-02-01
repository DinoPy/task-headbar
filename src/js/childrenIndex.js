const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

const title = document.getElementById('title');
const closeEl = document.getElementById('closeBtn');

ipc.on('data-from-parent', (e, data) => {
	title.textContent = data.title;
});

closeEvent = closeEl.addEventListener('click', () => {
	ipc.sendSync('msg-from-child-to-parent', {
		value: 'data taken from the dom elements',
	});
});
