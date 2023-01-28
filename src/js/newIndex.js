const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;
import { Task, formatCurrentDate, formatCountdownText } from './utility.js';

const closeBtn = document.getElementById('closeBtn');
const countdownText = document.getElementById('countdown');
const playPauseBtn = document.getElementById('playPauseIcon');
const skipPauseBtn = document.getElementById('skipPauseIcon');
const bodyEl = document.querySelector('body');

let ID = 0;

closeBtn.addEventListener('click', () => {
	ipc.send('closeApp', completedTasks);
});

// ------------------- TIMER -------------------- //
const activeTime = 25 * 60;
const pauseTime = 5 * 60;

let barDetails = {
	barStatus: 'active',
	isCountingDown: false,
};

let countdown = activeTime;
let countdownInitialValue = countdown;
let intervalId;

let currentlyTimedTask;

// update the value countdown based on established default active time
countdownText.textContent = formatCountdownText(countdown);

// toggle play and pause
playPauseBtn.addEventListener('click', toggleCountdown);
skipPauseBtn.addEventListener('click', handleSkipBreak);

// ---------------- UTILITY FUNCTIONS ------------------- //

// formats the text

// starts the countdown

function startCountdown() {
	intervalId = setInterval(function () {
		countdown--; // main timer countdown value
		countdownText.textContent = formatCountdownText(countdown); //
		bodyEl.style.backgroundColor = '';
		if (countdown === 0) {
			clearInterval(intervalId);
			bodyEl.style.backgroundColor = '#c74242';

			for (let task in tasks) {
				tasks[task].stopTimer();
			}
			if (countdownInitialValue === activeTime) {
				barDetails.barStatus = 'pause';
				countdown = pauseTime;
				countdownInitialValue = countdown;
				skipPauseBtn.style.display = 'inline';

				ipc.send('Interval-Ended', 'Start pause.');
			} else {
				countdown = activeTime;
				barDetails.barStatus = 'active';
				countdownInitialValue = countdown;
				skipPauseBtn.style.display = 'none';

				ipc.send('Interval-Ended', 'Start work.');
			}

			countdownText.textContent = formatCountdownText(countdown);
			playPauseIcon.src = 'images/play.svg';
			barDetails.isCountingDown = false;
		}
	}, 1000);
}

// starts and pauses the countdown

function toggleCountdown() {
	/// will be renamed to
	if (barDetails.isCountingDown === false) {
		// start main countdown
		startCountdown();

		barDetails.isCountingDown = true;
		playPauseBtn.src = 'images/pause.svg';
		bodyEl.style.backgroundColor = '';

		if (barDetails.barStatus === 'pause') return;
		// start the time of each focused task
		for (let task in tasks) {
			if (tasks[task].getIsFocusedStatus()) tasks[task].startTimer();
		}
	} else {
		// stop the main timer
		clearInterval(intervalId);

		for (let task in tasks) {
			tasks[task].stopTimer();
		}

		barDetails.isCountingDown = false;
		playPauseBtn.src = 'images/play.svg';
		bodyEl.style.backgroundColor = '#c74242';
	}

	if (barDetails.barStatus === 'pause') {
		skipPauseBtn.style.display = 'inline';
	}
}

function handleSkipBreak() {
	// clear both intervals not to have duplicates
	clearInterval(intervalId);

	// update the countdown value to active time value (25 min)
	countdown = activeTime;

	// change bar status to active and is counting to true
	barDetails.barStatus = 'active';
	barDetails.isCountingDown = true;

	// update the initial value of countdown so we have a reference when the pause starts
	countdownInitialValue = countdown;

	// hide the skip pause btn
	skipPauseBtn.style.display = 'none';
	playPauseBtn.src = 'images/pause.svg';

	// update the countdown text and the body background
	countdownText.textContent = formatCountdownText(countdown); //
	bodyEl.style.backgroundColor = '';

	// start both task and main timers
	startCountdown();

	for (let task in tasks) {
		if (tasks[task].getIsFocusedStatus()) tasks[task].startTimer();
	}
}

// ----------------- ADD TASKS ----------------------- //

const addTaskContainer = document.getElementById('addTaskContainer');
const addTaskBtn = document.getElementById('addTaskBtn');

let isAddingTask = false;
const tasks = {};
const completedTasks = [];
let addTaskInput;

addTaskBtn.addEventListener('click', handleAddTask);

function handleAddTask() {
	if (isAddingTask === false) {
		addTaskBtn.src = 'images/done.svg';
		isAddingTask = true;
		addTaskInput = document.createElement('input');
		addTaskInput.classList.add('addTaskInput');
		addTaskInput.placeholder = 'Task ..';
		addTaskInput.addEventListener('keyup', (e) => {
			if (e.key === 'Enter') {
				handleAddTask();
			}
		});
		addTaskContainer.prepend(addTaskInput);
		addTaskInput.focus();
	} else {
		const taskTitle = addTaskInput.value;
		taskTitle.replaceAll('"', '').replaceAll(',', '');

		if (taskTitle.length > 0) {
			addTask(taskTitle);
		}
		addTaskContainer.removeChild(addTaskInput);
		addTaskBtn.src = 'images/add.svg';
		isAddingTask = false;
	}
}

// --------------- RENDER TASKS ------------------ //
const taskContainer = document.querySelector('.taskContainer');

function renderTasks(tasks) {
	for (let task in tasks) {
		addTask(tasks[task].title);
	}
}

function addTask(title) {
	tasks[ID] = new Task({
		idNew: ID,
		titleNew: title,
		createdAtNew: formatCurrentDate(),
		profileNew: 'any',
		isBreakTaskNew: barDetails.barStatus === 'pause' ? true : false,
		taskElNew: document.createElement('div'),
		childrenEl: {
			titleEl: document.createElement('p'),
			timerEl: document.createElement('p'),
		},
		completedTasks,
		tasks,
		taskContainer,
		barDetails,
	});

	tasks[ID].setTaskUp();
	tasks[ID].addTaskListeners();

	ID++;
}

ipc.on('addTask', () => {
	handleAddTask();
});

window.tasks = tasks;
