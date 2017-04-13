function v2d(x,y) {
    this.x = x
    this.y = y
    this.tmp = 1;//for buff & swap
}
    
    v2d.prototype.setPoint = function(x,y) {
        this.x = x
        this.y = y
    }
     
    
    v2d.prototype.setVector = function(v) {
        this.x = v.x
        this.y = v.y
    }
    
    v2d.prototype.copy = function(v) {
        return new v2d(v.x, v.y)
        
    }
    
    v2d.prototype.X = function(o){
        this.x=this.x*o.x;
        this.y=this.y*o.y;
    }
    v2d.prototype.normalize = function() {
        this.tmp = this.x;
        this.x  = this.x / Math.hypot(this.x,this.y)
        this.y = this.y / Math.hypot(this.tmp,this.y)
    }
    v2d.prototype.add = function(o){
        this.x=this.x+o.x;
        this.y=this.y+o.y;
        return this;
    }
    v2d.prototype.sub = function(o){
        this.x=this.x-o.x;
        this.y=this.y-o.y;
    }
    v2d.prototype.scale = function(n){
        this.x=this.x*n;this.y=this.y*n;
    }

    v2d.prototype.toString = function() {
        return 'x:'+this.x+'|y:'+this.y
    }
    v2d.prototype.x = function() {
        return this.x
    }
    v2d.prototype.y = function() {
        return this.y
    }
    v2d.prototype.stance = function(o) {
        return Math.sqrt(
            (this.y-o.y)*(this.y-o.y)+  
            (this.x-o.x)*(this.x-o.x)
        )
    }
    v2d.prototype.norm = function() {
        return Math.hypot(this.x,this.y)
    }
    v2d.prototype.setNorm = function(norm) {
        this.normalize()
        this.scale(norm)
    }