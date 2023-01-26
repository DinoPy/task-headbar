export default function formatCountdownText(time) {
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;
	return `${minutes < 10 ? '0' + minutes : minutes} : ${
		seconds < 10 ? '0' + seconds : seconds
	}`;
}

class Task {
	constructor({ id, title, createdAt, profile, isBreakTask }) {
		const id = id;
		let title = title;
		const createdAT = createdAt;
		let taskEl = null;
		let children = {};
		const profile = profile;
		const isBreakTask = isBreakTask;
		let isFocused = false;
		let taskTimerInterval = null;
		let description = 'no description';
		let completedAt = null;
		let duration = 0;
		let category = '';
		let toggledFocusAt = 0;

		this.updateTitle = (newTitle) => {
			title = newTitle;
		};

		this.updateDescription = (newDescription) => {
			description = newDescription;
		};

		// might not be needed as we can use newDate the value won't come from outside the instance
		this.updateCompletedAt = (completionDate) => {
			completedAt = completionDate;
		};

		this.addFocus = () => {
			isFocused = true;
			this.startTimer();

			// TO DO
			// add the class to difference the focused task from non focused ones
		};

		this.removeFocus = () => {
			isFocused = false;
			this.stopTimer();

			// TO DO
			// remove class that differences the focused tasks from non focused ones
		};

		this.startTimer = () => {
			// setting the timeElapsed to duration will allow to save how much time has passed if the task is toggled on and off.
			// the value is devided by 1000 not to use MS
			let taskTimeElapsed = duration / 1000;

			// settings up the interval
			taskTimerInterval = setInterval(function () {
				taskTimeElapsed++;
				children.timer.textContent = formatCountdownText(taskTimeElapsed);
			}, 1000);

			// cancel the display none property so the timer shows
			children.timer.display = '';

			// update when the task was focused
			toggledFocusAt = new Date().getTime();
		};

		this.stopTimer = () => {
			// stop the interval timer
			clearInterval(taskTimerInterval);

			// hide the timer
			children.timer.display = 'none';

			// update the duration
			duration += new Date().getTime() - toggledFocusAt;
		};

		this.destroySelfFromDOM = () => {
			taskEl.remove();

			// check if the taskEl still exists after removal as variable, if so equal it to null not to waste memory
		};

		this.addToCompletedTaskList = () => {};

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
