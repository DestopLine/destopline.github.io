let runningTotal = 0;
let buffer = "0";
let prevNumber = 0;
let prevOperator = null;
let selectedOperator = null;
let simpleClear = false;
let previewing = false;
let isOperatorHighlighted = false;

const screen = document.querySelector(".screen-text");

// Adds commas to the buffer and returns it as a new string
function formatBuffer(buf) {
    let negative = buf[0] === "-";
    if (negative) {
        buf = buf.slice(1);
    }
    return (negative ? "-" : "") + buf
        .split(".")
        .map((str, index) => {
            if (index === 0) {
                let newStr = [];
                for (let i = str.length; i > 0; i -= 3) {
                    const offset = i-3 >= 0 ? i-3 : 0;
                    newStr.push(str.slice(offset, i));
                }
                return newStr.reverse().join(",");
            } else return str;
        })
        .join(".");
}

function flushBuffer() {
    screen.innerText = buffer.length > 3 ? formatBuffer(buffer) : buffer;

    if (screen.scrollWidth > screen.offsetWidth) {
        if (screen.classList.contains("small-screen")) {
            // Make the scrollbar visible for...
            screen.classList.add("visible-scrollbar"); // Firefox
            document.documentElement.style.setProperty("--clr-scrollbar-thumb", "#333333"); // Chromium
        }
        screen.classList.add("small-screen");
    } else if (buffer === "0") {
        // Make the scrollbar invisible for...
        screen.classList.remove("small-screen", "visible-scrollbar"); // Firefox
        document.documentElement.style.setProperty("--clr-scrollbar-thumb", "black"); // Chromium
    }
    
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
    if (event.target.tagName !== "BUTTON") return;

    switch (event.target.id) {
        case "": // Numbers don't have any id
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
        case "btn-percent":
            if (buffer !== "0") {
                if (event.target.id === "btn-plusminus")
                    buffer = buffer[0] === "-" ? buffer.substring(1) : "-" + buffer;
                else
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
    document.querySelector(".button-pad")
        .addEventListener("click", handleClick);
}

init();