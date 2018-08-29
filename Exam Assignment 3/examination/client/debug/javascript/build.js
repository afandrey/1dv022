(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

let BasicWindow = require("./BasicWindow");

function AboutApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

AboutApplication.prototype = Object.create(BasicWindow.prototype);
AboutApplication.prototype.constructor =  AboutApplication;

AboutApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("info-app");

    let template = document.querySelector("#temp-info").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

};

module.exports = AboutApplication;

},{"./BasicWindow":2}],2:[function(require,module,exports){
"use strict";

function BasicWindow(options) {
    this.id = options.id || "" + new Date().getTime();
    this.element = undefined;
    this.x = options.x || 10;
    this.y = options.y || 10;
    this.tabIndex = options.tabIndex || 0;
    this.title = options.title || this.id;
    this.icon = options.icon || "bug_report";
    this.maximizable = options.maximizable || false;
    this.keyActivated = options.keyActivated || false;
    this.zIndex = options.zIndex;
}

BasicWindow.prototype.destroy = function() {
    document.querySelector("#main-frame").removeChild(this.element);
};

BasicWindow.prototype.print = function() {
    let template = document.querySelector("#temp-window").content.cloneNode(true);
    let tempWindow = template.querySelector("div");
    tempWindow.setAttribute("id", this.id);
    tempWindow.style.left = this.x + "px";
    tempWindow.style.top = this.y + "px";
    tempWindow.style.zIndex = this.zIndex;
    tempWindow.setAttribute("tabindex", this.tabIndex);

    let element = document.querySelector("#main-frame");
    let launcher = document.querySelector(".launcher");
    element.insertBefore(template, launcher);

    this.element = document.querySelector("#" + this.id);
    this.element.querySelector(".window-title").appendChild(document.createTextNode(this.title));
    this.element.querySelector(".window-icon").appendChild(document.createTextNode(this.icon));

    if (this.maximizable) {
        let button = document.querySelector("#temp-maximize-btn").content.cloneNode(true);
        let windowButtons = this.element.querySelector(".window-buttons");
        let removeButton = this.element.querySelector(".minimize-btn");
        windowButtons.insertBefore(button, removeButton);
    }
};

BasicWindow.prototype.minimize = function() {
    this.element.classList.toggle("minimized");
};

BasicWindow.prototype.maximize = function() {
    this.element.classList.toggle("maximized");

    let icon = this.element.querySelector(".maximize-icon i");
    if (!this.element.classList.contains("maximized")) {
        this.element.classList.add("reset-window");
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
        icon.replaceChild(document.createTextNode("crop_din"), icon.firstChild);
        this.element.querySelector(".maximize-btn").setAttribute("title", "Maximize");
    } else {
        this.element.classList.remove("reset-window");
        this.element.style.top = "0px";
        this.element.style.left = "0px";
        icon.replaceChild(document.createTextNode("filter_none"), icon.firstChild);
        this.element.querySelector(".maximize-btn").setAttribute("title", "Resize");
    }
};

BasicWindow.prototype.clearContent = function() {
    let content = this.element.querySelector(".window-content");
    while (content.hasChildNodes()) {
        content.removeChild(content.firstChild);
    }
};

module.exports = BasicWindow;

},{}],3:[function(require,module,exports){
"use strict";

let Launcher = require("./Launcher");

function Desktop() {
    this.activeWindow = false;
    this.mouseMoveFunc = this.mouseMove.bind(this);
    this.mouseUpFunc = this.mouseUp.bind(this);
    this.windows = [];
    this.clickX = 0;
    this.clickY = 0;
    this.serialNumber = 0;
    this.zIndex = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.launcher = new Launcher(this);
}

Desktop.prototype.init = function() {
    this.launcher.init();

    document.addEventListener("mousedown", this.mouseDown.bind(this));
    document.addEventListener("keydown", this.keyDown.bind(this));
};

Desktop.prototype.mouseUp = function() {
    window.removeEventListener("mousemove", this.mouseMoveFunc);
    window.removeEventListener("mouseup", this.mouseUpFunc);
    this.activeWindow.element.classList.remove("moving");
};

Desktop.prototype.mouseDown = function(event) {
    let element = event.target;

    if (element.parentNode.classList) {
        while (!element.parentNode.classList.contains("main-frame")) {
            element = element.parentNode;
        }
    }

    if (element.classList.contains("window")) {
        if (parseInt(element.style.zIndex) !== this.zIndex) {
            this.setFocus(element);
        }

        if (event.target.classList.contains("window-top")) {
            if (!event.target.parentNode.classList.contains("maximized")) {
                this.clickX = event.clientX - this.activeWindow.x;
                this.clickY = event.clientY - this.activeWindow.y;
                element.classList.add("moving");

                window.addEventListener("mousemove", this.mouseMoveFunc);
                window.addEventListener("mouseup", this.mouseUpFunc);
            }
        }
    }
};

Desktop.prototype.mouseMove = function(event) {
    let newX = event.clientX - this.clickX;
    let newY = event.clientY - this.clickY;

    let newMidX = newX + parseInt(this.activeWindow.element.offsetWidth) / 2;
    let newMidY = newY + parseInt(this.activeWindow.element.offsetHeight) / 2;

    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    if (newMidX < winWidth && newMidX > 0 && newMidY < winHeight && newY > 0) {
        this.activeWindow.x = event.clientX - this.clickX;
        this.activeWindow.y = event.clientY - this.clickY;

        this.activeWindow.element.classList.remove("reset-window");
        this.activeWindow.element.style.left = this.activeWindow.x + "px";
        this.activeWindow.element.style.top = this.activeWindow.y + "px";
    }
};

Desktop.prototype.clickWindowBtn = function(event) {
    let action = event.target.classList;
    let element = event.target;

    if (element.parentNode) {
        while (!element.parentNode.id) {
            element = element.parentNode;
        }

        element = element.parentNode;
    }

    let index = -1;
    for (let i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            index = i;
        }
    }

    if (index !== -1) {
        this.setFocus(this.windows[index].element);
        if (action.contains("exit-btn")) {
            this.closeWindow(this.windows[index].id);
        } else if (action.contains("minimize-btn")) {
            this.windows[index].minimize();
        } else if (action.contains("maximize-btn")) {
            if (this.windows[index].maximizable) {
                this.windows[index].maximize();
            }
        }
    }
};

Desktop.prototype.closeWindow = function(id) {
    let removed = false;
    for (let i = 0; i < this.windows.length && !removed; i += 1) {
        if (this.windows[i].id === id) {
            let clickedTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
            let container = clickedTooltip.parentNode;
            while (!container.classList.contains("tooltip-container")) {
                container = container.parentNode;
            }

            container.removeChild(clickedTooltip.parentNode);

            this.windows[i].destroy();
            this.windows.splice(i, 1);
            removed = true;
        }
    }
};

Desktop.prototype.clearDesktop = function() {
    for (let i = 0; i < this.windows.length; i += 1) {
        this.windows[i].destroy();

        let windowTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
        let container = windowTooltip.parentNode;
        while (!container.classList.contains("tooltip-container")) {
            container = container.parentNode;
        }
        container.removeChild(windowTooltip.parentNode);
    }

    this.windows = [];
    this.serialNumber = 0;
    this.offsetX = 1;
    this.offsetY = 1;
    this.zIndex = 0;
};

Desktop.prototype.keyDown = function(event) {
    if (document.activeElement.id === this.activeWindow.id) {
        if (this.activeWindow.keyActivated) {
            this.activeWindow.keyInput(event.keyCode);
        }
    }
};

Desktop.prototype.setFocus = function(element) {
    element.focus();

    for (let i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            this.activeWindow = this.windows[i];
            this.zIndex += 1;
            element.style.zIndex = this.zIndex;
        }
    }
};

module.exports = Desktop;

},{"./Launcher":5}],4:[function(require,module,exports){
"use strict";

let BasicWindow = require("./BasicWindow");

function ExampleApp(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

ExampleApp.prototype = Object.create(BasicWindow.prototype);
ExampleApp.prototype.constructor = ExampleApp;

ExampleApp.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing ExampleApp");
    document.querySelector("#" + this.id).classList.add("example-app");
};

ExampleApp.prototype.keyInput = function(key) {
    console.log(key);
};

module.exports = ExampleApp;

},{"./BasicWindow":2}],5:[function(require,module,exports){
"use strict";

let ExApp = require("./ExampleApp");
let Memory = require("./memory/Memory");
let ChatApp = require("./chat/ChatApp");
let About = require("./AboutApp");
let Notes = require("./Remember");

function Launcher(desktop) {
    this.desktop = desktop;

    this.dateOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    };

    this.timeOptions = {
        hour: "2-digit",
        minute: "2-digit"
    };
}

Launcher.prototype.init = function() {
    document.querySelector(".launcher").addEventListener("click", this.launcherClick.bind(this));

    this.updateClock();
    window.setInterval(this.updateClock.bind(this), 1000);
};

Launcher.prototype.launcherClick = function(event) {
    let value;
    let icon;
    let title;

    let element = this.getClickedLauncherElement(event.target);

    if (element) {
        value = element.getAttribute("value");
    }

    if (value) {
        let switchTo = value.split(":");

        if (switchTo[0] === "id") {
            if (element.classList.contains("tooltip-close")) {
                this.desktop.closeWindow(switchTo[1]);
            } else {
                this.switchToWindow(switchTo[1]);
            }
        } else {
            icon = element.querySelector("i").textContent;
            title = element.querySelector(".tooltip-title").textContent;
            this.startApp(value, icon, title);
        }
    }
};

Launcher.prototype.getClickedLauncherElement = function(target) {
    let element;

    if (target.getAttribute("value")) {
        element = target;
    } else if (target.parentNode.getAttribute("value")) {
        element = target.parentNode;
    }

    return element;
};

Launcher.prototype.startApp = function(type, icon, title) {
    let marginX = 10 * (this.desktop.offsetX);
    let marginY = 10 * (this.desktop.offsetY);

    let options = {
        id: "win-" + this.desktop.serialNumber,
        x: marginX,
        y: marginY,
        tabIndex: this.desktop.serialNumber,
        zIndex: this.desktop.zIndex,
        icon: icon,
        title: title,
        maximizable: false,
        keyActivated: false
    };

    let newApp = this.createApplication(type, options);

    if (newApp) {
        let buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.clickWindowBtn.bind(this.desktop));

        this.desktop.windows.push(newApp);

        this.addRunningApp(type, newApp);

        this.desktop.serialNumber += 1;
        this.desktop.offsetX += 1;
        this.desktop.offsetY += 1;

        this.desktop.setFocus(newApp.element);
        this.checkBounds(newApp);
    }
};

