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
let taskWindow;
let availableDisplays;

function exportCsv(completedTasks) {}
function getCurrentDayFormated() {}
function createContextMenu() {}
function createTaskContextMenu() {}

const createWindow = () => {
	availableDisplays = screen.getAllDisplays();
	const selectedScreen = availableDisplays[0];
	win = new BrowserWindow({
		x: selectedScreen.workArea.x,
		y: selectedScreen.workArea.y,
		width: selectedScreen.workAreaSize.width,
		width: selectedScreen.workAreaSize.width,
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
		const sound =
			args === 'Start pause.' ? 'Oh you want a break' : 'Get Back to Work';
		player.play(`src/sounds/${sound}.mp3`, (err) => {
			console.log(err);
		});
	});

	ipc.on('show-task-context-menu', (e, args) => {
		createTaskContextMenu(args);
	});

	ipc.on('show-general-context-menu', () => {
		createContextMenu();
	});
};

app
	.whenReady()
	.then(() => {
		// globalShortcut.register('CommandOrControl+R', () => {});
		// globalShortcut.register('CommandOrControl+Shift+R', () => {});
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

function createContextMenu() {
	const menu = new Menu();

	const submenus = availableDisplays.map((d, i) => {
		return {
			label: `Screen ${i}`,
			click: () => {
				win.setBounds({
					x: d.bounds.x,
					y: d.bounds.y,
					height: 40,
					width: d.bounds.width,
				});
			},
		};
	});

	menu.append(
		new MenuItem({
			label: 'Select screen',
			submenu: submenus,
		})
	);

	menu.popup(win, 0, 0);
}

function createTaskContextMenu(args) {
	const ctxMenu = new Menu();

	ctxMenu.append(
		new MenuItem({
			label: 'Edit',
			click: () => {
				createPopUpWindow(args);
			},
		})
	);

	ctxMenu.popup(win, 0, 0);
}

function createPopUpWindow(props) {
	taskWindow = new BrowserWindow({
		width: 400,
		height: 250,
		maxHeight: 250,
		minHeight: 250,
		minimizable: false,
		resizable: false,
		movable: false,
		parent: win,
		modal: true,
		alwaysOnTop: true,
		show: false,
		frame: false,
		transparent: true,

		webPreferences: {
			webgl: true,
			nodeIntegration: true,
			contextIsolation: false,
			devTools: true,
		},
	});
	taskWindow.setBackgroundColor = '#1b1d23';

	taskWindow.loadFile('src/html/child.html');

	taskWindow.webContents.on('did-finish-load', () => {
		taskWindow.webContents.send('data-from-parent', props);
	});

	taskWindow.on('ready-to-show', () => {
		taskWindow.show();
	});

	taskWindow.on('close', () => {
		taskWindow = null;
	});
}

ipc.on('msg-from-child-to-parent', (e, data) => {
	// win.webContents.send('msg-redirected-to-parent', data);
	if (taskWindow) taskWindow.close();
	console.log(data);
});
