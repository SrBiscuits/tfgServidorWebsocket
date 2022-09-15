let AIBase = require('../AI/AIBase')
let Vector3 = require('../Vector3')

module.exports = class ZombieAI extends AIBase{
    constructor(){
        super();
        this.username="Zombie_AI"

        this.target;
        this.position=new Vector3();
        this.rotation=new Number(0);
        this.hasTarget=false;
    }
    

    respawn(round = Number)
    {
        this.isDead = false;
        this.health = new Number(50+(round*100));
        if(this.round>9)
        {
            this.health+=(950*(1.1^(round-9)));
        }  
        this.position = new Vector3(0, 0, 0);
    }

    dealDamage(amount = Number) {
        this.health -=amount;

        if(this.health <= 0 ) {
            this.isDead = true;
            this.canRespawn=false;
        }
        return this.isDead;
    }
    
    onUpdate(){
       
    }

    onObtainTarget(connections){
        
    }
}