var RESOURCE_SIZE = 40
var AGENT_SIZE = 40
var clear = '#deffc8'
var dark = '#014248'

document.body.style.background = clear
var screen = document.getElementById('screen')
var screenWidth = window.innerWidth
var screenHeight = window.innerHeight

screen.width = screenWidth
screen.height = screenHeight
var ctx =  screen.getContext('2d')
var debug = true



/*
 Mo5 is stupid, just occasionally say is own name move like an alcoolic collect has he enter on ressource radius
 */
AGENT_MO = 0
/*
 MAC is a little bit clever, he stop when he is within range of resource or else walk randomly
*/
AGENT_MAC = 1



FEAR_RANGE = 300
FEAR_COOLDOWN = 4000
FEAR_BUBBLE = "HaAAAaaaAAAAaaaa"

GAME_STATE_RUN = 1
GAME_STATE_PAUSE = 2
GAME_STATE_MAIN = 3




var frameHandler=-1
var playerCollectSize = 1
var currentAgent = null
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
    this.isActive = true
}

Resource.prototype.isClicked = function(event) {
    if(event.x-this.pos.x < RESOURCE_SIZE && event.y-this.pos.y < RESOURCE_SIZE) {
        return true
    }
    return false
}

Resource.prototype.collect = function(resource) {
    if(this.isActive) {
        if(this.available >= resource) {
            this.available -= resource
            return resource
        }
        var removed = this.available
        this.available = 0
        this.destroy()
        return removed
    }

    return 0

}

Resource.prototype.draw = function() {
    if(this.isActive === true) {
        circle(this.pos,RESOURCE_SIZE)
        text(this.pos,this.clickPoint + ' | ' + this.available)
    }
}

Resource.prototype.destroy = function() {
    this.isActive = false
    updateResources()
}

resources.push(new Resource(new v2d(screenWidth/2,screenHeight/2), 100, 1))

function Agent(type) {
    this.price = 0
    this.type = type
    this.isActive = false
    this.pos = new v2d(0,0)
    this.speed = new v2d(0.2, 0.2)
    this.collectRadius = 1200
    this.collectSize = 5
    this.isIddle = true
    this.collectTime = 1000
    this.collectCD = 0
    this.fearOrigin = null
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
    agentPanel.classList.add('agent-panel--active')
    currentAgent = this
}

Agent.prototype.unSelect = function () {
    this.isSelected = false
    agentPanel.classList.remove('agent-panel--active')
    currentAgent = null
}


Agent.prototype.reset = function() {
    this.isActive = false
    this.pos.setPoint(0,0)
    this.isIddle = true
    this.collectCD = 0;
    this.fearCooldown = 0;
}

function kill() {
    propagateKill(currentAgent) // game method
    currentAgent.reset()
    agentPanel.classList.remove('agent-panel--active')
}

var fearVector = new v2d(0,0)
Agent.prototype.live = function(delta) {
    if(this.collectCD > 0) {
        this.collectCD -= delta
    }

    if(this.collectCD <= 0) {
        this.isIddle = true
    }

    if(this.isActive === true) {

        // if fear : HaAAAaaaaAaaaaaaaaAAaa
        if(this.fearCooldown >= 0) {
            this.fearCooldown -= delta

            fearVector.setVector(this.pos)
            fearVector.sub(this.fearOrigin)
            fearVector.normalize()
            fearVector.scale(0.3)
            this.pos.add(fearVector)
            bubble(this.pos, FEAR_BUBBLE)

            return
        }

        if(this.type === AGENT_MO) {
            //rand aim
            this.pos.add(this.speed) 
        }

        if(this.type === AGENT_MAC) {

            for(var i = 0; i < resources.length; i ++) {
                if(resources[i].pos.stance(this.pos) > this.collectRadius) {
                    this.pos.add(this.speed)
                }
            }
        }


        for(var j = 0; j < resources.length; j++) {
            if(this.pos.stance(resources[j].pos) < this.collectRadius && this.isIddle === true) {
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

    removeResource = resource.collect(this.collectSize)
    if(removeResource > 0) {
        this.isIddle = false
        this.collectCD = this.collectTime
        score += removeResource
    }

}

Agent.prototype.fear = function(fearOrigin) {
    this.fearOrigin = fearOrigin
    this.fearCooldown = FEAR_COOLDOWN
}

Agent.prototype.activate = function() {
    this.isActive = true
}

agents.push(new Agent(AGENT_MO))
agents.push(new Agent(AGENT_MAC))

function agentAction(agentID) {
    var agent = agents[agentID]
    if(!agent.isActive && score >= agent.price) {
        agent.activate()
    }
}

stepResource = 0
function updateResources() {
    resources.push(new Resource(new v2d(100,100),1000,5))
}

function propagateKill(agent) {
    for(var i = 0; i < agents.length; i++) {
        if(agents[i].pos.stance(agent.pos) < FEAR_RANGE) {
            agents[i].fear(agent.pos)
        }
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
        } else {
            //agents[i].unSelect()
        }
    }
}

var time = performance.now()
var delta = 0
function loop() {
    delta = performance.now() - time
    information.innerHTML = (1.0/(delta/1000)).toFixed(1)

    screen.width+=0

    grid(100)

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


function grid(cellSize) {
    for(var i = 1; i < screenWidth / cellSize; i++) {
        ctx.moveTo(0,0)
        ctx.beginPath()
        ctx.lineTo(50, screenHeight)
    }

    for(var i = 1; i < screenHeight / cellSize; i++) {
        ctx.moveTo(0,i*cellSize)
        ctx.beginPath()
        ctx.lineTo(screenWidth, i * cellSize)
    }
}

function disc(pos,radius) {
    ctx.strokeStyle = dark
    ctx.beginPath()
    ctx.arc(pos.x,pos.y,radius,0, 2*Math.PI)
    ctx.fill()
}

function circle(pos,radius) {
    ctx.strokeStyle = dark
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(pos.x,pos.y,radius,0, 2*Math.PI)
    ctx.stroke()
}

function bar(pos, box, prop) {
    ctx.fillStyle = dark
    ctx.fillRect(pos.x, pos.y, box.x, box.y)
    ctx.fillStyle = clear
    ctx.fillRect(pos.x+1, pos.y+1, box.x - 2, box.y-2)
    ctx.fillStyle = dark
    ctx.fillRect(pos.x + 2, pos.y + 2, prop / 100 * box.x  , box.y - 4)
    ctx.stroke()
}

function text(pos, text) {
    ctx.font = "15px arial"
    ctx.fillText(text,pos.x, pos.y)
}

function square(pos, size){
    ctx.fillStyle=dark;
    ctx.fillRect(pos.x,pos.y,size,size)
}

function emptySquare(pos, size) {
    ctx.beginPath()
    ctx.strokeStyle = dark
    ctx.rect(pos.x,pos.y, size,size)
    ctx.stroke()
}



function line(origin, destination) {
    ctx.moveTo(origin.x, origin.y)
    ctx.beginPath()
    ctx.lineTo(destination.x, destination.y)
}

function bubble(pos, message) {
    ctx.rect(pos.x, pos.y, 300, 50)
    ctx.stroke()
    ctx.fillText(message, pos.x, pos.y, 300)
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
