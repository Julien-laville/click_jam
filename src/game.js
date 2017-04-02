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
var playerCollectSize = 1

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
    screen.width = screenWidth
    screen.height = screenHeight
}

var score = 0
var agents = []
var resources = []
function Resource(pos,total,clickPoint) {
    this.pos = pos
    this.clickPoint = clickPoint
    this.total = total
    this.available = total
}

Resource.prototype.isClicked = function(event) {
    if(event.x-this.pos.x < RESOURCE_SIZE && event.y-this.pos.y < RESOURCE_SIZE) {
        return true
    }
    return false
}

Resource.prototype.collect = function(resource) {
    if(this.available >= resource) {
        this.available -= resource
        return resource
    }
    var removed = this.available
    this.available = 0
    return removed
}

Resource.prototype.draw = function() {
    circle(this.pos,RESOURCE_SIZE)
    text(this.pos,this.clickPoint + ' | ' + this.available)
}

resources.push(new Resource(new v2d(screenWidth/2,screenHeight/2), 100, 1))

function Agent(type) {
    this.price = 0
    this.type = type
    this.isActive = false
    this.pos = new v2d(0,0)
    this.speed = new v2d(0.1, 0.1)
    this.collectRadius = 1000
    this.collectSize = 5
    this.isIddle = true
    this.collectTime = 3000;
    this.collectCD = 0;
}

Agent.prototype.draw = function() {
    if(this.isActive === true) {
        square(this.pos, AGENT_SIZE)

        if(this.isSelected === true) {
            emptySquare(this.pos, AGENT_SIZE + 10)
        }


        if(debug === true) {
            debugLine(this.pos,this.speed, '#f00', true)
        }

        bar(this.pos, new v2d(40,10), (this.collectTime - this.collectCD) / this.collectTime * 100)

    }
}

Agent.prototype.isClicked = function(event) {
    if(event.x-this.pos.x < AGENT_SIZE && event.y-this.pos.y < AGENT_SIZE) {
        return true
    }
    return false
}

Agent.prototype.select = function () {
    this.isSelected = true
}

Agent.prototype.live = function(delta) {
    if(this.collectCD > 0) {
        this.collectCD -= delta
    }

    if(this.collectCD <= 0) {
        this.isIddle = true
    }

    if(this.isActive === true) {
        if(this.type === AGENT_MO) {
            //rand aim
            this.pos.add(this.speed) 
        }


        for(var j = 0; j < resources.length; j++) {
            if(this.pos.stance(resources[j].pos) < this.collectRadius) {
                this.collect(resources[j])
                if(debug === true) {
                    debugLine(this.pos, new v2d(1,0), "#0f0", false)
                }
            }
        }
    }
}
var removeResource = 0
Agent.prototype.collect = function(resource) {
    if(this.isIddle === true) {
        this.isIddle = false
        this.collectCD = this.collectTime
        removeResource = resource.collect(this.collectSize)
        score += removeResource
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


var collected = 0
function clickAction(e) {
   for(var i = 0; i < resources.length; i ++) {
        if(resources[i].isClicked(e)) {
            collected = resources[i].collect(playerCollectSize)
            score += collected
        }   
    }

    for(var i = 0; i < agents.length; i++) {
        if(agents[i].isClicked(e)) {
            agents[i].select()
        }
    }
}

var time = performance.now()
var delta = 0
function loop() {
    delta = performance.now() - time
    information.innerHTML = (1.0/(delta/1000)).toFixed(1)

    screen.width+=1


    for(var i = 0; i < agents.length; i++) {
        agents[i].live(delta)
    }

    for(var i = 0; i < resources.length; i ++) {
        resources[i].draw()
    }
    
    for(var i = 0; i < agents.length; i ++) {
        agents[i].draw()
    }
    
    scoreContent.innerHTML = score
    frameHandler = requestAnimationFrame(loop)
    time = performance.now()
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

function bar(pos, box, prop) {
    ctx.fillStyle = color2
    ctx.fillRect(pos.x, pos.y, box.x, box.y)
    ctx.fillStyle = color1
    ctx.fillRect(pos.x+1, pos.y+1, box.x - 2, box.y-2)
    ctx.fillStyle = color2
    ctx.fillRect(pos.x + 2, pos.y + 2, prop / 100 * box.x  , box.y - 4)
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
function debugLine(origin, vector, color, drawValue) {
    vectTmp.setVector(vector)
    vectTmp.normalize()
    vectTmp.scale(40)
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    vectTmp.add(origin)
    ctx.lineTo(vectTmp.x, vectTmp.y)


    ctx.strokeStyle = color
    ctx.stroke()

    if(drawValue) {
        ctx.font = '11px arial'
        ctx.fillText(vector.x + '|' + vector.y, origin.x, origin.y)
    }

}
