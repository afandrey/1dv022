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
