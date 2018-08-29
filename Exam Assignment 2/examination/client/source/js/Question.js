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
