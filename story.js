TYPEWRITER_DELAY = 100

var story = [
    `
        Connecting ...
    `,
    `
        Session Open.
    `,
    `
        Collecting Data... 
    `,
    `
        Automation script corrupted<br>
        Start interface
    `,
    `
        Left click to collect <img src="mouse-left.png">
        Data can be excanged on the market to buy bots<br>
        Be aware that bots are very advanced IA
        What if they realise what they realy are
    `,
    `
        <div class="start">(Click to start)</div>
    `
]
var iHandler = -1
var currentChapter = 0  
var currentLetterPos = 0
var p = story[0]
function typewriter() {
    currentLetterPos++
    if(p[currentLetterPos] === '<') {
        while(p[currentLetterPos] != '>') {
            currentLetterPos ++
        }
    }
        
    splashScreen.insertAdjacentHTML('beforeend',p.substr(0,currentLetterPos))
    if(currentLetterPos === p.length) {
        clearInterval(iHandler)
        setTimeout(nextChapter,300)
    }
}

function stopTypeWritter() {
    clearInterval(iHandler)
}

function nextChapter() {
    splashScreen.innerHTML = ''
    currentLetterPos = 0
    p = story[++currentChapter]
    iHandler = setInterval(typewriter, TYPEWRITER_DELAY)
}

iHandler = setInterval(typewriter, TYPEWRITER_DELAY)