const {
	app,
	BrowserWindow,
	ipcMain,
	screen,
	globalShortcut,
	Notification,
	Menu,
	MenuItem,
} = require('electron');
const path = require('path');
const ipc = ipcMain;
const fs = require('fs');
const homeDir = require('os').homedir();
const player = require('play-sound')((opts = {}));

app.setName('Task yourself');
app.setAppUserModelId(app.name);

let win;
function exportCsv(completedTasks) {}
function getCurrentDayFormated() {}

const createWindow = () => {
	const availableDisplays = screen.getAllDisplays();
	const selectedScreen =
		availableDisplays.length > 1 ? (process.platform !== 'darwin' ? 1 : 0) : 0;
	win = new BrowserWindow({
		x: availableDisplays[selectedScreen].workArea.x,
		y: availableDisplays[selectedScreen].workArea.y,
		width: availableDisplays[selectedScreen].workAreaSize.width,
		width: availableDisplays[selectedScreen].workAreaSize.width,
		height: 40,
		minHeight: 40,
		maxHeight: 40,
		minWidth: 1280,
		frame: false,
		enableLargerThanScreen: false,
		title: 'Task-yourself',
		maximizable: false,
		movable: false,
		// resizable: true,
		minimizable: false,
		icon: 'src/images/dino.ico',
		webPreferences: {
			webgl: true,
			// preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
			devTools: true,
		},
	});

	win.loadFile('src/index.html');
	win.title = 'Task-yourself';

	ipc.on('closeApp', (e, args) => {
		exportCsv(args);
		win.close();
	});

	ipc.on('Interval-Ended', (e, args) => {
		new Notification({
			title: 'Interval Ended',
			body: args,
			silent: true,
			icon: 'src/images/dino.ico',
			sound: path.join(__dirname, 'src/sounds/smack.ogg'),
			timeoutType: 'never',
		}).show();
		console.log(args);
		const sound =
			args === 'Start pause.' ? 'Oh you want a break' : 'Get Back to Work';
		player.play(`src/sounds/${sound}.mp3`, (err) => {
			console.log(err);
		});
	});

	ipc.on('show-context-menu', (e, args) => {
		console.log(args);
		const ctxMenu = new Menu();

		ctxMenu.append(
			new MenuItem({
				label: 'y',
				click: () => {
					console.log(args);
				},
			})
		);

		ctxMenu.popup(win);
	});
};

app
	.whenReady()
	.then(() => {
		globalShortcut.register('CommandOrControl+R', () => {});
		globalShortcut.register('CommandOrControl+Shift+R', () => {});
		globalShortcut.register('CommandOrControl+Shift+Space', () => {
			win.show();
			win.webContents.send('addTask');
		});
	})
	.then(() => {
		createWindow();
	});

app.on('window-all-closed', () => {
	app.quit();
});
app.on('activate', () => {
	if (BrowserWindow.getAllwindows().length === 0) createWindow();
});

function exportCsv(completedTasks) {
	// return if the list has no tasks
	if (completedTasks.length < 1) return;

	// get the list of header items
	const headers = Object.keys(completedTasks[0]);

	// generate a string of those lists that's separated by , and \n at the end
	const rowHeader = headers.reduce(
		(acc, cv, ci) => acc + cv + (ci !== headers.length - 1 ? ',' : '\n'),
		''
	);

	// assign the final csvString the first header row
	csvString = rowHeader;

	// create current task
	let currentTask = '';

	// loop over each task
	for (let i = 0; i < completedTasks.length; i++) {
		// if something else but the task object is received, return.
		if (typeof completedTasks[i] !== 'object') continue;

		// go over the index of each property in the object using the header which has each property listed
		for (let taskProperty in headers) {
			// get the current title
			const currentTitle = headers[taskProperty];

			// add to the current task the value at ith task and current title
			currentTask +=
				completedTasks[i][currentTitle] +
				(taskProperty < headers.length - 1 ? ',' : '\n');
		}

		// add the final value to the current Task
		csvString += currentTask;

		// reset current task
		currentTask = '';
	}

	// save the CSV
	fs.writeFile(
		`${homeDir}/Desktop/${getCurrentDayFormated()} tasks log.csv`,
		csvString,
		(e) => {
			console.log(e);
		}
	);
}

function getCurrentDayFormated() {
	const today = new Date();

	todayString = `${today.getDate()}-${
		today.getMonth() + 1
	}-${today.getFullYear()} ${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

	return todayString;
}
