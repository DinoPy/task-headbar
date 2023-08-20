const postTaskToSheets = async (valuesArray) => {
    const {google} = require('googleapis');


    const client = await auth.getClient();

    const googleSheets = google.sheets({version:'v4', auth: client});

    const sheetId = '1abKQ0hVGmpZDAwmYtmOaXpLU51UW5hEa_XWobdQNWXc';
    const response = await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId: sheetId,
        range:'Tasks log',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [ valuesArray ]
        }
    });

    return response.data.updates;

}

module.exports = {postTaskToSheets};
