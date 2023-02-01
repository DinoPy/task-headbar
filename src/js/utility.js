const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

export function formatCountdownText(time) {
	let minutes = Math.floor((time / 60) % 60);
	let hours = Math.floor(time / 60 / 60);
	let seconds = time % 60;
	return `${hours > 0 ? (hours < 10 ? '0' + hours : hours) + ' : ' : ''} ${
		minutes < 10 ? '0' + minutes : minutes
	} : ${seconds < 10 ? '0' + seconds : seconds}`;
}

export const formatCurrentDate = () => {
	// get current time.
	const today = new Date();
	// format the returned value to desired form
	return `${
		today.getMonth() + 1
	}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
};

export class Task {
	constructor({
		idNew,
		titleNew,
		createdAtNew,
		profileNew,
		taskElNew,
		childrenEl,
		completedTasks,
		tasks,
		taskContainer,
		barDetails,
	}) {
		const id = idNew;
		let title = titleNew;
		const createdAt = createdAtNew;
		let taskEl = taskElNew;
		let children = childrenEl;
		const profile = profileNew;
		let isFocused = false;
		let taskTimerInterval = null;
		let description = 'no description';
		let duration = 0;
		let category = '';
		let toggledFocusAt = 0;

		this.updateTitle = (newTitle) => {
			title = newTitle;
		};

		this.updateDescription = (newDescription) => {
			description = newDescription;
		};

		this.getIsFocusedStatus = () => {
			return isFocused;
		};

		this.addFocus = () => {
			isFocused = true;
			if (barDetails.barStatus === 'active' && barDetails.isCountingDown)
				this.startTimer();
			taskEl.classList.add('activeTask');
			children.timerEl.style.color = '#1b1d23';
		};

		this.removeFocus = () => {
			isFocused = false;
			this.stopTimer();
			taskEl.classList.remove('activeTask');
			children.timerEl.style.color = 'gray';
		};

		this.startTimer = () => {
			// setting the timeElapsed to duration will allow to save how much time has passed if the task is toggled on and off.
			// the value is devided by 1000 not to use MS
			let taskTimeElapsed = Math.floor(duration / 1000);
			// settings up the interval
			taskTimerInterval = setInterval(function () {
				taskTimeElapsed++;
				children.timerEl.textContent = formatCountdownText(taskTimeElapsed);
			}, 1000);

			// update when the task was focused
			toggledFocusAt = new Date().getTime();

			// play animation when timer is counting
			taskEl.style.animationPlayState = 'running';
		};

		this.stopTimer = () => {
			// stop the interval timer
			clearInterval(taskTimerInterval);

			// update the duration
			if (toggledFocusAt > 0) duration += new Date().getTime() - toggledFocusAt;

			// pause animation when timer is not counting
			taskEl.style.animationPlayState = 'paused';

			// helps avoiding a bug where the time passed during the break causes the task timer to blow up.
			toggledFocusAt = 0;
		};

		this.destroySelfFromDOM = () => {
			taskEl.remove();
			// check if the taskEl still exists after removal as variable, if so equal it to null not to waste memory
		};

		this.addToCompletedTaskList = () => {
			completedTasks[id] = {
				title,
				description,
				createdAt,
				completedAt: this.formatCurrentDate(),
				duration: this.formatTaskDuration(Math.ceil(duration / 1000)),
				profile,
				category,
			};
		};

		this.addTaskListeners = () => {
			taskEl.addEventListener('mouseup', (e) => {
				// which gets the button that's pressed on the mouse 1 being right click
				if (e.which === 1) {
					if (isFocused) this.removeFocus();
					else this.addFocus();
				} else if (e.which === 2) {
					this.removeFocus();
					this.addToCompletedTaskList();
					this.destroySelfFromDOM();
					delete tasks[id];
				} else if (e.which === 3) {
					this.openCtxMenu();
				}
			});
		};

		this.setTaskElUp = () => {
			taskEl.classList.add('task');
			taskEl.title = title;
			taskEl.id = id;
		};

		this.setChildrenElUp = () => {
			children.titleEl.classList.add('taskTitle');
			children.titleEl.textContent = title;
			children.timerEl.classList.add('activeTaskTimer');
			children.timerEl.textContent = '00 : 00';

			taskEl.append(children.titleEl);
			taskEl.append(children.timerEl);
		};

		this.setTaskUp = () => {
			this.setTaskElUp();
			this.setChildrenElUp();
			taskContainer.append(taskEl);
		};

		this.openCtxMenu = () => {
			ipc.send('show-context-menu', { title });
		};

		this.formatCountdownText = (time) => {
			// getting the value of minutes
			let minutes = Math.floor((time / 60) % 60);
			// getting the value of hours
			let hours = Math.floor(time / 60 / 60);
			// getting the value of seconds
			let seconds = time % 60;
			// some nested conditionals to ensure the return of correct information
			return `${hours > 0 ? (hours < 10 ? '0' + hours : hours) + ' : ' : ''} ${
				minutes < 10 ? '0' + minutes : minutes
			} : ${seconds < 10 ? '0' + seconds : seconds}`;
		};

		this.formatTaskDuration = (time) => {
			// similar to formatcountdowntext however it exports into an excel duration format
			let minutes = Math.floor((time / 60) % 60);
			let hours = Math.floor(time / 60 / 60);
			let seconds = time % 60;
			return `${hours < 10 ? '0' + hours : hours}:${
				minutes < 10 ? '0' + minutes : minutes
			}:${seconds < 10 ? '0' + seconds : seconds}`;
		};

		this.formatCurrentDate = () => {
			// get current time.
			const today = new Date();
			// format the returned value to desired form
			return `${
				today.getMonth() + 1
			}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
		};
	}
}
