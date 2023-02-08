const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;

let ID;
let category;

const closeBtn = document.getElementById('closeBtn');
const submitBtn = document.getElementById('submitBtn');
const dialogEl = document.querySelector('dialog');
const addNewCategoryBtn = document.getElementById('addCategoryBtn');
const cancelAddCategoryBtn = document.getElementById('cancelAddCategoryBtn');
const addCategoryInput = document.getElementById('addCategoryInput');

const titleInput = document.getElementById('title');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');

let categories = JSON.parse(localStorage.getItem('categories'));
if (!categories) {
	localStorage.setItem('categories', JSON.stringify(['none']));
	categories = ['none'];
}

ipc.on('data-from-parent', (e, data) => {
	ID = data.id;
	titleInput.value = data.title;
	descriptionInput.value = data.description;

	category = data.category;
	populateCategoryOptions();
	categorySelect.value = data.category;
});

const populateCategoryOptions = () => {
	console.log(categories);
	if (!categories.includes(category)) {
		categories.push(category);
	}

	let categoryOptions = '';
	let changeEvent;

	for (let cat of categories) {
		let categoryEl = `<option value="${cat}" ${
			cat === 'none' ? 'selected' : ''
		}>${cat}</option>`;
		categoryOptions += categoryEl;
	}

	categorySelect.innerHTML = categoryOptions;

	const addCategoryOptionString = `<option value="addCategory"> Add category </option>`;
	categorySelect.innerHTML += addCategoryOptionString;

	document.removeEventListener('change', changeEvent);
	changeEvent = categorySelect.addEventListener('change', (e) => {
		category = e.target.value === 'addCategory' ? category : e.target.value;
		if (e.target.value !== 'addCategory') return;

		dialogEl.showModal();
	});
};

const listenForNewCat = () => {
	dialogEl.addEventListener('cancel', (e) => {
		e.preventDefault();
	});

	cancelAddCategoryBtn.addEventListener('click', (e) => {
		categorySelect.value = category;
		addCategoryInput.value = '';
		dialogEl.close();
	});

	addNewCategoryBtn.addEventListener('click', (e) => {
		const value = addCategoryInput.value;
		if (value.length < 1) {
			categorySelect.value = category;
			dialogEl.close();
		} else {
			// add new cat to localStorage
			categories.push(value);
			localStorage.setItem('categories', JSON.stringify(categories));

			// repopulate the options
			populateCategoryOptions();

			// give new cat value to select
			categorySelect.value = value;

			// reset addCategoryInput value
			addCategoryInput.value = '';
			// close modal
			dialogEl.close();
		}
	});
};
listenForNewCat();

// v both are taking care of closing the child window.
closeBtn.addEventListener('click', () => {
	ipc.send('close-children-window');
});

submitBtn.addEventListener('click', () => {
	ipc.send('msg-from-child-to-parent', {
		title: titleInput.value,
		category: categorySelect.value,
		description: descriptionInput.value,
		id: ID,
	});
});
