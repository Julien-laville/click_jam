var RESOURCE_SIZE = 40
var color1 = '#444'
var color2 = '#777'

document.body.style.background = color1
var screen = document.getElementById('screen')
var screenWidth = window.innerWidth
var screenHeight = window.innerHeight

screen.width = screenWidth
screen.height = screenHeight
var ctx =  screen.getContext('2d')
var debug = true

GAME_STATE_RUN = 1
GAME_STATE_PAUSE = 2
GAME_STATE_MAIN = 3

/*
Mo5 is stupid, just occasionaly say is own name move like an alcoolic collect has he enter on ressource radius
*/
AGENT_MO = 1
var frameHandler=-1


var gameState = GAME_STATE_RUN

window.onkeypress =function(e) {
    if(e.keyCode === 32) {
        if(gameState===GAME_STATE_RUN) {
            //pause
            cancelAnimationFrame(frameHandler)
            gameState = GAME_STATE_PAUSE
        } else {
            //run 
            loop()
            gameState = GAME_STATE_RUN
        }
    }
}

screen.onclick = function(event) {
    clickAction(event)
}


window.onresize = function() {
    screenWidth = window.innerWidth
    screenHeight = window.innerHeight
    screen.width = screenWidth + 'px' 
    screen.height = screenHeight + 'px'
}

var score = 0
var agents = []
var resources = []
function Resource(pos,total,clickPoint) {
    this.pos = pos
    this.clickPoint = clickPoint
    this.total = total
}

Resource.prototype.isClicked = function(e) {
    if(event.x-this.pos.x < RESOURCE_SIZE && event.y-this.pos.y < RESOURCE_SIZE) {
        return true
    }
    return false
}

Resource.prototype.draw = function() {
    circle(this.pos,RESOURCE_SIZE)
    text(this.pos,this.clickPoint + ' | ' + this.total)
}

resources.push(new Resource(new v2d(screenWidth/2,screenHeight/2), 100, 1))

function Agent() {
    this.pos = new v2d(0,0)
    this.type = AGENT_MO
    this.speed = new v2d(0.1, 0.1)

}

Agent.prototype.draw = function() {
    square(this.pos,30)
    
}

Agent.prototype.live = function() {
    if(this.type === AGENT_MO) {
        //rand aim
        this.pos.add(this.speed) 
    }
}

agents.push(new Agent())



function clickAction(e) {
   for(var i = 0; i < resources.length; i ++) {
        if(resources[i].isClicked(e)) {
            score++
            resources[i].total--
        }   
    }
}


function loop() {
    for(var i = 0; i < agents.length; i++) {
        agents[i].live()
    }
    
    
    screen.width+=1
    for(var i = 0; i < resources.length; i ++) {
        resources[i].draw()
    }
    
    for(var i = 0; i < agents.length; i ++) {
        agents[i].draw()
    }
    
    scoreContent.innerHTML = score
    frameHandler = requestAnimationFrame(loop)
}

loop()
//draw helper


function disc(pos,radius) {
    ctx.strokeStyle = color2
    ctx.beginPath()
    ctx.arc(pos.x,pos.y,radius,0, 2*Math.PI)
    ctx.fill()
}



function circle(pos,radius) {
    ctx.strokeStyle = color2
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(pos.x,pos.y,radius,0, 2*Math.PI)
    ctx.stroke()
}

function text(pos, text) {
    ctx.font = "15px arial"
    ctx.fillText(text,pos.x, pos.y)
}

function square(pos, size){
    ctx.fillStyle=color2;
    ctx.fillRect(pos.x,pos.y,size,size)
}

function line(pos)