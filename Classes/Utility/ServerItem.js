let shortID=require('shortID');
let Vector3=require('../Vector3.js');

module.exports=class ServerItem{
    constructor(){
        this.username="ServerItem";
        this.id=shortID.generate();
        this.position=new Vector3();
    }
}