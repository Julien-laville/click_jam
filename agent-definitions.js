var agentDefinitions = [
     {
        id : 0,
        name : 'Altair 8800',
        price : 1,
        specials : {
            move: function() {
                if(this.pos.x < 0 || this.pos.x > screenWidth - AGENT_SIZE) {
                    this.speed.x = -this.speed.x
                }
                if(this.pos.y < 0 || this.pos.y > screenHeight - AGENT_SIZE) {
                    this.speed.y = -this.speed.y
                }
                this.pos.add(this.speed)
            }  
        },
         skill : function() {
             this.specialVars.rayStep
        },
         specialVars : {
             rayStep : 0
         },
        label : "Ray gun",
        description : 'I know my own name'
    }, {
        id : 1,
        name : 'Apple II',
        price : 1,
        specials : {
            move : function() {
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
        },
        skill : function() {
            // freeze aoe  
        },
        label : "Freeze",
        description : 'In garage we trust'
    }, {
        id : 2,
        name : 'Commodore 64',
        price : 1,
        specials : {
            move : function() {
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
        },
        skill : function() {
            // taunt   
        },
        label : "Taunt",
        description : '64 Kilo Bytes for your mom'
    }, {
        id : 3,
        name : 'MO-5',
        price : 1,
        specials : {
            move : function() {
                var maxRess = resources[0]
                for(var i = 0; i < resources.length; i ++) {
                    if(resources[i].available > maxRess.available) {
                        maxRess = resources[i]
                    }
                }
                if(this.specialVars.isWarpEnabled) {
                    this.pos.setPoint(maxRess.pos.x + 55, maxRess.pos.y - 20)
                }
            }
        },
        specialVars : {
            isWarpEnabled : false
        },
        skill : function() {
            // warp    
        },
        label : "Warp",
        description : 'Best price, screen and keyboard in options'
    }
]