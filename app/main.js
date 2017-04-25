const {app, BrowserWindow, dialog, Tray, Menu, globalShortcut, ipcMain, shell} = require('electron');
const fs = require('fs');
const url = require('url');
const path = require('path');
const defaultCfg = require('./default.json');

let win;
let cfg;
let tray;
let home;

const menuTemplate = [
    {
        label: 'Window',
        submenu: [
            {
                label: 'Settings',
                click: () => { onOpenSettings(); }
            },
            {
                label: 'Reset size',
                accelerator: 'CommandOrControl+Z',
                click: () => { onResetSize(); }
            },
            {type: 'separator'},
            {
                label: 'Maximize',
                accelerator: 'CommandOrControl+N',
                click: () => { win.maximize(); }
            },
            {role: 'minimize'},
            {
                label: 'Restart', 
                click: () => { app.relaunch(); }
            },
            {
                label: 'Close', 
                click: () => {
                    app.isQuiting = true;
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About', 
                click: () => { onOpenAbout(); }
            }
        ]
    }
];

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        icon: app.getAppPath() + '/whatsapp.png', 
        backgroundColor: '#009688',
        show: false
    });
    win.once('ready-to-show', () => {
        win.show();
    });


    readCfg();

    win.setSize(parseFloat(cfg.width), parseFloat(cfg.height));
    win.center();
    updateSettings();
    
    win.setMenu(Menu.buildFromTemplate(menuTemplate));

    // register shortcuts
    globalShortcut.register('CommandOrControl+Z', () => {
        onResetSize();
    });
    globalShortcut.register('CommandOrControl+N', () => {
        win.maximize();
    });

    
    win.loadURL('https://web.whatsapp.com/');

    // register events
    win.on('close', (event) => {
        if( !app.isQuiting && cfg.runInBackground){
            event.preventDefault();
            win.hide();
        } else {
            writeCfg();
        }
        return false;
    });

    // open links in external defualt browser
    win.webContents.on('new-window', function(event, url){
        event.preventDefault();
        shell.openExternal(url);
    });

}

app.on('ready', ()=> {
    //get home dir
    home = app.getPath('home');
    //register global events
    ipcMain.on('openInBrowser', (event, url) => {
        shell.openExternal(url);
    });
    createWindow();
});


app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

onOpenSettings = () => {
    let settingsWin = new BrowserWindow({ parent: win, frame: false, width: 500, height: 300, modal: true });
    settingsWin.loadURL(url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(app.getAppPath(), 'ui/settings.html')
    }));

    //register events
    ipcMain.on('settings-get-cfg', (event) => {
        event.returnValue = cfg;
    });
    ipcMain.on('settings-close', () => {
        settingsWin.hide();
    });
    ipcMain.on('settings-save-cfg', (event, arg) => {
        cfg = arg;
        updateSettings();
        settingsWin.hide();
    });
    ipcMain.on('settings-restore-cfg', (event) => {
        event.returnValue = restoreDefaultCfg();
    });


    settingsWin.once('ready-to-show', () => {
        settingsWin.show();
    });
};
onOpenAbout = () => {
    let aboutWin = new BrowserWindow({ parent: win, frame: false, width: 500, height: 300, modal: true });
    aboutWin.loadURL(url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(app.getAppPath(), 'ui/about.html')
    }));

    //register events
    ipcMain.on('about-close', () => {
        aboutWin.hide();
    });


    aboutWin.once('ready-to-show', () => {
        aboutWin.show();
    });
};

onResetSize = () => {
    win.setSize(1200, 800);
    win.center();
};


// config functions

updateSettings = () => {
    if (!cfg.restoreWindowSize) {
        win.setSize(parseFloat(cfg.width), parseFloat(cfg.height));
        win.center();
    }

    if (cfg.runInBackground) setTray();
    else if (tray instanceof Tray) tray.destroy();
    else tray = null;
    
    writeCfg();
};

readCfg = () => {
    if (!fs.existsSync(home + '/.conWhatsapp')) fs.mkdirSync(home + '/.conWhatsapp');
    if (!fs.existsSync(home + '/.conWhatsapp/config.json')) {
        cfg = defaultCfg;
        win.setSize(parseFloat(cfg.width), parseFloat(cfg.height));
        writeCfg();
    } else {
        cfg = JSON.parse(fs.readFileSync(home + '/.conWhatsapp/config.json'));
    }
};


writeCfg = () => {
    if (cfg.restoreWindowSize) {
        cfg.width = win.getSize()[0];
        cfg.height = win.getSize()[1];
    }
    fs.writeFileSync(home + '/.conWhatsapp/config.json', JSON.stringify(cfg));
};

restoreDefaultCfg = () => {
    return defaultCfg;
};

setTray = () => {
    // set tray icon and menu
    try {
        tray = new Tray(path.join(app.getAppPath(), 'whatsapp.png'));
        const contextMenu = Menu.buildFromTemplate([
                {label: 'Show', click: () => {
                    win.show();
                }},
                {label: 'Delete Cookies', click: () => {
                    win.webContents.session.clearStorageData();
                    win.webContents.session.clearCache();
                    win.reload();
                }},
                {label: 'Reload', click: () => {
                    win.reload();
                }},
                {label: 'Exit', click: () => {
                    app.isQuiting = true;
                    app.quit();
                }}
        ]);
        tray.setToolTip('WhatsApp-Web');
        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => {
            win.show();
        });
    } catch (err) {
        cfg.runInBackground = false;
        dialog.showErrorBox('Error creating tray icon', err.message);
    }
};