Launcher.prototype.createApplication = function(type, options) {
    let newApp;

    switch (type) {
        case "example": {
            options.maximizable = true;
            options.keyActivated = true;
            newApp = new ExApp(options);
            newApp.print();
            break;
        }
        case "memory": {
            options.keyActivated = true;
            newApp = new Memory(options);
            newApp.init();
            break;
        }
        case "chat": {
            options.maximizable = true;
            newApp = new ChatApp(options);
            newApp.init();
            break;
        }
        case "remember": {
            options.maximizable = true;
            options.keyActivated = true;
            newApp = new Notes(options);
            newApp.print();
            break;
        }
        case "info": {
            options.maximizable = true;
            newApp = new About(options);
            newApp.print();
            break;
        }
        case "reset": {
            this.desktop.clearDesktop();
            break;
        }
    }

    return newApp;
};

Launcher.prototype.checkBounds = function(app) {
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    let appRight = app.x + parseInt(app.element.offsetWidth);
    let appBottom = app.y + parseInt(app.element.offsetHeight);

    if (appRight > winWidth || app.x < 0) {
        this.desktop.offsetX = 1;
        app.x = 10 * (this.desktop.offsetX);
        app.element.style.left = app.x + "px";
    } else if (appBottom > winHeight || app.y < 0) {
        this.desktop.offsetY = 1;
        app.y = 10 * (this.desktop.offsetY);
        app.element.style.top = app.y + "px";
    }
};

Launcher.prototype.switchToWindow = function(id) {
    let window = document.querySelector("#" + id);

    if (window) {
        if (window.classList.contains("minimized")) {
            window.classList.remove("minimized");
        }
        this.desktop.setFocus(window);
    }
};

Launcher.prototype.addRunningApp = function(type, app) {
    let container = document.querySelector("li[value='" + type + "'] .tooltip-container");
    let template = document.querySelector("#temp-tooltip").content.cloneNode(true);
    template.querySelector(".tooltip").appendChild(document.createTextNode(app.title + "(" + app.id + ")"));
    template.querySelector(".tooltip").setAttribute("value", "id:" + app.id);
    template.querySelector(".tooltip-close").setAttribute("value", "id:" + app.id);

    container.appendChild(template);
};

Launcher.prototype.updateClock = function() {
    let dateObj = new Date();
    let date = dateObj.toLocaleDateString("sv-se", this.dateOptions);
    let time = dateObj.toLocaleTimeString("sv-se", this.timeOptions);

    let timeEl = document.querySelector(".launcher-clock-time");
    let dateEl = document.querySelector(".launcher-clock-date");

    let timeNode = document.createTextNode(time);
    let dateNode = document.createTextNode(date);

    timeEl.replaceChild(timeNode, timeEl.firstChild);
    dateEl.replaceChild(dateNode, dateEl.firstChild);
};

module.exports = Launcher;

},{"./AboutApp":1,"./ExampleApp":4,"./Remember":6,"./chat/ChatApp":9,"./memory/Memory":13}],6:[function(require,module,exports){
"use strict";

let BasicWindow = require("./BasicWindow");

function Remember(id) {
    BasicWindow.call(this, id);

}

Remember.prototype = Object.create(BasicWindow.prototype);
Remember.prototype.constructor = Remember;


Remember.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing RememberApp");
    document.querySelector("#" + this.id).classList.add("remember-app");

    let menu = this.element.querySelector(".window-menu");
    let alt1 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt1.querySelector(".menu-alt").appendChild(document.createTextNode("New Note"));

    let alt2 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt2.querySelector(".menu-alt").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);
};

module.exports = Remember;

},{"./BasicWindow":2}],7:[function(require,module,exports){
"use strict";

let Desktop = require("./Desktop");

let d = new Desktop();
d.init();

},{"./Desktop":3}],8:[function(require,module,exports){
"use strict";

function Chat(element, server, channel, username) {
    this.element = element;
    this.server = server;
    this.channel = channel || "";
    this.username = username;
    this.socket = undefined;
    this.key = "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd";
    this.online = false;
    this.messages = [];

    this.timeOptions = {
        year: "numeric", month: "numeric",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };
}

Chat.prototype.init = function() {
    this.print();

    this.readStoredMessages();

    this.connectToServer();

    this.socket.addEventListener("message", this.newMessageFromServer.bind(this));
    this.element.querySelector(".chat-sendBtn").addEventListener("click", this.formSubmit.bind(this));
    this.element.querySelector("form").addEventListener("submit", this.formSubmit.bind(this));
    this.element.querySelector("form").addEventListener("focusout", this.toggleFocus.bind(this));
    this.element.querySelector(".inputField").addEventListener("focus", this.toggleFocus.bind(this));
    this.element.querySelector(".inputField").addEventListener("input", this.checkInput.bind(this));
    this.element.querySelector(".chat-sendBtn").addEventListener("focus", this.toggleFocus.bind(this));
};

Chat.prototype.print = function() {
    let template = document.querySelector("#temp-chat-app").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

    let info = document.querySelector("#temp-window-menu-info").content.cloneNode(true);
    let channelInfo = "";

    if (this.channel === "") {
        channelInfo = "Non-specified";
    } else {
        channelInfo = this.channel;
    }

    let infoNode = document.createTextNode("#" + channelInfo.slice(0, 18) + "/" + this.username.slice(0, 10));
    info.querySelector(".menu-info").appendChild(infoNode);

    let menuInfo = this.element.querySelector(".menu-info");
    let menu = this.element.querySelector(".window-menu");
    if (menuInfo) {
        menu.replaceChild(info, menuInfo);
    } else {
        menu.appendChild(info);
    }
};

Chat.prototype.connectToServer = function() {
    this.element.querySelector(".window-icon").classList.remove("chat-offline");
    this.element.querySelector(".window-icon").classList.add("chat-connecting");

    this.socket = new WebSocket("ws://" + this.server, "charcords");

    this.socket.addEventListener("open", this.setOnline.bind(this));
    this.socket.addEventListener("error", this.setOffline.bind(this));
};

Chat.prototype.setOffline = function() {
    this.element.querySelector(".window-icon").classList.remove("chat-connecting");
    this.element.querySelector(".window-icon").classList.add("chat-offline");
    this.online = false;

    let data = {
        username: "OfflineMsg",
        data: "Wasn't able to connect to server."
    };
    this.printNewMessage(data);
};

Chat.prototype.setOnline = function() {
    this.online = true;
    this.element.querySelector(".window-icon").classList.remove("chat-connection");
    this.element.querySelector(".window-icon").classList.add("chat-online");
};

Chat.prototype.newMessageFromServer = function(event) {
    let data = JSON.parse(event.data);

    if (data.type === "message") {
        data.timestamp = new Date().toLocaleDateString("sv-se", this.timeOptions);
        if (!data.channel) {
            data.channel = "";
        }

        if (data.channel === this.channel) {
            this.printNewMessage(data);
            this.saveNewMessage(data);
        }
    }
};

Chat.prototype.formSubmit = function(event) {
    if (event) {
        event.preventDefault();
    }

    if (this.online) {
        let input = this.element.querySelector(".inputField").value;
        if (input.length > 1) {
            if (input.charCodeAt(input.length - 1) === 10) {
                input = input.slice(0, -1);
            }

            let msg = {
                "type": "message",
                "data": input,
                "username": this.username,
                "channel": this.channel,
                "key": this.key
            };

            this.socket.send(JSON.stringify(msg));

            this.element.querySelector("form").reset();
            this.element.querySelector(".chat-sendBtn").setAttribute("disabled", "disabled");
        }
    }
};

Chat.prototype.printNewMessage = function(data) {
    let container = this.element.querySelector(".chat-message-list");
    let scrolled = false;

    if (container.scrollTop !== (container.scrollHeight - container.offsetHeight)) {
        scrolled = true;
    }

    let template = document.querySelector("#temp-chat-message-line").content.cloneNode(true);
    let usernameNode = document.createTextNode(data.username + ": ");
    let messageNode = this.parseMessage(data.data);

    template.querySelector(".chat-message").appendChild(messageNode);

    if (data.timestamp) {
        template.querySelector(".chat-message-line").setAttribute("title", data.timestamp);
    }

    if (this.username === data.username) {
        template.querySelector("li").classList.add("chat-bubble-me");
    } else {
        template.querySelector("li").classList.add("chat-bubble");
        template.querySelector(".chat-username").appendChild(usernameNode);
    }

    this.element.querySelector(".chat-message-list ul").appendChild(template);

    this.scrollToBottom(scrolled);
};

Chat.prototype.scrollToBottom = function(scrolled) {
    let container = this.element.querySelector(".chat-message-list");
    if (!scrolled) {
        container.scrollTop = container.scrollHeight;
    }
};

Chat.prototype.saveNewMessage = function(data) {
    let newMsg = {
        username: data.username,
        data: data.data,
        timestamp: data.timestamp
    };
    this.messages.push(newMsg);
    localStorage.setItem("chat-" + this.channel, JSON.stringify(this.messages));
};

Chat.prototype.readStoredMessages = function() {
    if (localStorage.getItem("chat-" + this.channel)) {
        let messages = localStorage.getItem("chat-" + this.channel);
        this.messages = JSON.parse(messages);

        for (let i = 0; i < this.messages.length; i += 1) {
            this.printNewMessage(this.messages[i]);
        }

        if (this.messages.length > 0) {
            let separator = document.querySelector("#temp-chat-history-separator").content.cloneNode(true);
            this.element.querySelector(".chat-message-list ul").appendChild(separator);

            let container = this.element.querySelector(".chat-message-list");
            container.scrollTop = container.scrollHeight;
        }
    }
};

Chat.prototype.toggleFocus = function() {
    this.element.classList.toggle("focused-window");
};

Chat.prototype.checkInput = function(event) {
    let input = event.target.value;

    if (input.length > 0) {
        this.element.querySelector(".chat-sendBtn").removeAttribute("disabled");
    } else {
        this.element.querySelector(".chat-sendBtn").setAttribute("disabled", "disabled");
    }

    if (input.charCodeAt(input.length - 1) === 10) {
        this.formSubmit();
    }

    if (input.charCodeAt(0) === 10) {
        this.element.querySelector("form").reset();
        this.element.querySelector(".chat-sendBtn").setAttribute("disabled", "disabled");
    }
};

Chat.prototype.parseMessage = function(text) {
    let frag = document.createDocumentFragment();
    let link;
    let emoji;
    let textNode;

    let words = text.split(" ");

    for (let i = 0; i < words.length; i += 1) {
        if (words[i].slice(0, 7) === "http://") {
            link = words[i].slice(7);
            frag = this.addLinkOrEmoji(frag, "link", link);
        } else if (words[i].slice(0, 8) === "https://") {
            link = words[i].slice(7);
            frag = this.addLinkOrEmoji(frag, "link", link);
        } else if (words[i].charAt(0) === ":" || words[i].charAt(0) === ";") {
            emoji = words[i];
            frag = this.addLinkOrEmoji(frag, "emoji", emoji);
        } else {
            textNode = document.createTextNode(words[i] + " ");
            frag.appendChild(textNode);
        }
    }

    return frag;
};

Chat.prototype.addLinkOrEmoji = function(frag, type, data) {
    let textNode;
    if (type === "link") {
        let aTag = document.createElement("a");
        aTag.setAttribute("href", "//" + data);
        aTag.setAttribute("target", "_blank");
        let linkNode = document.createTextNode(data);

        aTag.appendChild(linkNode);
        textNode = document.createTextNode(" ");

        frag.appendChild(aTag);
        frag.appendChild(textNode);
    } else if (type === "emoji") {
        let spanTag = this.parseEmoji(data);

        textNode = document.createTextNode(" ");

        frag.appendChild(spanTag);
        frag.appendChild(textNode);
    }

    return frag;
};

Chat.prototype.parseEmoji = function(emoji) {
    let template = document.querySelector("#temp-chat-emoji").content.cloneNode(true);
    let em = template.querySelector(".emoji");

    switch (emoji) {
        case ":)": {
            em.classList.add("emoji-smiley");
            break;
        }
        case ":D": {
            em.classList.add("emoji-happy");
            break;
        }
        case ";)": {
            em.classList.add("emoji-flirt");
            break;
        }
        case ":O": {
            em.classList.add("emoji-surprised");
            break;
        }
        case ":P": {
            em.classList.add("emoji-tounge");
            break;
        }
        case ":@": {
            em.classList.add("emoji-angry");
            break;
        }
        case ":S": {
            em.classList.add("emoji-confused");
            break;
        }
        case ":(": {
            em.classList.add("emoji-sad");
            break;
        }
        case ":'(": {
            em.classList.add("emoji-crying");
            break;
        }
        default: {
            em = document.createTextNode(emoji);
        }
    }

    return em;
};

Chat.prototype.clearHistory = function() {
    localStorage.removeItem("chat-" + this.channel);
    this.messages = [];

    let listElement = this.element.querySelector("ul");
    while (listElement.hasChildNodes()) {
        listElement.removeChild(listElement.firstChild);
    }
};

module.exports = Chat;

},{}],9:[function(require,module,exports){
"use strict";

let BasicWindow = require("./../BasicWindow");
let Chat = require("./Chat");

function ChatApp(options) {
    BasicWindow.call(this, options);
    this.chat = undefined;
    this.settingsOpen = false;
    this.username = "";
    this.server = "vhost3.lnu.se:20080/socket/";
    this.channel = "";

    this.addFocusFunc = this.addFocus.bind(this);
    this.removeFocusFunc = this.removeFocus.bind(this);
}

ChatApp.prototype = Object.create(BasicWindow.prototype);
ChatApp.prototype.constructor = ChatApp;

ChatApp.prototype.init = function() {
    if (localStorage.getItem("username")) {
        this.username = localStorage.getItem("username");
    }

    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
};

ChatApp.prototype.print = function() {
    BasicWindow.prototype.print.call(this);

    this.element.classList.add("chat-app");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    let menu = this.element.querySelector(".window-menu");
    let alt = document.querySelector("#temp-window-menu-alt").content;

    let alt1 = alt.cloneNode(true);
    alt1.querySelector(".menu-alt").appendChild(document.createTextNode("Clear History"));

    let alt2 = alt.cloneNode(true);
    alt2.querySelector(".menu-alt").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);

    this.menuSettings();
};

ChatApp.prototype.destroy = function() {
    if (this.chat) {
        this.chat.socket.close();
    }

    document.querySelector("#main-frame").removeChild(this.element);
};

ChatApp.prototype.menuClicked = function(event) {
    let target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "settings": {
                this.menuSettings();
                break;
            }
            case "clear history": {
                if (this.chat) {
                    this.chat.clearHistory();
                }
                break;
            }
        }
    }
};

