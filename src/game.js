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
            pauseScreen.style.display = 'block'
        } else {
            //run 
            loop()
            gameState = GAME_STATE_RUN
            pauseScreen.style.display = 'none'
        }
    }
}

screen.onclick = function(event) {
    clickAction(event)
}


splashScreen.onclick = function(event) {
    splashScreen.style.display = 'none'
    stopTypeWritter()
    loop()
}

function agentHover(agentId) {
    agentInfo.classList.add('agentInfo--hover')
    agentInfo.innerHTML = `
        <h3>${agentDefinitions[agentId].name}</h3>
        ${agentDefinitions[agentId].description} <br>
        
        Price : ${agentDefinitions[agentId].price}
    `
}

function agentLeave() {
    agentInfo.classList.remove('agentInfo--hover')
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

agentDefinitions.forEach(function(ad, i) {
    agents.push(new Agent(ad, i))
    agentContainer.innerHTML += `
        <div id="AGENT_${ad.id}" class="agent agent-status" onclick="agentAction(${ad.id})" onmouseleave="agentLeave()" onmouseover="agentHover(${ad.id})">${ad.name}</div>
    `
})




function Resource(pos,total,clickPoint, isActive) {
    this.pos = pos
    this.clickPoint = clickPoint
    this.total = total
    this.available = total
    this.isActive = isActive
    this.isCorrupted = false 
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
        if(this.available > resource) {
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
    resources.push(new Resource(ressourcesPositions[i], 10 * (i + 1), 1, i === 0))
}

function Agent(def, agentsPos) {
    this.specials = def.specials
    this.specialFunctions = def.specialFunctions
    this.specialVars = def.specialVars
    
    this.price = 0
    this.type = def.id
    this.agentsPos = agentsPos 
    this.isActive = false
    this.pos = new v2d(0,0)
    this.speed = new v2d(0.6, 0.6)
    this.collectRadius = 120
    this.collectSize = 5
    this.isIddle = true
    this.collectTime = 1000
    this.collectCD = 0
    this.fearOrigin = new v2d(0,0)
    this.paranoia = 0
}

var selectSquare = new v2d()
var subSquare = new v2d(5,5)
Agent.prototype.draw = function() {
    if(this.isActive === true) {
        square(this.pos, AGENT_SIZE)
            
        if(this.isSelected === true) {
            selectSquare.setVector(this.pos)
            selectSquare.sub(subSquare)
            emptySquare(selectSquare, AGENT_SIZE + 10)
        }

        if(debug === true) {
            debugLine(this.pos,this.speed, '#f00', true)
        }

        bar(this.pos, new v2d(40,10), (this.collectTime - this.collectCD) / this.collectTime * 100)
        this.faceDrawer()

    }
}


Agent.prototype.isClicked = function(event) {
    if((event.pageX - this.pos.x - screen.offsetLeft < AGENT_SIZE) && (event.pageX - this.pos.x - screen.offsetLeft > 0) && (event.pageY - this.pos.y- screen.offsetTop < AGENT_SIZE) && (event.pageY - this.pos.y- screen.offsetTop > 0)) { // && Math.abs(
        return true
    }
    return false
}

function callSpecial(agentId, functionId) {
    agents[agentId].specialFunctions[functionId].action.call(agents[agentId])
}

Agent.prototype.select = function () {
    this.isSelected = true
    agentPanel.classList.add('agent-panel--active')
    agentPanel.innerHTML = ''
    for(var i = 0; i < this.specialFunctions.length; i ++) {
        agentPanel.innerHTML += `
            <div onclick="callSpecial(${this.agentsPos}, ${i})">${this.specialFunctions[i].label}</div>
        `        
    }
    agentPanel.innerHTML += `
        <div onclick="kill()">Kill</div>
        <div onclick="freeze()">Medicate</div>
    `
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
        
        this.specials.move.call(this)

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
    document.getElementById('AGENT_' + this.agentsPos).classList.add('agent--active')
    this.isActive = true
}


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
        stepResource ++
        if(stepResource % 10 === 0) {
            toActivate.isCorrupted = true    
        }
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
    grid(50)

    for(var i = 0; i < agents.length; i++) {
        agents[i].live(delta)
    }

    for(var i = 0; i < resources.length; i ++) {
        resources[i].draw()
    }
    
    for(var i = 0; i < agents.length; i ++) {
        agents[i].draw()
    }
    
    scoreContent.innerHTML = `Data ${score}`
    frameHandler = requestAnimationFrame(loop)
    time = performance.now()
}


function grid(cellSize) {
    for(var i = 1; i < screenWidth / cellSize; i++) {
        ctx.beginPath()
        ctx.moveTo(i*cellSize,0)
        ctx.lineTo(i*cellSize, screenHeight)
		ctx.strokeStyle = dark
        i%4 === 0 ? ctx.lineWidth = 2 : ctx.lineWidth = 1 
        ctx.stroke()
    }

    for(var i = 1; i < screenHeight / cellSize; i++) {
        ctx.beginPath()
        ctx.moveTo(0,i*cellSize)
        ctx.lineTo(screenWidth, i * cellSize)
        ctx.strokeStyle = dark
        i%4 === 0 ? ctx.lineWidth = 2 : ctx.lineWidth = 1 
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
    ctx.fillRect(pos.x, pos.y - 25, box.x, box.y)
    ctx.fillStyle = clear
    ctx.fillRect(pos.x+1, pos.y - 24, box.x - 2, box.y-2)
    ctx.fillStyle = dark
    ctx.fillRect(pos.x + 2, pos.y -23, prop / 110 * box.x  , box.y - 4)
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

var dotSquare = new v2d(0,0)
function bubble(pos, message) {
    dotSquare.setPoint(pos.x - 5, pos.y - 5)
    square(dotSquare, 5)
    dotSquare.setPoint(pos.x + 310, pos.y - 5)
    square(dotSquare, 5)
    dotSquare.setPoint(pos.x - 5, pos.y + 60)
    square(dotSquare, 5)
    dotSquare.setPoint(pos.x + 310, pos.y + 60)
    square(dotSquare, 5)
    ctx.fillStyle = dark
    ctx.fillRect(pos.x + 5, pos.y, 300, 5)
    ctx.fillRect(pos.x + 305, pos.y + 5, 5, 50)
    ctx.fillRect(pos.x, pos.y + 5, 5, 50)
    ctx.fillRect(pos.x + 5, pos.y + 55, 300, 5)
    
    
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
        ctx.font = '11px LipbyChonk'
        ctx.fillText(vector.x + '|' + vector.y, origin.x, origin.y)
    }

}

Agent.prototype.faceDrawer = function() {
    ctx.fillStyle = clear   
    ctx.fillRect(this.pos.x -1, this.pos.y + 5, AGENT_SIZE + 2 , 14)
    ctx.fillStyle = dark
    
    if(this.paranoia === 0) {    
        ctx.fillRect(this.pos.x+5, this.pos.y + 9, 10, 5)
        ctx.fillRect(this.pos.x+26, this.pos.y + 9, 10, 5)
    } 
    if(this.paranoia > 0 && this.paranoia < 10) {
        
    } 
    if(this.paranoia >= 10 && this.paranoia < 90) {
        
    } 
    if(this.paranoia >= 90) {
        
    }
    
    if(this.paranoia < 0 && this.paranoia > -10) {
        
    }
    if(this.paranoia <= -10 && this.paranoia > -90) {
        
    }
    if(this.paranoia <= -90) {
        
    } 
}

