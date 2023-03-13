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
const player = require('play-sound')();

app.setName('Task yourself');
app.setAppUserModelId(app.name);

let SETTINGS;
let win;
let taskWindow;
let availableDisplays;
let CATEGORIES = [];

function exportCsv(completedTasks) {}
function getCurrentDayFormated() {}
function createContextMenu() {}
function createTaskContextMenu() {}
function deleteTask(props) {}
function loadSettings() {}
function updateSettings() {}
function writeFile(file) {}
function getCsvHeaders(list) {}

loadSettings();

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
	win.title = 'Task bar';

	ipc.on('closeApp', (e, args) => {
		exportCsv(args);
		win.close();
	});

	ipc.on('Interval-Ended', (e, args) => {
		new Notification({
			title: 'Interval Ended',
			body: args,
			silent: false,
			icon: 'src/images/dino.ico',
			timeoutType: 'never',
		}).show();
		const sound = args === 'Start pause.' ? 'break' : 'work';
		const soundPath = path.join(
			homeDir,
			'Documents',
			'Tasks',
			'sounds',
			`${sound}.mp3`
		);

		if (process.platform !== 'linux')
			player.play(soundPath, { timeout: 5000 }, (err) => {
				console.log(err);
			});
	});

	ipc.on('show-task-context-menu', (e, args) => {
		createTaskContextMenu(args);
	});

	ipc.on('show-general-context-menu', () => {
		createContextMenu();
	});

	// once the page is loaded we send some variables sourcing from settings
	win.webContents.on('did-finish-load', () => {
		win.webContents.send('data-from-main', {
			isTimerRunning: SETTINGS.isTimerRunning,
			categories: CATEGORIES,
		});
	});
};

app
	.whenReady()
	.then(() => {
		// setting up global shortcuts.
		// globalShortcut.register('CommandOrControl+R', () => {});
		// globalShortcut.register('CommandOrControl+Shift+R', () => {});
		globalShortcut.register('CommandOrControl+Shift+Space', () => {
			win.show();
			win.webContents.send('addTask');
		});
		// globalShortcut.register('CommandOrControl+Shift+j', () => {
		// 	win.webContents.openDevTools();
		// });
	})
	.then(() => {
		createWindow();
	});

// if all windows are close then quit app.
app.on('window-all-closed', () => {
	app.quit();
});
// app.on('activate', () => {
// 	// mac specific option that has no effect atm as the windows are closed fully on close.
// 	if (BrowserWindow.getAllwindows().length === 0) createWindow();
// });

async function exportCsv(completedTasks) {
	// return if the list has no tasks
	if (completedTasks.length < 1) return;

	// if something else but the task object is received, return.
	completedTasks = completedTasks.filter((i) => typeof i === 'object');

	// create current task
	let currentTask = '';
	let csvString = '';
	const headers = Object.keys(completedTasks[0]);

	// loop over each task
	for (let i = 0; i < completedTasks.length; i++) {
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

	fs.access(
		path.join(homeDir, 'Documents', 'Tasks', 'Logs', 'Tasks Log.csv'),
		(e) => {
			if (e) {
				csvString = getCsvHeaders(completedTasks) + csvString;
				writeFile(csvString);
			} else writeFile(csvString);
		}
	);

	// save the CSV - to individual file
	// fs.writeFile(
	// 	`${homeDir}/Documents/Tasks/Logs/${getCurrentDayFormated()} tasks log.csv`,
	// 	csvString,
	// 	(e) => {
	// 		console.log(e);
	// 	}
	// );
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
			label: `Screen ${i} - Top`,
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

	submenus.push(
		...availableDisplays.map((d, i) => {
			return {
				label: `Screen ${i} - Bottom`,
				click: () => {
					win.setBounds({
						x: d.bounds.x,
						y: d.bounds.y + d.bounds.height - 40,
						height: 40,
						width: d.bounds.width,
					});
				},
			};
		})
	);

	menu.append(
		new MenuItem({
			label: 'Select screen',
			submenu: submenus,
		})
	);

	menu.append(
		new MenuItem({
			label: 'Toggle timer',
			toolTip: `Timer is currently ${
				SETTINGS.isTimerRunning ? 'running' : 'deactivated'
			}`,
			click: () => {
				SETTINGS.isTimerRunning = !SETTINGS.isTimerRunning;
				updateSettings();
				win.webContents.send('toggle-countdown-timer', {
					isTimerRunning: SETTINGS.isTimerRunning,
				});
			},
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
				createPopUpWindow({ ...args, categories: CATEGORIES });
			},
		})
	);

	ctxMenu.append(
		new MenuItem({
			label: 'Delete',
			click: () => {
				deleteTask(args);
			},
		})
	);

	ctxMenu.append(
		new MenuItem({
			label: 'Complete',
			click: () => {
				completeTask(args);
			},
		})
	);
	ctxMenu.append(
		new MenuItem({
			label: 'Category',
			submenu: CATEGORIES.map(
				(cat) =>
					new MenuItem({
						label: cat,
						type: 'radio',
						checked: cat === args.category ? true : false,
						click: () => {
							win.webContents.send('update-task-category', {
								id: args.id,
								newCategory: cat,
							});
						},
					})
			),
		})
	);

	ctxMenu.popup(win, 0, 0);
}

