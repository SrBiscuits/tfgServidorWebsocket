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

        if(this.health <= 0 ) {
            this.isDead = true;
        }
        return this.isDead;
    }

    displayPlayerInformation(){
        let player=this;
        return '('+player.username+': '+player.id+')';
    }
}