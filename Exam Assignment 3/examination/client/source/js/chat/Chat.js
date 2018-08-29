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