function createPopUpWindow(props) {
	// properties of the browser window.
	taskWindow = new BrowserWindow({
		width: 400,
		minHeight: 200,
		minimizable: false,
		resizable: false,
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

	taskWindow.webContents.on('dom-ready', async () => {
		const height = await taskWindow.webContents.executeJavaScript(
			'document.body.offsetHeight'
		);

		taskWindow.setSize(400, height + 27);
		taskWindow.show();
	});

	// when the window is loaded we send the data from the parent props received via the context menu
	// and populate the page with the intended values.
	taskWindow.webContents.on('did-finish-load', () => {
		taskWindow.webContents.send('data-from-parent', props);
	});

	// shows the window when ready event is triggered.
	taskWindow.on('ready-to-show', () => {});

	// removes from memory the value of the taskWindow that was closed.
	taskWindow.on('close', () => {
		taskWindow = null;
	});
}

function deleteTask(props) {
	win.webContents.send('deleteTask', props);
}

function completeTask(props) {
	win.webContents.send('completeTask', props);
}

function updateSettings() {
	fs.writeFile(
		path.join(homeDir, 'Documents', 'Tasks', 'User-Prefferences.json'),
		JSON.stringify(SETTINGS, null, 2),
		(e) => {
			console.log(e);
		}
	);
}

function loadSettings() {
	const DEFAULT_SETTINGS = {
		isTimerRunning: true,
		startBreakSoundPath: '',
		endBreakSoundPath: '',
		theme: '?',
		categories: [],
	};
	try {
		SETTINGS = JSON.parse(
			fs.readFileSync(
				path.join(homeDir, 'Documents', 'Tasks', 'User-Prefferences.json'),
				'utf-8'
			)
		);
	} catch (error) {
		fs.mkdir(path.join(homeDir, 'Documents', 'Tasks'), (e) => {
			console.log(e);
		});

		fs.writeFileSync(
			path.join(homeDir, 'Documents', 'Tasks', 'User-Prefferences.json'),
			JSON.stringify(DEFAULT_SETTINGS, null, 2)
		);

		SETTINGS = DEFAULT_SETTINGS;
	}
	CATEGORIES = SETTINGS.categories;
}
function writeFile(file) {
	tasksLogPath = path.join(
		homeDir,
		'Documents',
		'Tasks',
		'Logs',
		'Tasks Log.csv'
	);

	try {
		fs.appendFile(tasksLogPath, file, (e, data) => {
			console.log(e);
			if (e && e.code === 'ENOENT') {
				fs.mkdirSync(
					path.join(homeDir, 'Documents', 'Tasks', 'Logs'),
					{ recursive: true },
					(e) => {
						console.log(e);
					}
				);

				writeFile(file);
			}
		});
	} catch (e) {
		console.log(e);
	}
}

function getCsvHeaders(list) {
	// get the list of header items
	const headers = Object.keys(list[0]);

	// generate a string of header items that's separated by , and \n at the end
	const rowHeader = headers.reduce(
		(acc, cv, ci) => acc + cv + (ci !== headers.length - 1 ? ',' : '\n'),
		''
	);

	return rowHeader;
}

// ensures the communication between the children windows and the main task window.
ipc.on('msg-from-child-to-parent', (e, { categories, ...data }) => {
	win.webContents.send('msg-redirected-to-parent', data);
	CATEGORIES = categories;
	SETTINGS['categories'] = categories;

	updateSettings();

	if (taskWindow) taskWindow.close();
});

ipc.on('close-children-window', () => {
	if (taskWindow) taskWindow.close();
});
