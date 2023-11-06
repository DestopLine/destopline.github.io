let runningTotal = 0;
let buffer = "0";
let prevNumber = 0;
let prevOperator = null;
let selectedOperator = null;
let simpleClear = false;
let previewing = false;
let isOperatorHighlighted = false;

const screen = document.querySelector(".screen");

// Adds commas to the buffer and returns it as a new string
function formatBuffer(buf) {
    let negative = buf[0] === "-";
    if (negative) {
        buf = buf.slice(1);
    }
    return buf
        .split(".")
        .map((str, index) => {
            if (index === 0) {
                let newStr = [];
                for (let i = str.length; i > 0; i -= 3) {
                    const offset = i-3 >= 0 ? i-3 : 0;
                    newStr.push(str.slice(offset, i));
                }
                return (negative ? "-" : "") + newStr.reverse().join(",");
            } else return str;
        })
        .join(".");
}

function flushBuffer() {
    let fBuffer = buffer.length > 3 ? formatBuffer(buffer) : buffer;
    screen.innerText = fBuffer;
    
    // Toggles the clear button between AC and C
    const clearButton = document.querySelector("#btn-clear")
    if (buffer === "0") {
        simpleClear = false;
        clearButton.innerText = "AC";
    } else {
        simpleClear = true;
        clearButton.innerText = "C";
    }
}

function enableSelectedOperator() {
    if (selectedOperator) {
        const clsList = document
            .querySelector("#" + selectedOperator)
            .classList;
        clsList.remove("unselected");
        clsList.add("selected");
        isOperatorHighlighted = true;
    }
}

function disableSelectedOperator() {
    if (isOperatorHighlighted) {
        const clsList = document
            .querySelector("#" + selectedOperator)
            .classList;
        clsList.remove("selected");
        clsList.add("unselected");
        isOperatorHighlighted = false;
    }
}

function handleNumber(strNum) {
    // If an operator button was pressed, treat the buffer as "0" even
    // if it's showing a different number
    if (previewing) {
        buffer = "0";
        previewing = false;
    }

    disableSelectedOperator();

    if (buffer === "0" && strNum !== ".") {
        buffer = strNum;
    } else if (strNum !== "." || !buffer.includes(".")) {
        buffer += strNum;
    }
}

function flushOperator() {
    const intBuffer = Number(buffer);

    switch (selectedOperator) {
        case "btn-plus":
            runningTotal += intBuffer;
            break;

        case "btn-minus":
            runningTotal -= intBuffer;
            break;

        case "btn-times":
            runningTotal *= intBuffer;
            break;
            
        case "btn-divide":
            runningTotal /= intBuffer;
            break;
    }

    buffer = String(runningTotal);
    previewing = true;
}

function handleOperator(btnId) {
    if (isOperatorHighlighted) {
        disableSelectedOperator();
    } else {
        prevOperator = selectedOperator;
        if (!selectedOperator) {
            runningTotal = Number(buffer);
            buffer = "0";
        } else {
            flushOperator();
        }
    }
    
    selectedOperator = btnId;
    enableSelectedOperator();
}

function handleClick(event) {
    switch (event.target.id) {
        case "":
            handleNumber(event.target.innerText);
            break;
            
        case "btn-clear":
            buffer = "0";
            if (!simpleClear) {
                disableSelectedOperator();
                runningTotal = 0;
                prevNumber = 0;
                prevOperator = null;
                selectedOperator = null;
                previewing = false;
            }
            break;

        case "btn-plusminus":
            if (buffer !== "0") {
                buffer = buffer[0] === "-" ? buffer.substring(1) : "-" + buffer;
            }
            if (previewing) {
                runningTotal = Number(buffer);
            }
            disableSelectedOperator();
            break;
        
        case "btn-percent":
            if (buffer !== "0" && buffer[buffer.length-1] !== ".") {
                buffer = String((Number(buffer) / 100));
            }
            if (previewing) {
                runningTotal = Number(buffer);
            }
            disableSelectedOperator();
            break;
        
        case "btn-plus":
        case "btn-minus":
        case "btn-times":
        case "btn-divide":
            if ((buffer !== "0" && buffer[buffer.length-1] !== ".") || isOperatorHighlighted) {
                handleOperator(event.target.id);
            }
            break;

        case "btn-equals":
            if (!previewing) {
                prevNumber = Number(buffer);
            }
            if (!selectedOperator) {
                selectedOperator = prevOperator;
                buffer = String(prevNumber);
            }
            flushOperator();
            prevOperator = selectedOperator;
            selectedOperator = null;
            break;
    }

    flushBuffer();
    console.log("Total:", runningTotal);
}

function init() {
    document.querySelector(".button-pad").addEventListener("click", event => {
        if (event.target.tagName === "BUTTON") {
            handleClick(event);
        }
    });
}

init();