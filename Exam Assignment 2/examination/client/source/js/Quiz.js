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
