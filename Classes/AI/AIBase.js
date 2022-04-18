let ServerItem = require('../Utility/ServerItem');
let Vector3 = require('../Vector3')

module.exports=class AIBase extends ServerItem{
    constructor(){
        super();
        this.username='AI_BASE';
        this.health=new Number(150);
        this.isDead=false;
    }

    onUpdate(onUpdatePosition,onUpdateRotation){
        //Calculate Statemachine
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
        }
        return this.isDead;
    }

    radiants2Degrees(){
        return new Number(57.29578);        
    }
}