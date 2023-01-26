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

app.setName('Task yourself');
app.setAppUserModelId(app.name);

let win;

const createWindow = () => {
	const screenWidth = screen.getPrimaryDisplay().workAreaSize.width;
	win = new BrowserWindow({
		width: screenWidth,
		height: 40,
		minHeight: 40,
		maxHeight: 40,
		minWidth: 1280,
		frame: true,
		enableLargerThanScreen: false,
		title: 'Task-yourself',
		maximizable: false,
		movable: true,
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

	// win.setBounds({ x: 0, y: 0, width: screenWidth });
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

		if (args.length > 1) {
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
			silent: false,
			icon: 'src/images/dino.ico',
			sound: path.join(__dirname, 'src/sounds/smack.ogg'),
			timeoutType: 'never',
		}).show();
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
	.then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
	if (BrowserWindow.getAllwindows().length === 0) createWindow();
});
