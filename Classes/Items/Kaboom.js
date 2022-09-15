let Vector3 = require('../Vector3');
const ItemBase = require('./ItemBase');

module.exports = class Kaboom extends ItemBase{
    constructor(){
        super();
        this.username="Kaboom"
        this.position=new Vector3();
    }

    updateTime(){
        this.expiredTime-=0.1;
        if(this.expiredTime<0){
            return true;
        }
        else
        {
            return false
        }
    }

    onCheckColision(connections){
        let item = this;
        let found=false;
        
        let availableTargets = connections.filter(connection => {
            let player = connection.player;
            return item.position.Distance(player.position) < 15;
        });
        availableTargets.forEach(p => {        
            if(item.position.Distance(p.player.position) < 1 && this.expiredTime<29){
                found=true;
            }
        });
        return found;    
    }
}