let ServerItem = require('../Utility/ServerItem');

module.exports=class ItemBase extends ServerItem{
    constructor(){
        super();
        this.username='ITEM_BASE';
        this.expiredTime=Number(30);       
    }

    updateTime(){
        
    }   
    onCheckColision(connections){

    }
}