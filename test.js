const path = require('path');
const homeDir = require('os').homedir();
const fs = require('node:fs');

// let SETTINGS;

// const DEFAULT_SETTINGS = {
// 	isBreakToggled: true,
// 	startBreakSoundPath: '',
// 	endBreakSoundPath: '',
// 	theme: '?',
// 	categories: [],
// };
// try {
// 	SETTINGS = JSON.parse(
// 		fs.readFileSync(
// 			path.join(homeDir, 'Documents', 'Tasks', 'User-Prefferences.json'),
// 			'utf-8'
// 		)
// 	);
// } catch (error) {
// 	fs.mkdir(path.join(homeDir, 'Documents', 'Tasks'), (e) => {
// 		console.log(e);
// 	});

// 	fs.writeFileSync(
// 		path.join(homeDir, 'Documents', 'Tasks', 'User-Prefferences.json'),
// 		JSON.stringify(DEFAULT_SETTINGS, null, 2)
// 	);

// 	SETTINGS = DEFAULT_SETTINGS;
// }

// console.log(SETTINGS);

tasksLogs = path.join(homeDir, 'Documents', 'Tasks', 'Logs', 'Tasks Logs.csv');

function writeFile(file) {
	try {
		fs.appendFile(tasksLogs, file, (e, data) => {
			if (e && e.code === 'ENOENT') {
				fs.mkdir(path.join(homeDir, 'Documents', 'Tasks', 'Log'), (e) => {
					console.log(e);
				});

				fs.writeFile(tasksLogs, file, () => {});
				writeFile(file);
			}
		});
	} catch (e) {
		console.log(e);
	}
}

writeFile();
