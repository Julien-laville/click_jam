var RESOURCE_SIZE = 40
var AGENT_SIZE = 40
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

AGENT_MO = 0

GAME_STATE_RUN = 1
GAME_STATE_PAUSE = 2
GAME_STATE_MAIN = 3

/*
Mo5 is stupid, just occasionaly say is own name move like an alcoolic collect has he enter on ressource radius
*/

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

function Agent(type) {
    this.price = 0
    this.type = type
    this.isActive = false
    this.pos = new v2d(0,0)
    this.speed = new v2d(0.1, 0.1)

}

Agent.prototype.draw = function() {
    if(this.isActive === true) {
        square(this.pos, AGENT_SIZE)

        if(this.isSelected === true) {
            emptySquare(this.pos, AGENT_SIZE + 10)
        }

        if(debug === true) {
            debugLine(this.pos,this.speed)
        }

    }
}

Agent.prototype.isClicked = function(e) {
    if(event.x-this.pos.x < AGENT_SIZE && event.y-this.pos.y < AGENT_SIZE) {
        return true
    }
    return false
}

Agent.prototype.select = function () {
    this.isSelected = true
}

Agent.prototype.live = function() {
    if(this.isActive === true) {
        if(this.type === AGENT_MO) {
            //rand aim
            this.pos.add(this.speed) 
        }
    }
}

Agent.prototype.activate = function() {
    this.isActive = true
}

agents.push(new Agent(AGENT_MO))

function agentAction(agentID) {
    var agent = agents[agentID]
    if(!agent.isActive && score >= agent.price) {
        agent.activate()
    }
}




function clickAction(e) {
   for(var i = 0; i < resources.length; i ++) {
        if(resources[i].isClicked(e)) {
            score++
            resources[i].total--
        }   
    }

    for(var i = 0; i < agents.length; i++) {
        if(agents[i].isClicked(e)) {
            agents[i].select()
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

function emptySquare(pos, size) {
    ctx.beginPath()
    ctx.strokeStyle = color2
    ctx.rect(pos.x,pos.y, size,size)
    ctx.stroke()
}



function line(origin, destination) {
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    ctx.lineTo(destination.x, destination.y)
}



/* debug helper :  */


var vectTmp = new v2d(0,0)
function debugLine(origin, vector) {
    vectTmp.setVector(vector)
    vectTmp.normalize()
    vectTmp.scale(40)
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    vectTmp.add(origin)
    ctx.lineTo(vectTmp.x, vectTmp.y)
    ctx.font = '11px arial'
    ctx.fillText(vector.x + '|' + vector.y, origin.x, origin.y)

    ctx.strokeStyle = "#f00"
    ctx.stroke()

}