const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

let mainWindow;
let crawling = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')  // Make sure this line is present
        }
    });

    mainWindow.loadFile('index.html');

    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('start-crawling', async (event, url) => {
    console.log('Received start-crawling event with URL:', url);
    crawling = true;
    try {
        console.log('Attempting to fetch URL:', url);
        const response = await axios.get(url);
        console.log('Received response:', response.status);
        const $ = cheerio.load(response.data);
        const title = $('title').text();
        console.log('Extracted title:', title);
        mainWindow.webContents.send('crawl-result', {
            url: url,
            status: response.status,
            title: title
        });
    } catch (error) {
        console.error('Error during crawling:', error.message);
        mainWindow.webContents.send('crawl-error', {
            url: url,
            error: error.message
        });
    }
    crawling = false;
    console.log('Crawling finished');
    mainWindow.webContents.send('crawl-finished');
});

ipcMain.on('toggle-pause', () => {
    crawling = !crawling;
});