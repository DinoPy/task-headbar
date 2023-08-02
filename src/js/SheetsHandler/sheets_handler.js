const postTaskToSheets = async (valuesArray) => {
    const {google} = require('googleapis');

    const auth = new google.auth.GoogleAuth({
        credentials: {
            type: 'service_account',
            project_id: 'taskbar-sheet-handler',
            private_key_id: 'f77509f0b37312ce6fd7278fdc48bab8be4f052c',
            private_key: '-----BEGIN PRIVATE KEY-----\n' +
            'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD+///c/qTtTVx1\n' +
            'R93byMg50UJd4n55ilAdzue3vcZEttOUocLPEGGpR1LZHp+vuQw8N5WUZ3haANHA\n' +
            '9ENBeWnB4baz4sah+8FDccUqclS7b5vGDWYfPGh26ZQfcxlCye/FJFEpUxGJCan0\n' +
            'Rv6zVnp6xJJyx6LRaFXGLmbrI9H1WSMQQQC6JYlDvKsKkm/KNzLnGauF9HQofuyM\n' +
            'DbMLwIfq0nRjxurjEvexqNntf9cPtQog5yJSRFQ9zQhXfMzcoixD+1fYCfWLRvI1\n' +
            'oDDnuYegwJTX+zFjMpfkWfMqSX1YKgJkEFZHaSRo54PvTqrfnPsaMR9U0BTJFNrh\n' +
            '8zzdUdWdAgMBAAECggEAA4G3Pc2FrJq//v/kQem+sSbazAo5lYfMpsBJ6Pmz4I2I\n' +
            'FtbrpCfUQ/zuW3yDkynPDIPyK2aJ3ej9eXMSerPF+8vUFKC1fRRGedw2aylD14kH\n' +
            'Ih/ci+jrgdkf95fAXO4EfVhMwm35Q4JtwyV3yrURfZ826Vur9kfCSDWqpiipsj9G\n' +
            'yHBO3LC750hkK/uQIYsAq9iwmxV8ezu5REUQGDhYnfh/bGQMvy1TZnnww2lSp3Pa\n' +
            'ORr18LKQ7sZ7/sqiJOp5cQQ5Tv03TFPFteSLcbxMIgE54ceRx/Gnc68MKipOAcz+\n' +
            'FBXvsVo5yqPVj6vp7cbA4unlvE0dXrNEgcns7P8HEQKBgQD/kG+Fe2mLJeWhnvij\n' +
            '75Zx81OxmRuGoqzeKTicnpFEjqNgtVxPbvqrNboTtld9IlTkMYQYTozjXbqDXhX7\n' +
            'hgAEfe+zI6Rxq1UAozr/gb7Rpvc4HT9Ez47v4lUq8Y+uGCD5wZptFzMYOTCTW8yt\n' +
            'FzGLcGI4/yFKwkOLRwcPANR3cQKBgQD/b1FKGtiDVMp7AUyk+uaRs2eLEWSFEnAh\n' +
            'RvkO9fizZhfQmy3+l++EAEYxjrEIHRgXdedAXXl7JWdxyyLOV4XcpR6nRYoBRUKI\n' +
            'NqVK4hyM2DzcVlYTNCVayteXF239hTOawY9TRRynveq4wj24R1aVUs7tqeAF8VUx\n' +
            'etgXukZi7QKBgGPOCl98tNkssaMOrFeJZ52Uw2imPIO14ADa5Er1+hFmCxPnf+dd\n' +
            'lfNrBgJQwZYS5EhBti6v7oGUxxQqmDckO7mFXSj+kGf72zRmitHh352MsRtvAJhk\n' +
            '3pN8NnqQ3+XDco1XOHHGD6Q0IW5K+YHXfvfPqexMZroFZ89qq60GS/NhAoGAMoMw\n' +
            '8Bae+lmqMOjw3y8+qVFxCG9IEYiz4+DFH9BEfjWSQA5v6gjhtJjZSLOPDquyN/F4\n' +
            '6aGShGfBLR+eom9saVW92hZGVDn+DjHAPi64tqGMZ4YrP2DwgiPavmZDuf69Vb0x\n' +
            'OqZQJFvKLv86dVamKKFXimgthP9UeZRxZz/O64ECgYEA/33Eyjf0wAVEppweEj4F\n' +
            'xAwKvxGJui+fUkj8fawDVCCsu71Ua0xtWST5bW7rF1+uKKplMlpHtxomWBKQ2SPi\n' +
            'X4kq0Ll/xFx2XYIDspt4/emvbi4LH1oHKYIGlE5E2yUyz9tNBct0jhtDCdIfGLH/\n' +
            'p6ZqGhXsSTWB4vIqO05GdjM=\n' +
            '-----END PRIVATE KEY-----\n',
            client_email: 'sheethandler-taskbar@taskbar-sheet-handler.iam.gserviceaccount.com',
            client_id: '101652686259331631094',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/sheethandler-taskbar%40taskbar-sheet-handler.iam.gserviceaccount.com',
            universe_domain: 'googleapis.com'
        },
        scopes: ' https://www.googleapis.com/auth/spreadsheets',
    });

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
