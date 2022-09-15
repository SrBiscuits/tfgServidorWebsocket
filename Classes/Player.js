var shortID = require('shortid');
var Vector3 = require('./Vector3.js');

module.exports = class Player{
    constructor(){
        this.username = 'Default_Player';
        this.id = shortID.generate();
        this.lobby=0;
        this.position=new Vector3();
        this.gunRotation=new Number(0);
        this.playerRotation=new Number(0);
        this.health=new Number(100);
        this.bloodCooldown=Number(0);
        this.isDead=false;
    }

    respawn()
    {
        this.isDead = false;
        this.health = new Number(100);
        this.position = new Vector3(0, 0, 0);
    }

    dealDamage(amount = Number) {
        this.health -=amount;
        this.bloodCooldown=1.5;
        if(this.health <= 0 ) {
            this.isDead = true;
        }
        return this.isDead;
    }

    blood()
    {
        this.bloodCooldown-=0.1;
        if(this.bloodCooldown<0 && !this.isDead)
        {
            this.health+=0.5;         
        }
    }

    checkAlive() {
        if(this.health > 0) {
            return true;
        }
        return false;
    }

    displayPlayerInformation(){
        let player=this;
        return '('+player.username+': '+player.id+')';
    }

    maxHealth(){
        this.health=100;
        console.log("max health");
    }
}