ChatApp.prototype.menuSettings = function() {
    let i;
    let inputList;

    if (!this.settingsOpen) {
        let template = document.querySelector("#temp-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("chat-settings");

        template = this.addSettings(template);

        inputList = template.querySelectorAll("input[type='text']");

        for (i = 0; i < inputList.length; i += 1) {
            inputList[i].addEventListener("focus", this.addFocusFunc);
            inputList[i].addEventListener("focusout", this.removeFocusFunc);
        }

        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    } else {
        let settings = document.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

ChatApp.prototype.addSettings = function(element) {
    let template = document.querySelector("#temp-chat-settings").content.cloneNode(true);

    template.querySelector("input[name='username']").setAttribute("value", this.username);
    template.querySelector("input[name='server']").setAttribute("value", this.server);
    template.querySelector("input[name='channel'").setAttribute("value", this.channel);

    template.querySelector("input[type='button']").addEventListener("click", this.saveSettings.bind(this));

    element.querySelector(".settings").appendChild(template);
    return element;
};

ChatApp.prototype.saveSettings = function() {
    if (this.chat) {
        this.chat.socket.close();
        this.chat.online = false;
    }

    let form = this.element.querySelector(".settings-form");

    this.username = form.querySelector("input[name='username']").value;
    this.server = form.querySelector("input[name='server']").value;
    this.channel = form.querySelector("input[name='channel']").value;

    this.element.querySelector(".window-icon").classList.remove("chat-online");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    this.clearContent();

    if (this.username === "") {
        this.username = "User";
    }

    this.chat = new Chat(this.element, this.server, this.channel, this.username);
    this.chat.init();
    this.settingsOpen = false;
    this.setFocus();

    localStorage.setItem("username", this.username);
};

ChatApp.prototype.addFocus = function() {
    if (!this.element.classList.contains("focused-window")) {
        this.element.classList.add("focused-window");
    }
};

ChatApp.prototype.removeFocus = function() {
    if (this.element.classList.contains("focused-window")) {
        this.element.classList.remove("focused-window");
    }
};

ChatApp.prototype.setFocus = function() {
    this.element.classList.remove("focused-window");
    this.element.focus();
};

module.exports = ChatApp;

},{"./../BasicWindow":2,"./Chat":8}],10:[function(require,module,exports){
"use strict";

function Board(element, x, y) {
    this.x = x;
    this.y = y;
    this.element = element;

    this.printCards();
}

Board.prototype.printCards = function() {
    let frag = document.createDocumentFragment();
    let rowDiv;
    let cardDiv;

    for (let i = 0; i < this.y; i += 1) {
        rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let j = 0; j < this.x; j += 1) {
            cardDiv = document.createElement("div");
            cardDiv.classList.add("card-" + i + j, "card");
            rowDiv.appendChild(cardDiv);
        }

        frag.appendChild(rowDiv);
    }

    this.element.appendChild(frag);
};

module.exports = Board;

},{}],11:[function(require,module,exports){
"use strict";

function Card(id, imgNr) {
    this.id = id;
    this.imgNr = imgNr;
}

module.exports = Card;

},{}],12:[function(require,module,exports){
"use strict";

let Board = require("./Board");
let Card = require("./Card");
let Timer = require("./Timer");

function Game(element, x, y) {
    this.element = element;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.layout = new Board(element, this.x, this.y);
    this.board = [];
    this.visibleCards = [];
    this.turns = 0;
    this.correctCount = 0;
    this.imageList = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
    this.images = this.imageList.slice(0, (this.y * this.x));
    this.clickFunc = this.click.bind(this);

    this.timer = new Timer();
    this.timer.start();

    this.totalTime = 0;

    this.shuffleImages();
    this.addEvents();
}

Game.prototype.init = function() {
    let i = 0;

    this.board = [];
    if (this.x > this.y) {
        for (i = 0; i < this.x; i += 1) {
            this.board.push(new Array(this.y));
        }
    }
    else {
        for (i = 0; i < this.y; i += 1) {
            this.board.push(new Array(this.x));
        }
    }

    this.visibleCards = [];

    for (i = 0; i < this.y; i += 1) {
        for (let j = 0; j < this.x - 1; j += 2) {
            this.board[i][j] = new Card("" + i + j, this.images.pop());
            this.board[i][j + 1] = new Card("" + i + (j + 1), this.images.pop());
        }
    }
};

Game.prototype.shuffleImages = function() {
    let temp;
    let rand;
    for (let i = 0; i < this.images.length; i += 1) {
        temp = this.images[i];
        rand = Math.floor(Math.random() * this.images.length);
        this.images[i] = this.images[rand];
        this.images[rand] = temp;
    }
};

Game.prototype.addEvents = function() {
    this.element.addEventListener("click", this.clickFunc);
};

Game.prototype.removeEvents = function() {
    this.element.removeEventListener("click", this.clickFunc);
};

Game.prototype.click = function(event) {
    this.turnCard(event.target);
};

Game.prototype.turnCard = function(element) {
    if (this.visibleCards.length < 2 && !element.classList.contains("disable")) {
        if (element.classList.contains("card")) {
            let yx = element.classList[0].split("-")[1];
            let y = yx.charAt(0);
            let x = yx.charAt(1);

            element.classList.add("img-" + this.board[y][x].imgNr);
            element.classList.add("img");

            this.visibleCards.push(this.board[y][x]);

            this.element.querySelector(".card-" + this.board[y][x].id).classList.add("disable");

            if (this.visibleCards.length === 2) {
                this.checkIfCorrect();
            }
        }
    }
};

Game.prototype.checkIfCorrect = function() {
    this.turns += 1;
    if (this.visibleCards[0].imgNr === this.visibleCards[1].imgNr) {
        this.element.querySelector(".card-" + this.visibleCards[0].id).classList.add("right");
        this.element.querySelector(".card-" + this.visibleCards[1].id).classList.add("right");

        this.visibleCards = [];

        this.correctCount += 1;

        if (this.correctCount === (this.x * this.y / 2)) {
            this.gameOver();
        }
    }
    else {
        for (let i = 0; i < this.visibleCards.length; i += 1) {
            this.element.querySelector(".card-" + this.visibleCards[i].id).classList.add("wrong");
            this.element.querySelector(".card-" + this.visibleCards[i].id).classList.remove("disable");
        }

        setTimeout(this.turnBackCards.bind(this), 1000);
    }
};

Game.prototype.turnBackCards = function() {
    let tempCard;
    for (let i = 0; i < this.visibleCards.length; i += 1) {
        tempCard = this.visibleCards[i];
        this.element.querySelector(".card-" + tempCard.id).classList.remove("wrong", "img", "img-" + tempCard.imgNr);
    }

    this.visibleCards = [];
};


Game.prototype.gameOver = function() {
    this.totalTime = this.timer.stop();
    let template = document.querySelector("#temp-memory-gameover").content.cloneNode(true);
    template.querySelector(".memory-turns").appendChild(document.createTextNode(this.turns));
    template.querySelector(".memory-time").appendChild(document.createTextNode(this.totalTime));

    this.element.appendChild(template);
};

module.exports = Game;

},{"./Board":10,"./Card":11,"./Timer":14}],13:[function(require,module,exports){
"use strict";

let BasicWindow = require("./../BasicWindow");
let MemoryGame = require("./Game");

function Memory(options) {
    BasicWindow.call(this, options);

    this.settingsOpen = false;
    this.game = undefined;
    this.boardSize = [4, 4];
    this.markedCard = undefined;
}

Memory.prototype = Object.create(BasicWindow.prototype);
Memory.prototype.constructor = Memory;

Memory.prototype.init = function() {
    this.print();
    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));

    this.game = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    this.game.init();
};

