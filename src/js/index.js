const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

const closeBtn = document.getElementById('closeBtn');
const countdownText = document.getElementById('countdown');
const timerBtn = document.getElementById('timerBtn');
const playPauseBtn = document.getElementById('playPauseIcon');
const skipPauseBtn = document.getElementById('skipPauseIcon');
const bodyEl = document.querySelector('body');

let ID = 0;
// prototypes

closeBtn.addEventListener('click', () => {
	ipc.send('closeApp', completedTasks);
});

// first task timer
let firstTaskInterval;
let firstTaskTimeElapsed = 0;

// ------------------- TIMER -------------------- //
const activeTime = 25 * 60;
const pauseTime = 5 * 60;

let barStatus = 'active';
let countdown = activeTime;
let countdownInitialValue = countdown;
let intervalId;
let isCountingDown = false;

let currentlyTimedTask;

// update the value countdown based on established default active time
countdownText.textContent = formatCountdownText(countdown);

// toggle play and pause
playPauseBtn.addEventListener('click', toggleCountdown);
skipPauseBtn.addEventListener('click', handleSkipBreak);

// ---------------- UTILITY FUNCTIONS ------------------- //

// formats the text

function formatCountdownText(time) {
	let minutes = Math.floor((time / 60) % 60);
	let hours = Math.floor(time / 60 / 60);
	let seconds = time % 60;
	return `${hours > 0 ? (hours < 10 ? '0' + hours : hours) + ' : ' : ''} ${
		minutes < 10 ? '0' + minutes : minutes
	} : ${seconds < 10 ? '0' + seconds : seconds}`;
}

// starts the countdown

function startCountdown() {
	intervalId = setInterval(function () {
		countdown--; // main timer countdown value
		countdownText.textContent = formatCountdownText(countdown); //
		bodyEl.style.backgroundColor = '';
		if (countdown === 0) {
			clearInterval(intervalId);
			clearInterval(firstTaskInterval);
			bodyEl.style.backgroundColor = '#c74242';
			if (countdownInitialValue === activeTime) {
				ipc.send('Interval-Ended', 'Start pause.');
				barStatus = 'pause';
				countdown = pauseTime;
				countdownInitialValue = countdown;

				skipPauseBtn.style.display = 'inline';
			} else {
				countdown = activeTime;
				barStatus = 'active';
				countdownInitialValue = countdown;
				skipPauseBtn.style.display = 'none';

				ipc.send('Interval-Ended', 'Start work.');
			}

			countdownText.textContent = formatCountdownText(countdown);
			playPauseIcon.src = 'images/play.svg';
			isCountingDown = false;
		}
	}, 1000);
}

// starts and pauses the countdown

function toggleCountdown() {
	/// will be renamed to
	if (isCountingDown === false) {
		startCountdown();
		if (barStatus === 'active') firstTaskCountdown(currentlyTimedTask);
		isCountingDown = true;
		playPauseBtn.src = 'images/pause.svg';
		bodyEl.style.backgroundColor = '';
	} else {
		clearInterval(intervalId);
		clearInterval(firstTaskInterval);
		isCountingDown = false;
		playPauseBtn.src = 'images/play.svg';
		bodyEl.style.backgroundColor = '#c74242';
	}

	if (barStatus === 'pause') {
		skipPauseBtn.style.display = 'inline';
	} else {
	}
}

function handleSkipBreak() {
	// clear both intervals not to have duplicates
	clearInterval(intervalId);
	clearInterval(firstTaskInterval);

	// update the countdown value to active time value (25 min)
	countdown = activeTime;

	// change bar status to active and is counting to true
	barStatus = 'active';
	isCountingDown = true;

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
	firstTaskCountdown(currentlyTimedTask);
}

// ----------------- ADD TASKS ----------------------- //

const addTaskContainer = document.getElementById('addTaskContainer');
const addTaskBtn = document.getElementById('addTaskBtn');

let isAddingTask = false;
const tasks = [];
const completedTasks = [];

addTaskBtn.addEventListener('click', handleAddTask);

let addTaskInput;
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

		if (taskTitle.length > 0) {
			tasks.push({
				title: taskTitle,
				description: 'No description',
				createdAt: formatCurrentDate(),
				hasTimer: false,
				completedAt: '',
			});
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
	for (task of tasks) {
		addTask(task.title);
	}
}

function addTask(title) {
	// will be updated per kenban notes
	const taskEl = document.createElement('div');
	taskEl.classList.add('task');
	taskEl.title = title;
	const titleEl = document.createElement('p');
	titleEl.textContent = title;
	taskEl.append(titleEl);
	taskEl.addEventListener('click', () => {
		//
		let index = tasks.length - 1;
		completedTasks.push({
			title: tasks[index].title.replaceAll(',', ''),
			description: tasks[index].description,
			createdAt: tasks[index].createdAt,
			completedAt: formatCurrentDate(),
		});
		tasks.splice(index, 1);
		index--;
		taskEl.remove();
		if (index >= 0) {
			firstTaskTimeElapsed = 0;
			addFirstTaskTimer();
		}
	});
	taskContainer.append(taskEl);

	for (let taskNo in tasks) {
		if (parseInt(taskNo) === 0) {
			if (!tasks[taskNo].hasTimer) {
				firstTaskTimeElapsed = 0;
				addFirstTaskTimer();
			}
			tasks[taskNo].hasTimer = true;
		}
	}
}

function addFirstTaskTimer() {
	// will be removed
	const firstTaskEl = document.querySelector('.task');
	if (firstTaskEl.childNodes.length < 2) {
		currentlyTimedTask = document.createElement('p');
		currentlyTimedTask.classList.add('firstTaskTimer');
		clearInterval(firstTaskInterval);
		firstTaskCountdown(currentlyTimedTask);
		firstTaskEl.append(currentlyTimedTask);
	}
}

function firstTaskCountdown(el) {
	// will be removed
	if (el) {
		el.textContent = formatCountdownText(firstTaskTimeElapsed);
		clearInterval(firstTaskInterval);
		firstTaskInterval = setInterval(function () {
			if (barStatus === 'active' && isCountingDown) {
				firstTaskTimeElapsed++;
				el.textContent = formatCountdownText(firstTaskTimeElapsed);
			}
		}, 1000);
	}
}

function formatCurrentDate() {
	// will be moved
	const today = new Date();
	return `${
		today.getMonth() + 1
	}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
}

// renderTasks(tasks);

// ---------------- REMOVE TASKS ---------------- //

ipc.on('addTask', () => {
	handleAddTask();
});
