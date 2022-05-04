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
    
    onUpdate(onUpdatePosition,onUpdateRotation){
        //console.log(this.position.x);
        /*
        let ai=this;

        if(!ai.hasTarget){
            return;
        }
        console.log("rotation3");
        let targetConnection=ai.target;
        let targetPosition=targetConnection.player.position;

        let direction=new Vector3();
        direction.x=targetPosition.x-ai.position.x;
        direction.y=targetPosition.y-ai.position.y;
        direction.z=targetPosition.z-ai.position.z;
        direction=direction.Normalize();

        let rotation=Math.atan2(direction.x,direction.z) * ai.radiants2Degrees();

        if(isNaN(rotation)){
            return;
        }

        onUpdateRotation({
            id:ai.id,
            zombieRotation:rotation
        });
        */
    }

    onObtainTarget(connections){
        /*
        let ai = this;
        let foundTarget=false;
        ai.target=undefined;

        //Encontrar los que estan mas cerca
        let availableTargets=connections.filter(connection=>{
            let player = connection.player;
            return ai.position.Distance(player.position) <50;
        });
        //De ellos, pillar el que está mas cerca
        availableTargets.sort((a,b)=>{
            let aDistance=ai.position.Distance(a.player.position);
            let bDistance=ai.position.Distance(b.player.position);
            return (aDistance<bDistance) ? -1:1;
        });
        if(availableTargets.length>0){
            foundTarget=true;
            ai.target=availableTargets[0];
        }
        ai.hasTarget=foundTarget;
        */
    }
}