(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Function to handle requests via XMLHttpRequest
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * @param config {object} - object with method and url
 * @param callback {function} - function to call when responding
 *
 */

function request(config, callback) {

    var req = new XMLHttpRequest();

    /**
     * first add event listener for response.
     * if you get error, call with error code
     * callback function with responseText = Returns a DOMString that contains the response to the request as text, or null if the request was unsuccessful or has not yet been sent.
     */

    req.addEventListener("load", function() {
        if (req.status >= 400) {
            callback(req.status);
        }

        callback(null, req.responseText);
    });

    /**
     * open a request from the config
     */

    req.open(config.method, config.url);

    /**
     * if config has data, send data as JSON to server.
     * else send the request.
     */

    if (config.data) {
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(config.data));
    } else {
        req.send(null);
    }
}

module.exports.request = request;

},{}],2:[function(require,module,exports){
"use strict";

/**
 * Highscore constructor
 * @param nickname {string}
 * @param score {string}
 * @constructor
 */

function Highscore(nickname, score) {
    this.nickname = nickname;
    this.score = score;
    this.highscore = [];

    this.readFromFile();
}

/**
 * Function to read highscore-file from local storage
 */

Highscore.prototype.readFromFile = function() {
    var hsFile = localStorage.getItem("hs");

    if (hsFile) {
        var json = JSON.parse(hsFile);

        for (var nickname in json) {
            if (json.hasOwnProperty(nickname)) {
                this.highscore.push(json[nickname]);
            }
        }
    }
};

/**
 * Function to check if the new score is high enough for highscore list
 * @returns {boolean}
 */

Highscore.prototype.isHigh = function() {
    var isHigh = false;

    if (this.highscore.length === 0) {
        isHigh = true;
    } else {
        var lastScore = this.highscore[this.highscore.length - 1].score;
        if (this.score < lastScore || this.highscore.length < 5) {
            isHigh = true;
        }
    }

    return isHigh;
};

/**
 * Function to add the new highscore to the highscore list
 * @returns {boolean}
 */

Highscore.prototype.addToList = function() {
    var add = false;

    if (this.isHigh()) {
        var thisScore = {
            nickname: this.nickname,
            score: this.score
        };

        if (this.highscore.length === 5) {
            this.highscore.splice(-1, 1);
        }

        this.highscore.push(thisScore);
        this.highscore = this.highscore.sort(function(a, b) {
            return a.score - b.score;
        });

        this.saveToFile();

        add = true;
    }

    return add;
};

/**
 * Function to save the highscore to local storage
 */

Highscore.prototype.saveToFile = function() {
    localStorage.setItem("hs", JSON.stringify(this.highscore));
};

/**
 * Function to get the highscoreFragment for user to view
 * @returns {DocumentFragment}
 */

Highscore.prototype.createHighscoreFragment = function() {
    var frag = document.createDocumentFragment();
    var template;
    var hsNickname;
    var hsScore;

    for (var i = 0; i < this.highscore.length; i += 1) {
        template = document.querySelector("#temp-highscoreList").content.cloneNode(true);
        hsNickname = template.querySelector(".hs-nickname");
        hsScore = template.querySelector(".hs-score");

        hsNickname.appendChild(document.createTextNode(this.highscore[i].nickname));
        hsScore.appendChild(document.createTextNode(this.highscore[i].score));

        frag.appendChild(template);
    }

    return frag;
};

module.exports = Highscore;

},{}],3:[function(require,module,exports){
"use strict";

/**
 * Question constructor
 * @param obj {Object}
 * @constructor
 */

function Question(obj) {
    this.id = obj.id;
    this.question = obj.question;
    this.alt = obj.alternatives;
}

/**
 * Function to print out the question
 */

Question.prototype.print = function() {
    if (this.alt) {
        this.printAltQuestion();
    } else {
        this.printQuestion();
    }

    document.querySelector("input").focus();
};

/**
 * Function to clear specific div
 * @param div
 */

Question.prototype.clearDiv = function(div) {
    while (div.hasChildNodes()) {
        div.removeChild(div.lastChild);
    }
};

/**
 * Function to present question with alternatives
 */

Question.prototype.printAltQuestion = function() {
    var template = document.querySelector("#temp-questionAlt").content.cloneNode(true);
    template.querySelector(".quizHead").appendChild(document.createTextNode(this.question));

    var inputFrag = this.getAltFrag();
    template.querySelector("#quizForm").insertBefore(inputFrag, template.querySelector("#submit"));
    document.querySelector("#content").appendChild(template);
};

/**
 * Function to handle the alternatives
 * @returns {DocumentFragment}
 */

Question.prototype.getAltFrag = function() {
    var inputFrag = document.createDocumentFragment();
    var input;
    var label;
    var first = true;

    for (var alt in this.alt) {
        if (this.alt.hasOwnProperty(alt)) {
            input = document.querySelector("#temp-alternative").content.cloneNode(true);

            if (first) {
                input.querySelector("input").setAttribute("checked", "checked");
                first = false;
            }
            input.querySelector("input").setAttribute("value", alt);
            label = input.querySelector("label");
            label.appendChild(document.createTextNode(this.alt[alt]));

            inputFrag.appendChild(input);
        }
    }

    return inputFrag;
};

/**
 * Function to present a question without alternatives
 */

Question.prototype.printQuestion = function() {
    var template = document.querySelector("#temp-question").content.cloneNode(true);
    template.querySelector(".quizHead").appendChild(document.createTextNode(this.question));
    document.querySelector("#content").appendChild(template);
};

module.exports = Question;

},{}],4:[function(require,module,exports){
"use strict";

var Question = require("./Question");
var Ajax = require("./Ajax");
var Timer = require("./Timer");
var Highscore = require("./Highscore");

/**
 * Quiz constructor
 * @param nickname {string}
 * @constructor
 */

function Quiz(nickname) {
    this.nickname = nickname;
    this.question = undefined;
    this.button = undefined;
    this.form = undefined;
    this.timer = undefined;
    this.totalTime = 0;

    this.nextURL = "http://vhost3.lnu.se:20080/question/1";

    this.getQuestion();
}

/**
 * Function to request a new question
 */

Quiz.prototype.getQuestion = function() {
    var config = {
        method: "GET",
        url: this.nextURL
    };

    var responseFunction = this.response.bind(this);

    Ajax.request(config, responseFunction);
};

/**
 * Function to handle response
 * @param error {Number}
 * @param response {string}
 */

Quiz.prototype.response = function(error, response) {
    if (error) {
        this.gameOver();
    }

    if (response) {
        var obj = JSON.parse(response);
        this.nextURL = obj.nextURL;

        if (obj.question) {
            this.responseQuestion(obj);
        } else {
            if (this.nextURL || obj.message === "Correct answer!") {
                this.responseAnswer(obj);
            }
        }
    }
};

/**
 * Function to handle if the response is a question
 * @param obj {Object}
 */

Quiz.prototype.responseQuestion = function(obj) {
    var content = document.querySelector("#content");
    this.clearDiv(content);

    this.question = new Question(obj);
    this.question.print();

    this.timer = new Timer(this, document.querySelector("#timer h1"), 20);
    this.timer.start();

    this.addListener();
};

/**
 * Function to handle if the response is an answer
 * @param obj {Object}
 */

Quiz.prototype.responseAnswer = function(obj) {
    var content = document.querySelector("#content");
    this.clearDiv(content);

    var template = document.querySelector("#temp-answer").content.cloneNode(true);
    var text = document.createTextNode(obj.message);

    template.querySelector("p").appendChild(text);

    content.appendChild(template);

    if (this.nextURL) {
        var newQuestion = this.getQuestion.bind(this);
        setTimeout(newQuestion, 1000);
    } else {
        this.gameFinished();
    }
};

/**
 * Function to add listener for the submit button
 */

Quiz.prototype.addListener = function() {
    this.button = document.querySelector("#submit");
    this.form = document.querySelector("#quizForm");

    this.button.addEventListener("click", this.submit.bind(this), true);
    this.form.addEventListener("keypress", this.submit.bind(this), true);
};

/**
 * Function to handle submit and keypress
 * @param event {Object}
 */

Quiz.prototype.submit = function(event) {
    if (event.which === 13 || event.keyCode === 13 || event.type === "click") {
        event.preventDefault();

        this.totalTime += this.timer.stop();

        var input;

        this.button.removeEventListener("click", this.submit.bind(this));
        this.form.removeEventListener("keypress", this.submit.bind(this));

        if (document.querySelector("#answer")) {
            input = document.querySelector("#answer").value;
        } else {
            input = document.querySelector("input[name='alternative']:checked").value;
        }

        var config = {
            method: "POST",
            url: this.nextURL,
            data: {
                answer: input
            }
        };

        var responseFunction = this.response.bind(this);
        Ajax.request(config, responseFunction);
    }
};

/**
 * Function to handle when the quiz is over because of wrong answer or out of time
 * @param cause
 */

Quiz.prototype.gameOver = function(cause) {
    var hs = new Highscore(this.nickname, this.totalTime.toFixed(1));
    this.clearDiv(document.querySelector("#content"));

    var template = document.querySelector("#temp-gameOver").content.cloneNode(true);

    var title;
    if (cause === "time") {
        title = document.createTextNode("You ran out of time!");
    } else {
        title = document.createTextNode("Wrong answer!");
    }

    template.querySelector("h1").appendChild(title);

    if (hs.highscore.length > 0) {
        template.querySelector("h2").appendChild(document.createTextNode("Previous highscore:"));
        var hsFrag = hs.createHighscoreFragment();
        template.querySelector("table").appendChild(hsFrag);
    }

    document.querySelector("#content").appendChild(template);
};

/**
 * Function to handle when quiz is finished
 */

Quiz.prototype.gameFinished = function() {
    var hs = new Highscore(this.nickname, this.totalTime.toFixed(1));
    var template = document.querySelector("#temp-quizFinished").content.cloneNode(true);

    if (hs.highscore.length > 0) {
        template.querySelector(".hs-title").appendChild(document.createTextNode("Previous highscore:"));
        var hsFrag = hs.createHighscoreFragment();
        template.querySelector("table").appendChild(hsFrag);
    }

    if (hs.addToList()) {
        var newHS = document.createElement("h1");
        newHS.appendChild(document.createTextNode("New Highscore"));
        var div = template.querySelector("div");
        div.insertBefore(newHS, div.firstChild);
    }

    this.clearDiv(document.querySelector("#content"));

    var h3 = template.querySelector(".time");
    var text = document.createTextNode(this.totalTime.toFixed(1));
    h3.appendChild(text);

    document.querySelector("#content").appendChild(template);
};

/**
 * Function to clear specific div
 * @param div {Object}
 */

Quiz.prototype.clearDiv = function(div) {
    while (div.hasChildNodes()) {
        div.removeChild(div.lastChild);
    }
};

module.exports = Quiz;

},{"./Ajax":1,"./Highscore":2,"./Question":3,"./Timer":5}],5:[function(require,module,exports){
"use strict";

/**
 * Timer constructor
 * @param owner {Object} - owner object that created timer
 * @param element {Object} - element to print timer
 * @param time {Number} - time to count down
 * @constructor
 */

function Timer(owner, element, time) {
    this.owner = owner;
    this.time = time;
    this.element = element;
    this.startTime = new Date().getTime();
    this.interval = undefined;
}

/**
 * Function that starts the timer with an interval
 */

Timer.prototype.start = function() {
    this.interval = setInterval(this.run.bind(this), 100);
};

/**
 * Function to be executed each interval
 */

Timer.prototype.run = function() {
    var now = new Date().getTime();

    var diff = (now - this.startTime) / 1000;

    var showTime = this.time - diff;

    if (diff >= this.time) {
        showTime = 0;
        clearInterval(this.interval);
        this.owner.gameOver("time");
    }

    if (showTime <= 10) {
        this.print(showTime.toFixed(1));
    } else {
        this.print(showTime.toFixed(0));
    }
};

/**
 * Function that stops timer before it's finished
 * @returns {number}
 */

Timer.prototype.stop = function() {
    clearInterval(this.interval);
    var now = new Date().getTime();

    return (now - this.startTime) / 1000;
};

/**
 * Function to print the timer
 * @param diff
 */

Timer.prototype.print = function(diff) {
    this.element.replaceChild(document.createTextNode(diff), this.element.firstChild);
};

module.exports = Timer;

},{}],6:[function(require,module,exports){
"use strict";

var Quiz = require("./Quiz");

var q;

/**
 * Function to handle submit for nickname and starting the quiz
 * @param event
 */

function submit(event) {
    if (event.which === 13 || event.keyCode === 13 || event.type === "click") {
        event.preventDefault();

        var input = document.querySelector("#nickname").value;

        if (input.length > 1) {
            q = new Quiz(input);
        }
    }
}

var button = document.querySelector("#submit");
var form = document.querySelector("#quizForm");

button.addEventListener("click", submit, true);
form.addEventListener("keypress", submit, true);

document.querySelector("input").focus();

},{"./Quiz":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvSGlnaHNjb3JlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9RdWVzdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvVGltZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgcmVxdWVzdHMgdmlhIFhNTEh0dHBSZXF1ZXN0XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvWE1MSHR0cFJlcXVlc3RcbiAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBvYmplY3Qgd2l0aCBtZXRob2QgYW5kIHVybFxuICogQHBhcmFtIGNhbGxiYWNrIHtmdW5jdGlvbn0gLSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gcmVzcG9uZGluZ1xuICpcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcblxuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8qKlxuICAgICAqIGZpcnN0IGFkZCBldmVudCBsaXN0ZW5lciBmb3IgcmVzcG9uc2UuXG4gICAgICogaWYgeW91IGdldCBlcnJvciwgY2FsbCB3aXRoIGVycm9yIGNvZGVcbiAgICAgKiBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIHJlc3BvbnNlVGV4dCA9IFJldHVybnMgYSBET01TdHJpbmcgdGhhdCBjb250YWlucyB0aGUgcmVzcG9uc2UgdG8gdGhlIHJlcXVlc3QgYXMgdGV4dCwgb3IgbnVsbCBpZiB0aGUgcmVxdWVzdCB3YXMgdW5zdWNjZXNzZnVsIG9yIGhhcyBub3QgeWV0IGJlZW4gc2VudC5cbiAgICAgKi9cblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogb3BlbiBhIHJlcXVlc3QgZnJvbSB0aGUgY29uZmlnXG4gICAgICovXG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcblxuICAgIC8qKlxuICAgICAqIGlmIGNvbmZpZyBoYXMgZGF0YSwgc2VuZCBkYXRhIGFzIEpTT04gdG8gc2VydmVyLlxuICAgICAqIGVsc2Ugc2VuZCB0aGUgcmVxdWVzdC5cbiAgICAgKi9cblxuICAgIGlmIChjb25maWcuZGF0YSkge1xuICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgIHJlcS5zZW5kKEpTT04uc3RyaW5naWZ5KGNvbmZpZy5kYXRhKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVxLnNlbmQobnVsbCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEhpZ2hzY29yZSBjb25zdHJ1Y3RvclxuICogQHBhcmFtIG5pY2tuYW1lIHtzdHJpbmd9XG4gKiBAcGFyYW0gc2NvcmUge3N0cmluZ31cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5cbmZ1bmN0aW9uIEhpZ2hzY29yZShuaWNrbmFtZSwgc2NvcmUpIHtcbiAgICB0aGlzLm5pY2tuYW1lID0gbmlja25hbWU7XG4gICAgdGhpcy5zY29yZSA9IHNjb3JlO1xuICAgIHRoaXMuaGlnaHNjb3JlID0gW107XG5cbiAgICB0aGlzLnJlYWRGcm9tRmlsZSgpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlYWQgaGlnaHNjb3JlLWZpbGUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gKi9cblxuSGlnaHNjb3JlLnByb3RvdHlwZS5yZWFkRnJvbUZpbGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaHNGaWxlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoc1wiKTtcblxuICAgIGlmIChoc0ZpbGUpIHtcbiAgICAgICAgdmFyIGpzb24gPSBKU09OLnBhcnNlKGhzRmlsZSk7XG5cbiAgICAgICAgZm9yICh2YXIgbmlja25hbWUgaW4ganNvbikge1xuICAgICAgICAgICAgaWYgKGpzb24uaGFzT3duUHJvcGVydHkobmlja25hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmUucHVzaChqc29uW25pY2tuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBuZXcgc2NvcmUgaXMgaGlnaCBlbm91Z2ggZm9yIGhpZ2hzY29yZSBsaXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuXG5IaWdoc2NvcmUucHJvdG90eXBlLmlzSGlnaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpc0hpZ2ggPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLmhpZ2hzY29yZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaXNIaWdoID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGFzdFNjb3JlID0gdGhpcy5oaWdoc2NvcmVbdGhpcy5oaWdoc2NvcmUubGVuZ3RoIC0gMV0uc2NvcmU7XG4gICAgICAgIGlmICh0aGlzLnNjb3JlIDwgbGFzdFNjb3JlIHx8IHRoaXMuaGlnaHNjb3JlLmxlbmd0aCA8IDUpIHtcbiAgICAgICAgICAgIGlzSGlnaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXNIaWdoO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhZGQgdGhlIG5ldyBoaWdoc2NvcmUgdG8gdGhlIGhpZ2hzY29yZSBsaXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuXG5IaWdoc2NvcmUucHJvdG90eXBlLmFkZFRvTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhZGQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLmlzSGlnaCgpKSB7XG4gICAgICAgIHZhciB0aGlzU2NvcmUgPSB7XG4gICAgICAgICAgICBuaWNrbmFtZTogdGhpcy5uaWNrbmFtZSxcbiAgICAgICAgICAgIHNjb3JlOiB0aGlzLnNjb3JlXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuaGlnaHNjb3JlLmxlbmd0aCA9PT0gNSkge1xuICAgICAgICAgICAgdGhpcy5oaWdoc2NvcmUuc3BsaWNlKC0xLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGlnaHNjb3JlLnB1c2godGhpc1Njb3JlKTtcbiAgICAgICAgdGhpcy5oaWdoc2NvcmUgPSB0aGlzLmhpZ2hzY29yZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnNjb3JlIC0gYi5zY29yZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zYXZlVG9GaWxlKCk7XG5cbiAgICAgICAgYWRkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRkO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIHRoZSBoaWdoc2NvcmUgdG8gbG9jYWwgc3RvcmFnZVxuICovXG5cbkhpZ2hzY29yZS5wcm90b3R5cGUuc2F2ZVRvRmlsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaHNcIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5oaWdoc2NvcmUpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBoaWdoc2NvcmVGcmFnbWVudCBmb3IgdXNlciB0byB2aWV3XG4gKiBAcmV0dXJucyB7RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5IaWdoc2NvcmUucHJvdG90eXBlLmNyZWF0ZUhpZ2hzY29yZUZyYWdtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBoc05pY2tuYW1lO1xuICAgIHZhciBoc1Njb3JlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhpZ2hzY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1oaWdoc2NvcmVMaXN0XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBoc05pY2tuYW1lID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5ocy1uaWNrbmFtZVwiKTtcbiAgICAgICAgaHNTY29yZSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuaHMtc2NvcmVcIik7XG5cbiAgICAgICAgaHNOaWNrbmFtZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmhpZ2hzY29yZVtpXS5uaWNrbmFtZSkpO1xuICAgICAgICBoc1Njb3JlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuaGlnaHNjb3JlW2ldLnNjb3JlKSk7XG5cbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyYWc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hzY29yZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFF1ZXN0aW9uIGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0gb2JqIHtPYmplY3R9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBRdWVzdGlvbihvYmopIHtcbiAgICB0aGlzLmlkID0gb2JqLmlkO1xuICAgIHRoaXMucXVlc3Rpb24gPSBvYmoucXVlc3Rpb247XG4gICAgdGhpcy5hbHQgPSBvYmouYWx0ZXJuYXRpdmVzO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHByaW50IG91dCB0aGUgcXVlc3Rpb25cbiAqL1xuXG5RdWVzdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5hbHQpIHtcbiAgICAgICAgdGhpcy5wcmludEFsdFF1ZXN0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcmludFF1ZXN0aW9uKCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0XCIpLmZvY3VzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIHNwZWNpZmljIGRpdlxuICogQHBhcmFtIGRpdlxuICovXG5cblF1ZXN0aW9uLnByb3RvdHlwZS5jbGVhckRpdiA9IGZ1bmN0aW9uKGRpdikge1xuICAgIHdoaWxlIChkaXYuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChkaXYubGFzdENoaWxkKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHByZXNlbnQgcXVlc3Rpb24gd2l0aCBhbHRlcm5hdGl2ZXNcbiAqL1xuXG5RdWVzdGlvbi5wcm90b3R5cGUucHJpbnRBbHRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1xdWVzdGlvbkFsdFwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnF1aXpIZWFkXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMucXVlc3Rpb24pKTtcblxuICAgIHZhciBpbnB1dEZyYWcgPSB0aGlzLmdldEFsdEZyYWcoKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiI3F1aXpGb3JtXCIpLmluc2VydEJlZm9yZShpbnB1dEZyYWcsIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIjc3VibWl0XCIpKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGFsdGVybmF0aXZlc1xuICogQHJldHVybnMge0RvY3VtZW50RnJhZ21lbnR9XG4gKi9cblxuUXVlc3Rpb24ucHJvdG90eXBlLmdldEFsdEZyYWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5wdXRGcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHZhciBpbnB1dDtcbiAgICB2YXIgbGFiZWw7XG4gICAgdmFyIGZpcnN0ID0gdHJ1ZTtcblxuICAgIGZvciAodmFyIGFsdCBpbiB0aGlzLmFsdCkge1xuICAgICAgICBpZiAodGhpcy5hbHQuaGFzT3duUHJvcGVydHkoYWx0KSkge1xuICAgICAgICAgICAgaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGlucHV0LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKS5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5wdXQucXVlcnlTZWxlY3RvcihcImlucHV0XCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGFsdCk7XG4gICAgICAgICAgICBsYWJlbCA9IGlucHV0LnF1ZXJ5U2VsZWN0b3IoXCJsYWJlbFwiKTtcbiAgICAgICAgICAgIGxhYmVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuYWx0W2FsdF0pKTtcblxuICAgICAgICAgICAgaW5wdXRGcmFnLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnB1dEZyYWc7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHByZXNlbnQgYSBxdWVzdGlvbiB3aXRob3V0IGFsdGVybmF0aXZlc1xuICovXG5cblF1ZXN0aW9uLnByb3RvdHlwZS5wcmludFF1ZXN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wLXF1ZXN0aW9uXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIucXVpekhlYWRcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5xdWVzdGlvbikpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXN0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRdWVzdGlvbiA9IHJlcXVpcmUoXCIuL1F1ZXN0aW9uXCIpO1xudmFyIEFqYXggPSByZXF1aXJlKFwiLi9BamF4XCIpO1xudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XG52YXIgSGlnaHNjb3JlID0gcmVxdWlyZShcIi4vSGlnaHNjb3JlXCIpO1xuXG4vKipcbiAqIFF1aXogY29uc3RydWN0b3JcbiAqIEBwYXJhbSBuaWNrbmFtZSB7c3RyaW5nfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cblxuZnVuY3Rpb24gUXVpeihuaWNrbmFtZSkge1xuICAgIHRoaXMubmlja25hbWUgPSBuaWNrbmFtZTtcbiAgICB0aGlzLnF1ZXN0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuYnV0dG9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZm9ybSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudG90YWxUaW1lID0gMDtcblxuICAgIHRoaXMubmV4dFVSTCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xuXG4gICAgdGhpcy5nZXRRdWVzdGlvbigpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlcXVlc3QgYSBuZXcgcXVlc3Rpb25cbiAqL1xuXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiB0aGlzLm5leHRVUkxcbiAgICB9O1xuXG4gICAgdmFyIHJlc3BvbnNlRnVuY3Rpb24gPSB0aGlzLnJlc3BvbnNlLmJpbmQodGhpcyk7XG5cbiAgICBBamF4LnJlcXVlc3QoY29uZmlnLCByZXNwb25zZUZ1bmN0aW9uKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHJlc3BvbnNlXG4gKiBAcGFyYW0gZXJyb3Ige051bWJlcn1cbiAqIEBwYXJhbSByZXNwb25zZSB7c3RyaW5nfVxuICovXG5cblF1aXoucHJvdG90eXBlLnJlc3BvbnNlID0gZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgdmFyIG9iaiA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICB0aGlzLm5leHRVUkwgPSBvYmoubmV4dFVSTDtcblxuICAgICAgICBpZiAob2JqLnF1ZXN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlUXVlc3Rpb24ob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5leHRVUkwgfHwgb2JqLm1lc3NhZ2UgPT09IFwiQ29ycmVjdCBhbnN3ZXIhXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlQW5zd2VyKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiB0aGUgcmVzcG9uc2UgaXMgYSBxdWVzdGlvblxuICogQHBhcmFtIG9iaiB7T2JqZWN0fVxuICovXG5cblF1aXoucHJvdG90eXBlLnJlc3BvbnNlUXVlc3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudFwiKTtcbiAgICB0aGlzLmNsZWFyRGl2KGNvbnRlbnQpO1xuXG4gICAgdGhpcy5xdWVzdGlvbiA9IG5ldyBRdWVzdGlvbihvYmopO1xuICAgIHRoaXMucXVlc3Rpb24ucHJpbnQoKTtcblxuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIodGhpcywgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lciBoMVwiKSwgMjApO1xuICAgIHRoaXMudGltZXIuc3RhcnQoKTtcblxuICAgIHRoaXMuYWRkTGlzdGVuZXIoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIHRoZSByZXNwb25zZSBpcyBhbiBhbnN3ZXJcbiAqIEBwYXJhbSBvYmoge09iamVjdH1cbiAqL1xuXG5RdWl6LnByb3RvdHlwZS5yZXNwb25zZUFuc3dlciA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjb250ZW50XCIpO1xuICAgIHRoaXMuY2xlYXJEaXYoY29udGVudCk7XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtYW5zd2VyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUob2JqLm1lc3NhZ2UpO1xuXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcInBcIikuYXBwZW5kQ2hpbGQodGV4dCk7XG5cbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcblxuICAgIGlmICh0aGlzLm5leHRVUkwpIHtcbiAgICAgICAgdmFyIG5ld1F1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbi5iaW5kKHRoaXMpO1xuICAgICAgICBzZXRUaW1lb3V0KG5ld1F1ZXN0aW9uLCAxMDAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdhbWVGaW5pc2hlZCgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYWRkIGxpc3RlbmVyIGZvciB0aGUgc3VibWl0IGJ1dHRvblxuICovXG5cblF1aXoucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5idXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Ym1pdFwiKTtcbiAgICB0aGlzLmZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1aXpGb3JtXCIpO1xuXG4gICAgdGhpcy5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc3VibWl0LmJpbmQodGhpcyksIHRydWUpO1xuICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgdGhpcy5zdWJtaXQuYmluZCh0aGlzKSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBzdWJtaXQgYW5kIGtleXByZXNzXG4gKiBAcGFyYW0gZXZlbnQge09iamVjdH1cbiAqL1xuXG5RdWl6LnByb3RvdHlwZS5zdWJtaXQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChldmVudC53aGljaCA9PT0gMTMgfHwgZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQudHlwZSA9PT0gXCJjbGlja1wiKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy50b3RhbFRpbWUgKz0gdGhpcy50aW1lci5zdG9wKCk7XG5cbiAgICAgICAgdmFyIGlucHV0O1xuXG4gICAgICAgIHRoaXMuYnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5mb3JtLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbnN3ZXJcIikpIHtcbiAgICAgICAgICAgIGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbnN3ZXJcIikudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdhbHRlcm5hdGl2ZSddOmNoZWNrZWRcIikudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogdGhpcy5uZXh0VVJMLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGFuc3dlcjogaW5wdXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmVzcG9uc2VGdW5jdGlvbiA9IHRoaXMucmVzcG9uc2UuYmluZCh0aGlzKTtcbiAgICAgICAgQWpheC5yZXF1ZXN0KGNvbmZpZywgcmVzcG9uc2VGdW5jdGlvbik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgd2hlbiB0aGUgcXVpeiBpcyBvdmVyIGJlY2F1c2Ugb2Ygd3JvbmcgYW5zd2VyIG9yIG91dCBvZiB0aW1lXG4gKiBAcGFyYW0gY2F1c2VcbiAqL1xuXG5RdWl6LnByb3RvdHlwZS5nYW1lT3ZlciA9IGZ1bmN0aW9uKGNhdXNlKSB7XG4gICAgdmFyIGhzID0gbmV3IEhpZ2hzY29yZSh0aGlzLm5pY2tuYW1lLCB0aGlzLnRvdGFsVGltZS50b0ZpeGVkKDEpKTtcbiAgICB0aGlzLmNsZWFyRGl2KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudFwiKSk7XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXAtZ2FtZU92ZXJcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICB2YXIgdGl0bGU7XG4gICAgaWYgKGNhdXNlID09PSBcInRpbWVcIikge1xuICAgICAgICB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiWW91IHJhbiBvdXQgb2YgdGltZSFcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIldyb25nIGFuc3dlciFcIik7XG4gICAgfVxuXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImgxXCIpLmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgIGlmIChocy5oaWdoc2NvcmUubGVuZ3RoID4gMCkge1xuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaDJcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJQcmV2aW91cyBoaWdoc2NvcmU6XCIpKTtcbiAgICAgICAgdmFyIGhzRnJhZyA9IGhzLmNyZWF0ZUhpZ2hzY29yZUZyYWdtZW50KCk7XG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJ0YWJsZVwiKS5hcHBlbmRDaGlsZChoc0ZyYWcpO1xuICAgIH1cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB3aGVuIHF1aXogaXMgZmluaXNoZWRcbiAqL1xuXG5RdWl6LnByb3RvdHlwZS5nYW1lRmluaXNoZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaHMgPSBuZXcgSGlnaHNjb3JlKHRoaXMubmlja25hbWUsIHRoaXMudG90YWxUaW1lLnRvRml4ZWQoMSkpO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcC1xdWl6RmluaXNoZWRcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICBpZiAoaHMuaGlnaHNjb3JlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5ocy10aXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlByZXZpb3VzIGhpZ2hzY29yZTpcIikpO1xuICAgICAgICB2YXIgaHNGcmFnID0gaHMuY3JlYXRlSGlnaHNjb3JlRnJhZ21lbnQoKTtcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcInRhYmxlXCIpLmFwcGVuZENoaWxkKGhzRnJhZyk7XG4gICAgfVxuXG4gICAgaWYgKGhzLmFkZFRvTGlzdCgpKSB7XG4gICAgICAgIHZhciBuZXdIUyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMVwiKTtcbiAgICAgICAgbmV3SFMuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOZXcgSGlnaHNjb3JlXCIpKTtcbiAgICAgICAgdmFyIGRpdiA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XG4gICAgICAgIGRpdi5pbnNlcnRCZWZvcmUobmV3SFMsIGRpdi5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyRGl2KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudFwiKSk7XG5cbiAgICB2YXIgaDMgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRpbWVcIik7XG4gICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRvdGFsVGltZS50b0ZpeGVkKDEpKTtcbiAgICBoMy5hcHBlbmRDaGlsZCh0ZXh0KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIHNwZWNpZmljIGRpdlxuICogQHBhcmFtIGRpdiB7T2JqZWN0fVxuICovXG5cblF1aXoucHJvdG90eXBlLmNsZWFyRGl2ID0gZnVuY3Rpb24oZGl2KSB7XG4gICAgd2hpbGUgKGRpdi5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGRpdi5sYXN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFRpbWVyIGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0gb3duZXIge09iamVjdH0gLSBvd25lciBvYmplY3QgdGhhdCBjcmVhdGVkIHRpbWVyXG4gKiBAcGFyYW0gZWxlbWVudCB7T2JqZWN0fSAtIGVsZW1lbnQgdG8gcHJpbnQgdGltZXJcbiAqIEBwYXJhbSB0aW1lIHtOdW1iZXJ9IC0gdGltZSB0byBjb3VudCBkb3duXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBUaW1lcihvd25lciwgZWxlbWVudCwgdGltZSkge1xuICAgIHRoaXMub3duZXIgPSBvd25lcjtcbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLmludGVydmFsID0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgc3RhcnRzIHRoZSB0aW1lciB3aXRoIGFuIGludGVydmFsXG4gKi9cblxuVGltZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMucnVuLmJpbmQodGhpcyksIDEwMCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGVhY2ggaW50ZXJ2YWxcbiAqL1xuXG5UaW1lci5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgdmFyIGRpZmYgPSAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcblxuICAgIHZhciBzaG93VGltZSA9IHRoaXMudGltZSAtIGRpZmY7XG5cbiAgICBpZiAoZGlmZiA+PSB0aGlzLnRpbWUpIHtcbiAgICAgICAgc2hvd1RpbWUgPSAwO1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLm93bmVyLmdhbWVPdmVyKFwidGltZVwiKTtcbiAgICB9XG5cbiAgICBpZiAoc2hvd1RpbWUgPD0gMTApIHtcbiAgICAgICAgdGhpcy5wcmludChzaG93VGltZS50b0ZpeGVkKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByaW50KHNob3dUaW1lLnRvRml4ZWQoMCkpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBzdG9wcyB0aW1lciBiZWZvcmUgaXQncyBmaW5pc2hlZFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuXG5UaW1lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgcmV0dXJuIChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgdGltZXJcbiAqIEBwYXJhbSBkaWZmXG4gKi9cblxuVGltZXIucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oZGlmZikge1xuICAgIHRoaXMuZWxlbWVudC5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZiksIHRoaXMuZWxlbWVudC5maXJzdENoaWxkKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgcTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgc3VibWl0IGZvciBuaWNrbmFtZSBhbmQgc3RhcnRpbmcgdGhlIHF1aXpcbiAqIEBwYXJhbSBldmVudFxuICovXG5cbmZ1bmN0aW9uIHN1Ym1pdChldmVudCkge1xuICAgIGlmIChldmVudC53aGljaCA9PT0gMTMgfHwgZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQudHlwZSA9PT0gXCJjbGlja1wiKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuaWNrbmFtZVwiKS52YWx1ZTtcblxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcSA9IG5ldyBRdWl6KGlucHV0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3VibWl0XCIpO1xudmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1aXpGb3JtXCIpO1xuXG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN1Ym1pdCwgdHJ1ZSk7XG5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBzdWJtaXQsIHRydWUpO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikuZm9jdXMoKTtcbiJdfQ==
