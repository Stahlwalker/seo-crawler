const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => {
            console.log(`Sending on channel: ${channel}`, data);
            ipcRenderer.send(channel, data);
        },
        on: (channel, func) => {
            console.log(`Setting up listener for channel: ${channel}`);
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
    },
});

console.log('Preload script finished');