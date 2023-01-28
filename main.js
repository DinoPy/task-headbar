const {
	app,
	BrowserWindow,
	ipcMain,
	screen,
	globalShortcut,
	Notification,
} = require('electron');
const path = require('path');
const ipc = ipcMain;
const fs = require('fs');
const homeDir = require('os').homedir();
const player = require('play-sound')((opts = {}));

app.setName('Task yourself');
app.setAppUserModelId(app.name);

let win;

const createWindow = () => {
	const availableDisplays = screen.getAllDisplays();
	const selectedScreen =
		availableDisplays.length > 1 ? (process.platform === 'darwin' ? 1 : 0) : 0;
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

	// win.setBounds({});
	win.loadFile('src/index.html');
	win.title = 'Task-yourself';

	ipc.on('closeApp', (e, args) => {
		tasksLog = 'title,description,createdAt,completedAt,duration\n';
		for (task of args) {
			currentTask = `${task.title},${task.description},${task.createdAt},${task.completedAt},to do\n`;
			tasksLog += currentTask;
		}
		const today = new Date();
		todayString = `${today.getDate()}-${
			today.getMonth() + 1
		}-${today.getFullYear()} ${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

		console.log(args);
		if (args.length > 0) {
			fs.writeFile(
				`${homeDir}/Desktop/${todayString} tasks log.csv`,
				tasksLog,
				(e) => {
					console.log(e);
				}
			);
		}
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
	.then(createWindow);

app.on('window-all-closed', () => {
	app.quit();
});
app.on('activate', () => {
	if (BrowserWindow.getAllwindows().length === 0) createWindow();
});