Memory.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("memory-app");

    let menu = this.element.querySelector(".window-menu");
    let alt1 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt1.querySelector(".menu-alt").appendChild(document.createTextNode("New Game"));

    let alt2 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt2.querySelector(".menu-alt").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);
};

Memory.prototype.menuClicked = function(event) {
    let target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "settings": {
                //open the settings
                this.menuSettings();
                break;
            }

            case "new game": {
                if (this.settingsOpen) {
                    //hide the settings
                    this.settingsOpen = false;
                }

                //restart new game
                this.restart();
                break;
            }
        }
    }
};

Memory.prototype.restart = function(value) {
    if (value) {
        this.boardSize = value.split("x");
    }

    let y = this.boardSize[1];
    let x = this.boardSize[0];

    this.clearContent();

    this.game.removeEvents();

    //create new game and init it
    this.game = new MemoryGame(this.element.querySelector(".window-content"), x, y);
    this.game.init();
};


Memory.prototype.menuSettings = function() {
    if (!this.settingsOpen) {
        //show the settings
        let template = document.querySelector("#temp-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("memory-settings");

        template = this.addSettings(template);
        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    }
    else {
        //hide the settings
        let settings = this.element.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

Memory.prototype.addSettings = function(element) {
    let template = document.querySelector("#temp-memory-settings").content.cloneNode(true);

    element.querySelector(".settings").appendChild(template);
    element.querySelector("input[type='button']").addEventListener("click", this.saveSettings.bind(this));
    return element;
};

Memory.prototype.saveSettings = function() {
    let value = this.element.querySelector("select[name='board-size']").value;

    this.restart(value);
    this.settingsOpen = false;
};

Memory.prototype.keyInput = function(key) {
    if (!this.markedCard) {
        this.markedCard = this.element.querySelector(".card");
        this.markedCard.classList.add("marked");
    } else {
        this.markedCard.classList.toggle("marked");
        switch (key) {
            case 39: {
                this.keyRight();
                break;
            }

            case 37: {
                this.keyLeft();
                break;
            }

            case 38: {
                this.keyUp();
                break;
            }

            case 40: {
                this.keyDown();
                break;
            }

            case 13: {
                this.game.turnCard(this.markedCard);
                break;
            }
        }

        this.markedCard.classList.toggle("marked");
    }
};

Memory.prototype.keyRight = function() {
    if (this.markedCard.nextElementSibling) {
        this.markedCard = this.markedCard.nextElementSibling;
    }
    else {
        if (this.markedCard.parentNode.nextElementSibling) {
            this.markedCard = this.markedCard.parentNode.nextElementSibling.firstElementChild;
        }
        else {
            this.markedCard = this.element.querySelector(".card");
        }
    }
};

Memory.prototype.keyLeft = function() {
    if (this.markedCard.previousElementSibling) {
        this.markedCard = this.markedCard.previousElementSibling;
    }
    else {
        if (this.markedCard.parentNode.previousElementSibling) {
            this.markedCard = this.markedCard.parentNode.previousElementSibling.lastElementChild;
        }
        else {
            var rows = this.element.querySelectorAll(".row");
            var lastRow = rows[rows.length - 1];
            this.markedCard = lastRow.lastElementChild;
        }
    }
};

Memory.prototype.keyUp = function() {
    //find next row and card
    let row;
    let rowY;

    if (this.markedCard.parentNode.previousElementSibling) {
        let id = this.markedCard.classList[0].slice(-2);
        rowY = parseInt(id.charAt(0)) - 1;
    }
    else {
        let rows = this.element.querySelectorAll(".row");
        row = rows[rows.length - 1];
        rowY = rows.length - 1;
    }

    let cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

Memory.prototype.keyDown = function() {
    let rowY;

    if (this.markedCard.parentNode.nextElementSibling) {
        let id = this.markedCard.classList[0].slice(-2);
        rowY = parseInt(id.charAt(0)) + 1;
    }
    else {
        rowY = 0;
    }

    let cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

module.exports = Memory;

},{"./../BasicWindow":2,"./Game":12}],14:[function(require,module,exports){
"use strict";

function Timer() {
    this.startTime = undefined;
}

Timer.prototype.start = function() {
    this.startTime = new Date().getTime();
};

Timer.prototype.stop = function() {
    let now = new Date().getTime();

    return (now - this.startTime) / 1000;
};

Timer.prototype.print = function(diff) {
    if (this.element.hasChildNodes()) {
        this.element.replaceChild(document.createTextNode(diff), this.element.firstChild);
    }
    else {
        this.element.appendChild(document.createTextNode(diff));
    }
};

module.exports = Timer;

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc291cmNlL2pzL0Fib3V0QXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9CYXNpY1dpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvanMvRXhhbXBsZUFwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL1JlbWVtYmVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2NoYXQvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdC9DaGF0QXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvQm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9DYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvR2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xuXG5mdW5jdGlvbiBBYm91dEFwcGxpY2F0aW9uKGlkLCB4LCB5KSB7XG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCwgeCwgeSk7XG59XG5cbkFib3V0QXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xuQWJvdXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgQWJvdXRBcHBsaWNhdGlvbjtcblxuQWJvdXRBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImluZm8tYXBwXCIpO1xuXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wLWluZm9cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFib3V0QXBwbGljYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gQmFzaWNXaW5kb3cob3B0aW9ucykge1xuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLmVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy54ID0gb3B0aW9ucy54IHx8IDEwO1xuICAgIHRoaXMueSA9IG9wdGlvbnMueSB8fCAxMDtcbiAgICB0aGlzLnRhYkluZGV4ID0gb3B0aW9ucy50YWJJbmRleCB8fCAwO1xuICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8IHRoaXMuaWQ7XG4gICAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uIHx8IFwiYnVnX3JlcG9ydFwiO1xuICAgIHRoaXMubWF4aW1pemFibGUgPSBvcHRpb25zLm1heGltaXphYmxlIHx8IGZhbHNlO1xuICAgIHRoaXMua2V5QWN0aXZhdGVkID0gb3B0aW9ucy5rZXlBY3RpdmF0ZWQgfHwgZmFsc2U7XG4gICAgdGhpcy56SW5kZXggPSBvcHRpb25zLnpJbmRleDtcbn1cblxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcbn07XG5cbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC13aW5kb3dcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgbGV0IHRlbXBXaW5kb3cgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiZGl2XCIpO1xuICAgIHRlbXBXaW5kb3cuc2V0QXR0cmlidXRlKFwiaWRcIiwgdGhpcy5pZCk7XG4gICAgdGVtcFdpbmRvdy5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xuICAgIHRlbXBXaW5kb3cuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xuICAgIHRlbXBXaW5kb3cuc3R5bGUuekluZGV4ID0gdGhpcy56SW5kZXg7XG4gICAgdGVtcFdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCB0aGlzLnRhYkluZGV4KTtcblxuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xuICAgIGxldCBsYXVuY2hlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGF1bmNoZXJcIik7XG4gICAgZWxlbWVudC5pbnNlcnRCZWZvcmUodGVtcGxhdGUsIGxhdW5jaGVyKTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuaWNvbikpO1xuXG4gICAgaWYgKHRoaXMubWF4aW1pemFibGUpIHtcbiAgICAgICAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1tYXhpbWl6ZS1idG5cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIGxldCB3aW5kb3dCdXR0b25zID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWJ1dHRvbnNcIik7XG4gICAgICAgIGxldCByZW1vdmVCdXR0b24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZS1idG5cIik7XG4gICAgICAgIHdpbmRvd0J1dHRvbnMuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgcmVtb3ZlQnV0dG9uKTtcbiAgICB9XG59O1xuXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1pbmltaXplZFwiKTtcbn07XG5cbkJhc2ljV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwibWF4aW1pemVkXCIpO1xuXG4gICAgbGV0IGljb24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1pY29uIGlcIik7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWF4aW1pemVkXCIpKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicmVzZXQtd2luZG93XCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJjcm9wX2RpblwiKSwgaWNvbi5maXJzdENoaWxkKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWF4aW1pemUtYnRuXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIFwiTWF4aW1pemVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJyZXNldC13aW5kb3dcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XG4gICAgICAgIGljb24ucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiZmlsdGVyX25vbmVcIiksIGljb24uZmlyc3RDaGlsZCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWJ0blwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBcIlJlc2l6ZVwiKTtcbiAgICB9XG59O1xuXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuY2xlYXJDb250ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRlbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKTtcbiAgICB3aGlsZSAoY29udGVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChjb250ZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNXaW5kb3c7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubGV0IExhdW5jaGVyID0gcmVxdWlyZShcIi4vTGF1bmNoZXJcIik7XG5cbmZ1bmN0aW9uIERlc2t0b3AoKSB7XG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcbiAgICB0aGlzLm1vdXNlTW92ZUZ1bmMgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMubW91c2VVcEZ1bmMgPSB0aGlzLm1vdXNlVXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcbiAgICB0aGlzLmNsaWNrWCA9IDA7XG4gICAgdGhpcy5jbGlja1kgPSAwO1xuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcbiAgICB0aGlzLnpJbmRleCA9IDA7XG4gICAgdGhpcy5vZmZzZXRYID0gMDtcbiAgICB0aGlzLm9mZnNldFkgPSAwO1xuICAgIHRoaXMubGF1bmNoZXIgPSBuZXcgTGF1bmNoZXIodGhpcyk7XG59XG5cbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxhdW5jaGVyLmluaXQoKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlEb3duLmJpbmQodGhpcykpO1xufTtcblxuRGVza3RvcC5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1vdmluZ1wiKTtcbn07XG5cbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlRG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdCkge1xuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJtYWluLWZyYW1lXCIpKSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93XCIpKSB7XG4gICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LnN0eWxlLnpJbmRleCkgIT09IHRoaXMuekluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLnNldEZvY3VzKGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3ctdG9wXCIpKSB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuYWN0aXZlV2luZG93Lng7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5hY3RpdmVXaW5kb3cueTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtb3ZpbmdcIik7XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IG5ld1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XG4gICAgbGV0IG5ld1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XG5cbiAgICBsZXQgbmV3TWlkWCA9IG5ld1ggKyBwYXJzZUludCh0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50Lm9mZnNldFdpZHRoKSAvIDI7XG4gICAgbGV0IG5ld01pZFkgPSBuZXdZICsgcGFyc2VJbnQodGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5vZmZzZXRIZWlnaHQpIC8gMjtcblxuICAgIGxldCB3aW5XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGxldCB3aW5IZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICBpZiAobmV3TWlkWCA8IHdpbldpZHRoICYmIG5ld01pZFggPiAwICYmIG5ld01pZFkgPCB3aW5IZWlnaHQgJiYgbmV3WSA+IDApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cueCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmNsaWNrWDtcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcblxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJyZXNldC13aW5kb3dcIik7XG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMuYWN0aXZlV2luZG93LnggKyBcInB4XCI7XG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5hY3RpdmVXaW5kb3cueSArIFwicHhcIjtcbiAgICB9XG59O1xuXG5EZXNrdG9wLnByb3RvdHlwZS5jbGlja1dpbmRvd0J0biA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGFjdGlvbiA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3Q7XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XG4gICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0Rm9jdXModGhpcy53aW5kb3dzW2luZGV4XS5lbGVtZW50KTtcbiAgICAgICAgaWYgKGFjdGlvbi5jb250YWlucyhcImV4aXQtYnRuXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KHRoaXMud2luZG93c1tpbmRleF0uaWQpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1pbmltaXplLWJ0blwiKSkge1xuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5taW5pbWl6ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1heGltaXplLWJ0blwiKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1heGltaXplKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5EZXNrdG9wLnByb3RvdHlwZS5jbG9zZVdpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGggJiYgIXJlbW92ZWQ7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBpZCkge1xuICAgICAgICAgICAgbGV0IGNsaWNrZWRUb29sdGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIlt2YWx1ZT0naWQ6XCIgKyB0aGlzLndpbmRvd3NbaV0uaWQgKyBcIiddXCIpO1xuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGNsaWNrZWRUb29sdGlwLnBhcmVudE5vZGU7XG4gICAgICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnROb2RlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY2xpY2tlZFRvb2x0aXAucGFyZW50Tm9kZSk7XG5cbiAgICAgICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5EZXNrdG9wLnByb3RvdHlwZS5jbGVhckRlc2t0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLndpbmRvd3NbaV0uZGVzdHJveSgpO1xuXG4gICAgICAgIGxldCB3aW5kb3dUb29sdGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIlt2YWx1ZT0naWQ6XCIgKyB0aGlzLndpbmRvd3NbaV0uaWQgKyBcIiddXCIpO1xuICAgICAgICBsZXQgY29udGFpbmVyID0gd2luZG93VG9vbHRpcC5wYXJlbnROb2RlO1xuICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xuICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZSk7XG4gICAgfVxuXG4gICAgdGhpcy53aW5kb3dzID0gW107XG4gICAgdGhpcy5zZXJpYWxOdW1iZXIgPSAwO1xuICAgIHRoaXMub2Zmc2V0WCA9IDE7XG4gICAgdGhpcy5vZmZzZXRZID0gMTtcbiAgICB0aGlzLnpJbmRleCA9IDA7XG59O1xuXG5EZXNrdG9wLnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5pZCA9PT0gdGhpcy5hY3RpdmVXaW5kb3cuaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlV2luZG93LmtleUFjdGl2YXRlZCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cua2V5SW5wdXQoZXZlbnQua2V5Q29kZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5EZXNrdG9wLnByb3RvdHlwZS5zZXRGb2N1cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmZvY3VzKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IHRoaXMud2luZG93c1tpXTtcbiAgICAgICAgICAgIHRoaXMuekluZGV4ICs9IDE7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xuXG5mdW5jdGlvbiBFeGFtcGxlQXBwKGlkLCB4LCB5KSB7XG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCwgeCwgeSk7XG59XG5cbkV4YW1wbGVBcHAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xuRXhhbXBsZUFwcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeGFtcGxlQXBwO1xuXG5FeGFtcGxlQXBwLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgRXhhbXBsZUFwcFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCkuY2xhc3NMaXN0LmFkZChcImV4YW1wbGUtYXBwXCIpO1xufTtcblxuRXhhbXBsZUFwcC5wcm90b3R5cGUua2V5SW5wdXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBFeEFwcCA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBcIik7XG5sZXQgTWVtb3J5ID0gcmVxdWlyZShcIi4vbWVtb3J5L01lbW9yeVwiKTtcbmxldCBDaGF0QXBwID0gcmVxdWlyZShcIi4vY2hhdC9DaGF0QXBwXCIpO1xubGV0IEFib3V0ID0gcmVxdWlyZShcIi4vQWJvdXRBcHBcIik7XG5sZXQgTm90ZXMgPSByZXF1aXJlKFwiLi9SZW1lbWJlclwiKTtcblxuZnVuY3Rpb24gTGF1bmNoZXIoZGVza3RvcCkge1xuICAgIHRoaXMuZGVza3RvcCA9IGRlc2t0b3A7XG5cbiAgICB0aGlzLmRhdGVPcHRpb25zID0ge1xuICAgICAgICB5ZWFyOiBcIm51bWVyaWNcIixcbiAgICAgICAgbW9udGg6IFwibnVtZXJpY1wiLFxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiXG4gICAgfTtcblxuICAgIHRoaXMudGltZU9wdGlvbnMgPSB7XG4gICAgICAgIGhvdXI6IFwiMi1kaWdpdFwiLFxuICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiXG4gICAgfTtcbn1cblxuTGF1bmNoZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxhdW5jaGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmxhdW5jaGVyQ2xpY2suYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLnVwZGF0ZUNsb2NrKCk7XG4gICAgd2luZG93LnNldEludGVydmFsKHRoaXMudXBkYXRlQ2xvY2suYmluZCh0aGlzKSwgMTAwMCk7XG59O1xuXG5MYXVuY2hlci5wcm90b3R5cGUubGF1bmNoZXJDbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIGxldCBpY29uO1xuICAgIGxldCB0aXRsZTtcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5nZXRDbGlja2VkTGF1bmNoZXJFbGVtZW50KGV2ZW50LnRhcmdldCk7XG5cbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGxldCBzd2l0Y2hUbyA9IHZhbHVlLnNwbGl0KFwiOlwiKTtcblxuICAgICAgICBpZiAoc3dpdGNoVG9bMF0gPT09IFwiaWRcIikge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidG9vbHRpcC1jbG9zZVwiKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVza3RvcC5jbG9zZVdpbmRvdyhzd2l0Y2hUb1sxXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVG9XaW5kb3coc3dpdGNoVG9bMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWNvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcImlcIikudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICB0aXRsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLXRpdGxlXCIpLnRleHRDb250ZW50O1xuICAgICAgICAgICAgdGhpcy5zdGFydEFwcCh2YWx1ZSwgaWNvbiwgdGl0bGUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuTGF1bmNoZXIucHJvdG90eXBlLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBsZXQgZWxlbWVudDtcblxuICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcbiAgICAgICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICB9IGVsc2UgaWYgKHRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpKSB7XG4gICAgICAgIGVsZW1lbnQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbn07XG5cbkxhdW5jaGVyLnByb3RvdHlwZS5zdGFydEFwcCA9IGZ1bmN0aW9uKHR5cGUsIGljb24sIHRpdGxlKSB7XG4gICAgbGV0IG1hcmdpblggPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WCk7XG4gICAgbGV0IG1hcmdpblkgPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WSk7XG5cbiAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcbiAgICAgICAgeDogbWFyZ2luWCxcbiAgICAgICAgeTogbWFyZ2luWSxcbiAgICAgICAgdGFiSW5kZXg6IHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXG4gICAgICAgIHpJbmRleDogdGhpcy5kZXNrdG9wLnpJbmRleCxcbiAgICAgICAgaWNvbjogaWNvbixcbiAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICBtYXhpbWl6YWJsZTogZmFsc2UsXG4gICAgICAgIGtleUFjdGl2YXRlZDogZmFsc2VcbiAgICB9O1xuXG4gICAgbGV0IG5ld0FwcCA9IHRoaXMuY3JlYXRlQXBwbGljYXRpb24odHlwZSwgb3B0aW9ucyk7XG5cbiAgICBpZiAobmV3QXBwKSB7XG4gICAgICAgIGxldCBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0FwcC5pZCArIFwiIC53aW5kb3ctYnV0dG9uc1wiKTtcbiAgICAgICAgYnV0dG9ucy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXNrdG9wLmNsaWNrV2luZG93QnRuLmJpbmQodGhpcy5kZXNrdG9wKSk7XG5cbiAgICAgICAgdGhpcy5kZXNrdG9wLndpbmRvd3MucHVzaChuZXdBcHApO1xuXG4gICAgICAgIHRoaXMuYWRkUnVubmluZ0FwcCh0eXBlLCBuZXdBcHApO1xuXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIgKz0gMTtcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggKz0gMTtcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFkgKz0gMTtcblxuICAgICAgICB0aGlzLmRlc2t0b3Auc2V0Rm9jdXMobmV3QXBwLmVsZW1lbnQpO1xuICAgICAgICB0aGlzLmNoZWNrQm91bmRzKG5ld0FwcCk7XG4gICAgfVxufTtcblxuTGF1bmNoZXIucHJvdG90eXBlLmNyZWF0ZUFwcGxpY2F0aW9uID0gZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgIGxldCBuZXdBcHA7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBcImV4YW1wbGVcIjoge1xuICAgICAgICAgICAgb3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBvcHRpb25zLmtleUFjdGl2YXRlZCA9IHRydWU7XG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBcHAob3B0aW9ucyk7XG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJtZW1vcnlcIjoge1xuICAgICAgICAgICAgb3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgbmV3QXBwID0gbmV3IE1lbW9yeShvcHRpb25zKTtcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiY2hhdFwiOiB7XG4gICAgICAgICAgICBvcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBDaGF0QXBwKG9wdGlvbnMpO1xuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJyZW1lbWJlclwiOiB7XG4gICAgICAgICAgICBvcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIG9wdGlvbnMua2V5QWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBOb3RlcyhvcHRpb25zKTtcbiAgICAgICAgICAgIG5ld0FwcC5wcmludCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImluZm9cIjoge1xuICAgICAgICAgICAgb3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgQWJvdXQob3B0aW9ucyk7XG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJyZXNldFwiOiB7XG4gICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xlYXJEZXNrdG9wKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXdBcHA7XG59O1xuXG5MYXVuY2hlci5wcm90b3R5cGUuY2hlY2tCb3VuZHMgPSBmdW5jdGlvbihhcHApIHtcbiAgICBsZXQgd2luV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBsZXQgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgbGV0IGFwcFJpZ2h0ID0gYXBwLnggKyBwYXJzZUludChhcHAuZWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgbGV0IGFwcEJvdHRvbSA9IGFwcC55ICsgcGFyc2VJbnQoYXBwLmVsZW1lbnQub2Zmc2V0SGVpZ2h0KTtcblxuICAgIGlmIChhcHBSaWdodCA+IHdpbldpZHRoIHx8IGFwcC54IDwgMCkge1xuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WCA9IDE7XG4gICAgICAgIGFwcC54ID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFgpO1xuICAgICAgICBhcHAuZWxlbWVudC5zdHlsZS5sZWZ0ID0gYXBwLnggKyBcInB4XCI7XG4gICAgfSBlbHNlIGlmIChhcHBCb3R0b20gPiB3aW5IZWlnaHQgfHwgYXBwLnkgPCAwKSB7XG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRZID0gMTtcbiAgICAgICAgYXBwLnkgPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WSk7XG4gICAgICAgIGFwcC5lbGVtZW50LnN0eWxlLnRvcCA9IGFwcC55ICsgXCJweFwiO1xuICAgIH1cbn07XG5cbkxhdW5jaGVyLnByb3RvdHlwZS5zd2l0Y2hUb1dpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgbGV0IHdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBpZCk7XG5cbiAgICBpZiAod2luZG93KSB7XG4gICAgICAgIGlmICh3aW5kb3cuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWluaW1pemVkXCIpKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlc2t0b3Auc2V0Rm9jdXMod2luZG93KTtcbiAgICB9XG59O1xuXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibGlbdmFsdWU9J1wiICsgdHlwZSArIFwiJ10gLnRvb2x0aXAtY29udGFpbmVyXCIpO1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC10b29sdGlwXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhcHAudGl0bGUgKyBcIihcIiArIGFwcC5pZCArIFwiKVwiKSk7XG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC1jbG9zZVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59O1xuXG5MYXVuY2hlci5wcm90b3R5cGUudXBkYXRlQ2xvY2sgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGF0ZU9iaiA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGRhdGUgPSBkYXRlT2JqLnRvTG9jYWxlRGF0ZVN0cmluZyhcInN2LXNlXCIsIHRoaXMuZGF0ZU9wdGlvbnMpO1xuICAgIGxldCB0aW1lID0gZGF0ZU9iai50b0xvY2FsZVRpbWVTdHJpbmcoXCJzdi1zZVwiLCB0aGlzLnRpbWVPcHRpb25zKTtcblxuICAgIGxldCB0aW1lRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxhdW5jaGVyLWNsb2NrLXRpbWVcIik7XG4gICAgbGV0IGRhdGVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGF1bmNoZXItY2xvY2stZGF0ZVwiKTtcblxuICAgIGxldCB0aW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRpbWUpO1xuICAgIGxldCBkYXRlTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGUpO1xuXG4gICAgdGltZUVsLnJlcGxhY2VDaGlsZCh0aW1lTm9kZSwgdGltZUVsLmZpcnN0Q2hpbGQpO1xuICAgIGRhdGVFbC5yZXBsYWNlQ2hpbGQoZGF0ZU5vZGUsIGRhdGVFbC5maXJzdENoaWxkKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGF1bmNoZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubGV0IEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XG5cbmZ1bmN0aW9uIFJlbWVtYmVyKGlkKSB7XG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbn1cblxuUmVtZW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xuUmVtZW1iZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVtZW1iZXI7XG5cblxuUmVtZW1iZXIucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBSZW1lbWJlckFwcFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCkuY2xhc3NMaXN0LmFkZChcInJlbWVtYmVyLWFwcFwiKTtcblxuICAgIGxldCBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XG4gICAgbGV0IGFsdDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtd2luZG93LW1lbnUtYWx0XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5ldyBOb3RlXCIpKTtcblxuICAgIGxldCBhbHQyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wLXdpbmRvdy1tZW51LWFsdFwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJTZXR0aW5nc1wiKSk7XG5cbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0Mik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbWVtYmVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBEZXNrdG9wID0gcmVxdWlyZShcIi4vRGVza3RvcFwiKTtcblxubGV0IGQgPSBuZXcgRGVza3RvcCgpO1xuZC5pbml0KCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gQ2hhdChlbGVtZW50LCBzZXJ2ZXIsIGNoYW5uZWwsIHVzZXJuYW1lKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsIHx8IFwiXCI7XG4gICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMua2V5ID0gXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiO1xuICAgIHRoaXMub25saW5lID0gZmFsc2U7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuXG4gICAgdGhpcy50aW1lT3B0aW9ucyA9IHtcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsIG1vbnRoOiBcIm51bWVyaWNcIixcbiAgICAgICAgZGF5OiBcIm51bWVyaWNcIiwgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCJcbiAgICB9O1xufVxuXG5DaGF0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmludCgpO1xuXG4gICAgdGhpcy5yZWFkU3RvcmVkTWVzc2FnZXMoKTtcblxuICAgIHRoaXMuY29ubmVjdFRvU2VydmVyKCk7XG5cbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm5ld01lc3NhZ2VGcm9tU2VydmVyLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5mb3JtU3VibWl0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEZpZWxkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLmNoZWNrSW5wdXQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xufTtcblxuQ2hhdC5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtY2hhdC1hcHBcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xuXG4gICAgbGV0IGluZm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtd2luZG93LW1lbnUtaW5mb1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBsZXQgY2hhbm5lbEluZm8gPSBcIlwiO1xuXG4gICAgaWYgKHRoaXMuY2hhbm5lbCA9PT0gXCJcIikge1xuICAgICAgICBjaGFubmVsSW5mbyA9IFwiTm9uLXNwZWNpZmllZFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYW5uZWxJbmZvID0gdGhpcy5jaGFubmVsO1xuICAgIH1cblxuICAgIGxldCBpbmZvTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiI1wiICsgY2hhbm5lbEluZm8uc2xpY2UoMCwgMTgpICsgXCIvXCIgKyB0aGlzLnVzZXJuYW1lLnNsaWNlKDAsIDEwKSk7XG4gICAgaW5mby5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaW5mb1wiKS5hcHBlbmRDaGlsZChpbmZvTm9kZSk7XG5cbiAgICBsZXQgbWVudUluZm8gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWluZm9cIik7XG4gICAgbGV0IG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcbiAgICBpZiAobWVudUluZm8pIHtcbiAgICAgICAgbWVudS5yZXBsYWNlQ2hpbGQoaW5mbywgbWVudUluZm8pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbnUuYXBwZW5kQ2hpbGQoaW5mbyk7XG4gICAgfVxufTtcblxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdFRvU2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtb2ZmbGluZVwiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9cIiArIHRoaXMuc2VydmVyLCBcImNoYXJjb3Jkc1wiKTtcblxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIHRoaXMuc2V0T25saW5lLmJpbmQodGhpcykpO1xuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCB0aGlzLnNldE9mZmxpbmUuYmluZCh0aGlzKSk7XG59O1xuXG5DaGF0LnByb3RvdHlwZS5zZXRPZmZsaW5lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY29ubmVjdGluZ1wiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xuICAgIHRoaXMub25saW5lID0gZmFsc2U7XG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgdXNlcm5hbWU6IFwiT2ZmbGluZU1zZ1wiLFxuICAgICAgICBkYXRhOiBcIldhc24ndCBhYmxlIHRvIGNvbm5lY3QgdG8gc2VydmVyLlwiXG4gICAgfTtcbiAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcbn07XG5cbkNoYXQucHJvdG90eXBlLnNldE9ubGluZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub25saW5lID0gdHJ1ZTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW9uXCIpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9ubGluZVwiKTtcbn07XG5cbkNoYXQucHJvdG90eXBlLm5ld01lc3NhZ2VGcm9tU2VydmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICBpZiAoZGF0YS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xuICAgICAgICBkYXRhLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKFwic3Ytc2VcIiwgdGhpcy50aW1lT3B0aW9ucyk7XG4gICAgICAgIGlmICghZGF0YS5jaGFubmVsKSB7XG4gICAgICAgICAgICBkYXRhLmNoYW5uZWwgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEuY2hhbm5lbCA9PT0gdGhpcy5jaGFubmVsKSB7XG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5ld01lc3NhZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5DaGF0LnByb3RvdHlwZS5mb3JtU3VibWl0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbmxpbmUpIHtcbiAgICAgICAgbGV0IGlucHV0ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRGaWVsZFwiKS52YWx1ZTtcbiAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KGlucHV0Lmxlbmd0aCAtIDEpID09PSAxMCkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgbXNnID0ge1xuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICBcImRhdGFcIjogaW5wdXQsXG4gICAgICAgICAgICAgICAgXCJ1c2VybmFtZVwiOiB0aGlzLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIFwiY2hhbm5lbFwiOiB0aGlzLmNoYW5uZWwsXG4gICAgICAgICAgICAgICAgXCJrZXlcIjogdGhpcy5rZXlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnRuXCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5DaGF0LnByb3RvdHlwZS5wcmludE5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0XCIpO1xuICAgIGxldCBzY3JvbGxlZCA9IGZhbHNlO1xuXG4gICAgaWYgKGNvbnRhaW5lci5zY3JvbGxUb3AgIT09IChjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLm9mZnNldEhlaWdodCkpIHtcbiAgICAgICAgc2Nyb2xsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1jaGF0LW1lc3NhZ2UtbGluZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBsZXQgdXNlcm5hbWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS51c2VybmFtZSArIFwiOiBcIik7XG4gICAgbGV0IG1lc3NhZ2VOb2RlID0gdGhpcy5wYXJzZU1lc3NhZ2UoZGF0YS5kYXRhKTtcblxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlXCIpLmFwcGVuZENoaWxkKG1lc3NhZ2VOb2RlKTtcblxuICAgIGlmIChkYXRhLnRpbWVzdGFtcCkge1xuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saW5lXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIGRhdGEudGltZXN0YW1wKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy51c2VybmFtZSA9PT0gZGF0YS51c2VybmFtZSkge1xuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlLW1lXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJsaVwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1idWJibGVcIik7XG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC11c2VybmFtZVwiKS5hcHBlbmRDaGlsZCh1c2VybmFtZU5vZGUpO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0IHVsXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcblxuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oc2Nyb2xsZWQpO1xufTtcblxuQ2hhdC5wcm90b3R5cGUuc2Nyb2xsVG9Cb3R0b20gPSBmdW5jdGlvbihzY3JvbGxlZCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGlzdFwiKTtcbiAgICBpZiAoIXNjcm9sbGVkKSB7XG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cbn07XG5cbkNoYXQucHJvdG90eXBlLnNhdmVOZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBuZXdNc2cgPSB7XG4gICAgICAgIHVzZXJuYW1lOiBkYXRhLnVzZXJuYW1lLFxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXG4gICAgICAgIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXBcbiAgICB9O1xuICAgIHRoaXMubWVzc2FnZXMucHVzaChuZXdNc2cpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkodGhpcy5tZXNzYWdlcykpO1xufTtcblxuQ2hhdC5wcm90b3R5cGUucmVhZFN0b3JlZE1lc3NhZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCkpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2VzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlcyA9IEpTT04ucGFyc2UobWVzc2FnZXMpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tZXNzYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgdGhpcy5wcmludE5ld01lc3NhZ2UodGhpcy5tZXNzYWdlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgc2VwYXJhdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wLWNoYXQtaGlzdG9yeS1zZXBhcmF0b3JcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGlzdCB1bFwiKS5hcHBlbmRDaGlsZChzZXBhcmF0b3IpO1xuXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkNoYXQucHJvdG90eXBlLnRvZ2dsZUZvY3VzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcbn07XG5cbkNoYXQucHJvdG90eXBlLmNoZWNrSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGxldCBpbnB1dCA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuICAgIGlmIChpbnB1dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ0blwiKS5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdG5cIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcbiAgICB9XG5cbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSA9PT0gMTApIHtcbiAgICAgICAgdGhpcy5mb3JtU3VibWl0KCk7XG4gICAgfVxuXG4gICAgaWYgKGlucHV0LmNoYXJDb2RlQXQoMCkgPT09IDEwKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5yZXNldCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdG5cIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcbiAgICB9XG59O1xuXG5DaGF0LnByb3RvdHlwZS5wYXJzZU1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgbGV0IGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgbGV0IGxpbms7XG4gICAgbGV0IGVtb2ppO1xuICAgIGxldCB0ZXh0Tm9kZTtcblxuICAgIGxldCB3b3JkcyA9IHRleHQuc3BsaXQoXCIgXCIpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAod29yZHNbaV0uc2xpY2UoMCwgNykgPT09IFwiaHR0cDovL1wiKSB7XG4gICAgICAgICAgICBsaW5rID0gd29yZHNbaV0uc2xpY2UoNyk7XG4gICAgICAgICAgICBmcmFnID0gdGhpcy5hZGRMaW5rT3JFbW9qaShmcmFnLCBcImxpbmtcIiwgbGluayk7XG4gICAgICAgIH0gZWxzZSBpZiAod29yZHNbaV0uc2xpY2UoMCwgOCkgPT09IFwiaHR0cHM6Ly9cIikge1xuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xuICAgICAgICAgICAgZnJhZyA9IHRoaXMuYWRkTGlua09yRW1vamkoZnJhZywgXCJsaW5rXCIsIGxpbmspO1xuICAgICAgICB9IGVsc2UgaWYgKHdvcmRzW2ldLmNoYXJBdCgwKSA9PT0gXCI6XCIgfHwgd29yZHNbaV0uY2hhckF0KDApID09PSBcIjtcIikge1xuICAgICAgICAgICAgZW1vamkgPSB3b3Jkc1tpXTtcbiAgICAgICAgICAgIGZyYWcgPSB0aGlzLmFkZExpbmtPckVtb2ppKGZyYWcsIFwiZW1vamlcIiwgZW1vamkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh3b3Jkc1tpXSArIFwiIFwiKTtcbiAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyYWc7XG59O1xuXG5DaGF0LnByb3RvdHlwZS5hZGRMaW5rT3JFbW9qaSA9IGZ1bmN0aW9uKGZyYWcsIHR5cGUsIGRhdGEpIHtcbiAgICBsZXQgdGV4dE5vZGU7XG4gICAgaWYgKHR5cGUgPT09IFwibGlua1wiKSB7XG4gICAgICAgIGxldCBhVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGFUYWcuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIi8vXCIgKyBkYXRhKTtcbiAgICAgICAgYVRhZy5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XG4gICAgICAgIGxldCBsaW5rTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpO1xuXG4gICAgICAgIGFUYWcuYXBwZW5kQ2hpbGQobGlua05vZGUpO1xuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiKTtcblxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGFUYWcpO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZW1vamlcIikge1xuICAgICAgICBsZXQgc3BhblRhZyA9IHRoaXMucGFyc2VFbW9qaShkYXRhKTtcblxuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiKTtcblxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHNwYW5UYWcpO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnJhZztcbn07XG5cbkNoYXQucHJvdG90eXBlLnBhcnNlRW1vamkgPSBmdW5jdGlvbihlbW9qaSkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1jaGF0LWVtb2ppXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGxldCBlbSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuZW1vamlcIik7XG5cbiAgICBzd2l0Y2ggKGVtb2ppKSB7XG4gICAgICAgIGNhc2UgXCI6KVwiOiB7XG4gICAgICAgICAgICBlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktc21pbGV5XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIjpEXCI6IHtcbiAgICAgICAgICAgIGVtLmNsYXNzTGlzdC5hZGQoXCJlbW9qaS1oYXBweVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCI7KVwiOiB7XG4gICAgICAgICAgICBlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktZmxpcnRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiOk9cIjoge1xuICAgICAgICAgICAgZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLXN1cnByaXNlZFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCI6UFwiOiB7XG4gICAgICAgICAgICBlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktdG91bmdlXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIjpAXCI6IHtcbiAgICAgICAgICAgIGVtLmNsYXNzTGlzdC5hZGQoXCJlbW9qaS1hbmdyeVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCI6U1wiOiB7XG4gICAgICAgICAgICBlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktY29uZnVzZWRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiOihcIjoge1xuICAgICAgICAgICAgZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLXNhZFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCI6JyhcIjoge1xuICAgICAgICAgICAgZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLWNyeWluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGVtID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZW1vamkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVtO1xufTtcblxuQ2hhdC5wcm90b3R5cGUuY2xlYXJIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG5cbiAgICBsZXQgbGlzdEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcInVsXCIpO1xuICAgIHdoaWxlIChsaXN0RWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgbGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQobGlzdEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLy4uL0Jhc2ljV2luZG93XCIpO1xubGV0IENoYXQgPSByZXF1aXJlKFwiLi9DaGF0XCIpO1xuXG5mdW5jdGlvbiBDaGF0QXBwKG9wdGlvbnMpIHtcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMuY2hhdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIHRoaXMudXNlcm5hbWUgPSBcIlwiO1xuICAgIHRoaXMuc2VydmVyID0gXCJ2aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIjtcbiAgICB0aGlzLmNoYW5uZWwgPSBcIlwiO1xuXG4gICAgdGhpcy5hZGRGb2N1c0Z1bmMgPSB0aGlzLmFkZEZvY3VzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVGb2N1c0Z1bmMgPSB0aGlzLnJlbW92ZUZvY3VzLmJpbmQodGhpcyk7XG59XG5cbkNoYXRBcHAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xuQ2hhdEFwcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0QXBwO1xuXG5DaGF0QXBwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIikpIHtcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wcmludCgpO1xuXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XG59O1xuXG5DaGF0QXBwLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFwcFwiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xuXG4gICAgbGV0IG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcbiAgICBsZXQgYWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wLXdpbmRvdy1tZW51LWFsdFwiKS5jb250ZW50O1xuXG4gICAgbGV0IGFsdDEgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkNsZWFyIEhpc3RvcnlcIikpO1xuXG4gICAgbGV0IGFsdDIgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGFsdDIucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcblxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0MSk7XG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcblxuICAgIHRoaXMubWVudVNldHRpbmdzKCk7XG59O1xuXG5DaGF0QXBwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY2hhdCkge1xuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XG59O1xuXG5DaGF0QXBwLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IHRhcmdldDtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImNsZWFyIGhpc3RvcnlcIjoge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGF0LmNsZWFySGlzdG9yeSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkNoYXRBcHAucHJvdG90eXBlLm1lbnVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBpO1xuICAgIGxldCBpbnB1dExpc3Q7XG5cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3NPcGVuKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1zZXR0aW5nc1wiKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuYWRkU2V0dGluZ3ModGVtcGxhdGUpO1xuXG4gICAgICAgIGlucHV0TGlzdCA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFt0eXBlPSd0ZXh0J11cIik7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGlucHV0TGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaW5wdXRMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLmFkZEZvY3VzRnVuYyk7XG4gICAgICAgICAgICBpbnB1dExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMucmVtb3ZlRm9jdXNGdW5jKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3Mtd3JhcHBlclwiKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIH1cbn07XG5cbkNoYXRBcHAucHJvdG90eXBlLmFkZFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1jaGF0LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3VzZXJuYW1lJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy51c2VybmFtZSk7XG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMuc2VydmVyKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nY2hhbm5lbCdcIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy5jaGFubmVsKTtcblxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XG5cbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xuICAgIHJldHVybiBlbGVtZW50O1xufTtcblxuQ2hhdEFwcC5wcm90b3R5cGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY2hhdCkge1xuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XG4gICAgICAgIHRoaXMuY2hhdC5vbmxpbmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgZm9ybSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLWZvcm1cIik7XG5cbiAgICB0aGlzLnVzZXJuYW1lID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0ndXNlcm5hbWUnXVwiKS52YWx1ZTtcbiAgICB0aGlzLnNlcnZlciA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnZhbHVlO1xuICAgIHRoaXMuY2hhbm5lbCA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J2NoYW5uZWwnXVwiKS52YWx1ZTtcblxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LW9ubGluZVwiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xuXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcblxuICAgIGlmICh0aGlzLnVzZXJuYW1lID09PSBcIlwiKSB7XG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBcIlVzZXJcIjtcbiAgICB9XG5cbiAgICB0aGlzLmNoYXQgPSBuZXcgQ2hhdCh0aGlzLmVsZW1lbnQsIHRoaXMuc2VydmVyLCB0aGlzLmNoYW5uZWwsIHRoaXMudXNlcm5hbWUpO1xuICAgIHRoaXMuY2hhdC5pbml0KCk7XG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICB0aGlzLnNldEZvY3VzKCk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJuYW1lXCIsIHRoaXMudXNlcm5hbWUpO1xufTtcblxuQ2hhdEFwcC5wcm90b3R5cGUuYWRkRm9jdXMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZvY3VzZWQtd2luZG93XCIpO1xuICAgIH1cbn07XG5cbkNoYXRBcHAucHJvdG90eXBlLnJlbW92ZUZvY3VzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZvY3VzZWQtd2luZG93XCIpO1xuICAgIH1cbn07XG5cbkNoYXRBcHAucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhdEFwcDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBCb2FyZChlbGVtZW50LCB4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLnByaW50Q2FyZHMoKTtcbn1cblxuQm9hcmQucHJvdG90eXBlLnByaW50Q2FyZHMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBsZXQgcm93RGl2O1xuICAgIGxldCBjYXJkRGl2O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xuICAgICAgICByb3dEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICByb3dEaXYuY2xhc3NMaXN0LmFkZChcInJvd1wiKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMueDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjYXJkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGNhcmREaXYuY2xhc3NMaXN0LmFkZChcImNhcmQtXCIgKyBpICsgaiwgXCJjYXJkXCIpO1xuICAgICAgICAgICAgcm93RGl2LmFwcGVuZENoaWxkKGNhcmREaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyb3dEaXYpO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQm9hcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gQ2FyZChpZCwgaW1nTnIpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubGV0IEJvYXJkID0gcmVxdWlyZShcIi4vQm9hcmRcIik7XG5sZXQgQ2FyZCA9IHJlcXVpcmUoXCIuL0NhcmRcIik7XG5sZXQgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcblxuZnVuY3Rpb24gR2FtZShlbGVtZW50LCB4LCB5KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnggPSBwYXJzZUludCh4KTtcbiAgICB0aGlzLnkgPSBwYXJzZUludCh5KTtcbiAgICB0aGlzLmxheW91dCA9IG5ldyBCb2FyZChlbGVtZW50LCB0aGlzLngsIHRoaXMueSk7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XG4gICAgdGhpcy50dXJucyA9IDA7XG4gICAgdGhpcy5jb3JyZWN0Q291bnQgPSAwO1xuICAgIHRoaXMuaW1hZ2VMaXN0ID0gWzAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDddO1xuICAgIHRoaXMuaW1hZ2VzID0gdGhpcy5pbWFnZUxpc3Quc2xpY2UoMCwgKHRoaXMueSAqIHRoaXMueCkpO1xuICAgIHRoaXMuY2xpY2tGdW5jID0gdGhpcy5jbGljay5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigpO1xuICAgIHRoaXMudGltZXIuc3RhcnQoKTtcblxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcblxuICAgIHRoaXMuc2h1ZmZsZUltYWdlcygpO1xuICAgIHRoaXMuYWRkRXZlbnRzKCk7XG59XG5cbkdhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICB0aGlzLmJvYXJkID0gW107XG4gICAgaWYgKHRoaXMueCA+IHRoaXMueSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy54OyBpICs9IDEpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkodGhpcy55KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBBcnJheSh0aGlzLngpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1bal0gPSBuZXcgQ2FyZChcIlwiICsgaSArIGosIHRoaXMuaW1hZ2VzLnBvcCgpKTtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1baiArIDFdID0gbmV3IENhcmQoXCJcIiArIGkgKyAoaiArIDEpLCB0aGlzLmltYWdlcy5wb3AoKSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5HYW1lLnByb3RvdHlwZS5zaHVmZmxlSW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXA7XG4gICAgbGV0IHJhbmQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0ZW1wID0gdGhpcy5pbWFnZXNbaV07XG4gICAgICAgIHJhbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmltYWdlcy5sZW5ndGgpO1xuICAgICAgICB0aGlzLmltYWdlc1tpXSA9IHRoaXMuaW1hZ2VzW3JhbmRdO1xuICAgICAgICB0aGlzLmltYWdlc1tyYW5kXSA9IHRlbXA7XG4gICAgfVxufTtcblxuR2FtZS5wcm90b3R5cGUuYWRkRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrRnVuYyk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tGdW5jKTtcbn07XG5cbkdhbWUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLnR1cm5DYXJkKGV2ZW50LnRhcmdldCk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS50dXJuQ2FyZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoIDwgMiAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJkaXNhYmxlXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImNhcmRcIikpIHtcbiAgICAgICAgICAgIGxldCB5eCA9IGVsZW1lbnQuY2xhc3NMaXN0WzBdLnNwbGl0KFwiLVwiKVsxXTtcbiAgICAgICAgICAgIGxldCB5ID0geXguY2hhckF0KDApO1xuICAgICAgICAgICAgbGV0IHggPSB5eC5jaGFyQXQoMSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImltZy1cIiArIHRoaXMuYm9hcmRbeV1beF0uaW1nTnIpO1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaW1nXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xuXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy5ib2FyZFt5XVt4XS5pZCkuY2xhc3NMaXN0LmFkZChcImRpc2FibGVcIik7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5HYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHVybnMgKz0gMTtcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHNbMF0uaW1nTnIgPT09IHRoaXMudmlzaWJsZUNhcmRzWzFdLmltZ05yKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1swXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbMV0uaWQpLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcblxuICAgICAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XG5cbiAgICAgICAgaWYgKHRoaXMuY29ycmVjdENvdW50ID09PSAodGhpcy54ICogdGhpcy55IC8gMikpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbaV0uaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dCh0aGlzLnR1cm5CYWNrQ2FyZHMuYmluZCh0aGlzKSwgMTAwMCk7XG4gICAgfVxufTtcblxuR2FtZS5wcm90b3R5cGUudHVybkJhY2tDYXJkcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wQ2FyZDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRlbXBDYXJkID0gdGhpcy52aXNpYmxlQ2FyZHNbaV07XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0ZW1wQ2FyZC5pZCkuY2xhc3NMaXN0LnJlbW92ZShcIndyb25nXCIsIFwiaW1nXCIsIFwiaW1nLVwiICsgdGVtcENhcmQuaW1nTnIpO1xuICAgIH1cblxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XG59O1xuXG5cbkdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtbWVtb3J5LWdhbWVvdmVyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIubWVtb3J5LXR1cm5zXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudHVybnMpKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10aW1lXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudG90YWxUaW1lKSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLy4uL0Jhc2ljV2luZG93XCIpO1xubGV0IE1lbW9yeUdhbWUgPSByZXF1aXJlKFwiLi9HYW1lXCIpO1xuXG5mdW5jdGlvbiBNZW1vcnkob3B0aW9ucykge1xuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuZ2FtZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmJvYXJkU2l6ZSA9IFs0LCA0XTtcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB1bmRlZmluZWQ7XG59XG5cbk1lbW9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xuXG5NZW1vcnkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnByaW50KCk7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmdhbWUgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgNCwgNCk7XG4gICAgdGhpcy5nYW1lLmluaXQoKTtcbn07XG5cbk1lbW9yeS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XG5cbiAgICBsZXQgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xuICAgIGxldCBhbHQxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wLXdpbmRvdy1tZW51LWFsdFwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOZXcgR2FtZVwiKSk7XG5cbiAgICBsZXQgYWx0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC13aW5kb3ctbWVudS1hbHRcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgYWx0Mi5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0XCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiU2V0dGluZ3NcIikpO1xuXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDIpO1xufTtcblxuTWVtb3J5LnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IHRhcmdldDtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgICAgICAvL29wZW4gdGhlIHNldHRpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBcIm5ldyBnYW1lXCI6IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5nc09wZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIHRoZSBzZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vcmVzdGFydCBuZXcgZ2FtZVxuICAgICAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuTWVtb3J5LnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5ib2FyZFNpemUgPSB2YWx1ZS5zcGxpdChcInhcIik7XG4gICAgfVxuXG4gICAgbGV0IHkgPSB0aGlzLmJvYXJkU2l6ZVsxXTtcbiAgICBsZXQgeCA9IHRoaXMuYm9hcmRTaXplWzBdO1xuXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcblxuICAgIHRoaXMuZ2FtZS5yZW1vdmVFdmVudHMoKTtcblxuICAgIC8vY3JlYXRlIG5ldyBnYW1lIGFuZCBpbml0IGl0XG4gICAgdGhpcy5nYW1lID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIHgsIHkpO1xuICAgIHRoaXMuZ2FtZS5pbml0KCk7XG59O1xuXG5cbk1lbW9yeS5wcm90b3R5cGUubWVudVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xuICAgICAgICAvL3Nob3cgdGhlIHNldHRpbmdzXG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXNldHRpbmdzXCIpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gdGhpcy5hZGRTZXR0aW5ncyh0ZW1wbGF0ZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy9oaWRlIHRoZSBzZXR0aW5nc1xuICAgICAgICBsZXQgc2V0dGluZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy13cmFwcGVyXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5yZW1vdmVDaGlsZChzZXR0aW5ncyk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgfVxufTtcblxuTWVtb3J5LnByb3RvdHlwZS5hZGRTZXR0aW5ncyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtbWVtb3J5LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59O1xuXG5NZW1vcnkucHJvdG90eXBlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwic2VsZWN0W25hbWU9J2JvYXJkLXNpemUnXVwiKS52YWx1ZTtcblxuICAgIHRoaXMucmVzdGFydCh2YWx1ZSk7XG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbn07XG5cbk1lbW9yeS5wcm90b3R5cGUua2V5SW5wdXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIXRoaXMubWFya2VkQ2FyZCkge1xuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LmFkZChcIm1hcmtlZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgMzk6IHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleVJpZ2h0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgMzc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleUxlZnQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSAzODoge1xuICAgICAgICAgICAgICAgIHRoaXMua2V5VXAoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSA0MDoge1xuICAgICAgICAgICAgICAgIHRoaXMua2V5RG93bigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIDEzOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnR1cm5DYXJkKHRoaXMubWFya2VkQ2FyZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcbiAgICB9XG59O1xuXG5NZW1vcnkucHJvdG90eXBlLmtleVJpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZy5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmRcIik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5NZW1vcnkucHJvdG90eXBlLmtleUxlZnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZy5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHJvd3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yb3dcIik7XG4gICAgICAgICAgICB2YXIgbGFzdFJvdyA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IGxhc3RSb3cubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk1lbW9yeS5wcm90b3R5cGUua2V5VXAgPSBmdW5jdGlvbigpIHtcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcbiAgICBsZXQgcm93O1xuICAgIGxldCByb3dZO1xuXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgbGV0IGlkID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMik7XG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpIC0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCByb3dzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucm93XCIpO1xuICAgICAgICByb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHJvd1kgPSByb3dzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgbGV0IGNhcmRYID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMSk7XG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHJvd1kgKyBjYXJkWCk7XG59O1xuXG5NZW1vcnkucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcm93WTtcblxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgbGV0IGlkID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMik7XG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpICsgMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJvd1kgPSAwO1xuICAgIH1cblxuICAgIGxldCBjYXJkWCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTEpO1xuICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyByb3dZICsgY2FyZFgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gVGltZXIoKSB7XG4gICAgdGhpcy5zdGFydFRpbWUgPSB1bmRlZmluZWQ7XG59XG5cblRpbWVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59O1xuXG5UaW1lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHJldHVybiAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcbn07XG5cblRpbWVyLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpLCB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZikpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XG4iXX0=
