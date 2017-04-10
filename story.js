TYPEWRITER_DELAY = 100

var story = [
    `Connecting ...<br/>test
    `,
    `
        Session Open.
    `,
    `
        Collecting Data... 
    `,
    `
        Automation script corrupted <br>
        Start interface
    `,
    `
        Left click to collect <img src="mouse-left.png"><br>
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
var currentLetter = 0
var strLen = 1
var p = story[0]
function typewriter() {

    if(currentLetter === p.length) {
        clearInterval(iHandler)
        setTimeout(nextChapter,300)
    }

    if(p[currentLetter] === '<') {
        while(p[currentLetter + strLen - 1] !== '>') {
            strLen++
        }
    }
    splashScreen.insertAdjacentHTML('beforeend',p.substr(currentLetter,strLen))
    if(strLen > 1) {
        currentLetter+=(strLen - 1)
    }
    strLen = 1

    currentLetter++
}

function stopTypeWritter() {
    clearInterval(iHandler)
}

function nextChapter() {
    splashScreen.innerHTML = ''
    currentLetter = 0
    currentChapter++
    if(currentChapter < p.length) {
        p = story[currentChapter]
        iHandler = setInterval(typewriter, TYPEWRITER_DELAY)
    }

}

iHandler = setInterval(typewriter, TYPEWRITER_DELAY)