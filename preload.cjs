const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        let validChannels = ['window-controls'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    }
});
