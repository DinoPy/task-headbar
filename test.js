const path = require('path');
const homeDir = require('os').homedir();
const fs = require('node:fs');

let SETTINGS;

const DEFAULT_SETTINGS = {
	isBreakToggled: true,
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

console.log(SETTINGS);
