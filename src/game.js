var RESOURCE_SIZE = 40
var AGENT_SIZE = 40
var clear = '#deffc8'
var dark = '#014248'

document.documentElement.style.setProperty(`--dark`, dark);
document.documentElement.style.setProperty(`--clear`, clear);

document.body.style.background = clear
var screen = document.getElementById('screen')
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

/*
COMODORE 64 is the first clever IA, seeking for the nearest resource
*/
AGENT_64 = 2


AGENT_SPEED = .5

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
    console.log(event.y-this.pos.x)
    if(Math.abs(event.pageX-this.pos.x) < RESOURCE_SIZE && Math.abs(event.pageY-this.pos.y) < RESOURCE_SIZE) {
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
        arc(this.pos, RESOURCE_SIZE + 6, (this.available) / this.total, dark)
        disc(this.pos, RESOURCE_SIZE, dark)
        circle(this.pos, RESOURCE_SIZE + 6, 2, dark)
        textCenter(this.pos,this.clickPoint, clear, RESOURCE_SIZE)
    }
}

Resource.prototype.destroy = function() {
    this.isActive = false
    updateResources()
}

for(var i = 0; i < ressourcesPositions.length; i++) {
    resources.push(new Resource(ressourcesPositions[i], 10 * (i + 1), 1))
}

function Agent(type) {
    this.price = 0
    this.type = type
    this.isActive = false
    this.pos = new v2d(0,0)
    this.speed = new v2d(0.6, 0.6)
    this.collectRadius = 120
    this.collectSize = 5
    this.isIddle = true
    this.collectTime = 1000
    this.collectCD = 0
    this.fearOrigin = new v2d(0,0)
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
    console.log( )

    if((event.pageX - this.pos.x - screen.offsetLeft < AGENT_SIZE) && (event.pageX - this.pos.x - screen.offsetLeft > 0) && (event.pageY - this.pos.y- screen.offsetTop < AGENT_SIZE) && (event.pageY - this.pos.y- screen.offsetTop > 0)) { // && Math.abs(
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
    document.getElementById('AGENT_' + this.type).classList.remove('agent--active')
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
            fearVector.scale(AGENT_SPEED * 1.3)
            this.pos.add(fearVector)
            bubble(this.pos, FEAR_BUBBLE)

            return
        }

        if(this.type === AGENT_MO) {
            //rand aim
            if(this.pos.x < 0 || this.pos.x > screenWidth - AGENT_SIZE) {
                this.speed.x = -this.speed.x
            }
            if(this.pos.y < 0 || this.pos.y > screenHeight - AGENT_SIZE) {
                this.speed.y = -this.speed.y
            }
            this.pos.add(this.speed)
        }

        if(this.type === AGENT_MAC) {
            var ressOnRange = false
            for(var i = 0; i < resources.length; i ++) {
                if(resources[i].isActive === true && resources[i].pos.stance(this.pos) < this.collectRadius) {
                    ressOnRange = true
                }
            }
            if(ressOnRange === false) {
                if(this.pos.x < 0 || this.pos.x > screenWidth - AGENT_SIZE) {
                    this.speed.x = -this.speed.x
                }
                if(this.pos.y < 0 || this.pos.y > screenHeight - AGENT_SIZE) {
                    this.speed.y = -this.speed.y
                }
                this.pos.add(this.speed)
            }
        }

        if(this.type === AGENT_64) {
            var nearRess = resources[0]
            var minStance = this.pos.stance(nearRess.pos)
            var stance = 0
            for(var i = 1; i < resources.length; i ++) {
                if(resources[i].isActive) {
                    var stance = this.pos.stance(resources[i].pos)
                    if(this.pos.stance(resources[i].pos) < minStance) {
                        minStance = stance
                        nearRess = resources[i]
                    }
                }
            }

            this.speed.setVector(nearRess.pos)
            this.speed.sub(this.pos)
            this.speed.normalize()
            this.speed.scale(AGENT_SPEED)
            if(minStance > this.collectRadius) {
                this.pos.add(this.speed)
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
    this.fearOrigin.setVector(fearOrigin)
    this.fearCooldown = FEAR_COOLDOWN
}

Agent.prototype.activate = function() {
    document.getElementById('AGENT_' + this.type).classList.add('agent--active')
    this.isActive = true
}

agents.push(new Agent(AGENT_MO))
agents.push(new Agent(AGENT_MAC))
agents.push(new Agent(AGENT_64))

function agentAction(agentID) {
    var agent = agents[agentID]
    if(!agent.isActive && score >= agent.price) {
        agent.activate()
    }
}
var freeResources = []
var availableResources = 0
var toActivate = null
stepResource = 0
function updateResources() {
    freeResources.length = 0
    availableResources  = 0
    for(var i = 0; i < resources.length; i ++) {
        if(resources[i].isActive === false) {
            availableResources++
            freeResources.push(resources[i])
        }
    }
    if(availableResources > 1) {
        toActivate = freeResources[Math.floor(Math.random()*availableResources)]
        toActivate.isActive = true
        toActivate.available = toActivate.total
    }


}

function propagateKill(agent) {
    for(var i = 0; i < agents.length; i++) {
        if(agents[i].pos.stance(agent.pos) < FEAR_RANGE && agents[i].type !== agent.type) {
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
        ctx.moveTo(i*cellSize,0)
        ctx.beginPath()
        ctx.lineTo(i*cellSize, screenHeight)
		ctx.strokeStyle = dark

		ctx.stroke()
    }

    for(var i = 1; i < screenHeight / cellSize; i++) {
        ctx.moveTo(0,i*cellSize)
        ctx.beginPath()
        ctx.lineTo(screenWidth, i * cellSize)
        ctx.strokeStyle = dark
        ctx.stroke()
    }
}

function disc(pos,radius, style) {
    ctx.fillStyle = style
    ctx.beginPath()
    ctx.arc(pos.x,pos.y,radius,0, 2*Math.PI)
    ctx.fill()
}

function circle(pos,radius, width, style) {
    ctx.strokeStyle = style
    ctx.lineWidth = width
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

function text(pos, text, style) {
    ctx.font = "15px arial"
    ctx.fillText(text,pos.x, pos.y)
}

function textCenter(pos, text, style, width) {
    ctx.fillStyle = style
    ctx.textAlign = 'center'
    ctx.fillText(text, pos.x, pos.y, width)
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
    ctx.textAlign="center";
    ctx.fillText(message, pos.x + 150, pos.y + 25, 300)
}

function arc(pos,radius, prop, style) {
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.lineTo(pos.x + Math.cos(0) * radius, pos.y + Math.sin(0))
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2 * prop)
    ctx.closePath()
    ctx.fillStyle = style
    ctx.fill()
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
