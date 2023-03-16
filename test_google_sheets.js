const { google } = require('googleapis');

// Set up authentication
const client = new google.auth.JWT(
	'001test.alex@gmail.com',
	null,
	'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',
	['https://www.googleapis.com/auth/spreadsheets']
);

// Replace with your own spreadsheet ID and range
const spreadsheetId = 'YOUR_SPREADSHEET_ID';
const range = 'Sheet1';

// Create a new row
const newRow = ['John Doe', 'johndoe@example.com', '555-1234'];

// Connect to Google Sheets API and add new row
async function addRow() {
	try {
		// Authorize the client and get access token
		await client.authorize();
		const sheets = google.sheets({ version: 'v4', auth: client });

		// Get the current values in the sheet
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range,
		});
		const values = response.data.values;

		// Add the new row to the values array
		values.push(newRow);

		// Update the sheet with the new values
		const updateResponse = await sheets.spreadsheets.values.update({
			spreadsheetId,
			range,
			valueInputOption: 'USER_ENTERED',
			resource: { values },
		});
		console.log(`${updateResponse.data.updatedCells} cells updated.`);
	} catch (err) {
		console.log(err);
	}
}

addRow();
