let ServerItem = require('../Utility/ServerItem');
let Vector3 = require('../Vector3')

module.exports=class AIBase extends ServerItem{
    constructor(){
        super();
        this.username='AI_BASE';
        this.health=new Number(150);
        this.isDead=false;
        this.canRespawn=true;
        this.respawnTimer=Number(2);
    }

    onUpdate(){
    }  

    onCanRespawn(){
        if(this.canRespawn==false){
            this.respawnTimer-=0.1;
            if(this.respawnTimer<=0){
                this.canRespawn=true;
                this.respawnTimer=2;
            }
        }
        return this.canRespawn;
    }

    onObtainTarget(connections){
    }

    respawn(round = Number)
    {
        this.isDead = false;
        this.health = new Number(50+(round*100));
        this.health+=(950*(1.1^(round-9)));       
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
}