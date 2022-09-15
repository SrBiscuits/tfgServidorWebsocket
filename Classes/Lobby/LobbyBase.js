let shortID=require('shortid')
let Connection = require('../Connection')
let ServerItem=require('../Utility/ServerItem')
let Vector3=require('../Vector3')
let AIBase=require('../AI/AIBase')
const Server = require('socket.io')

module.exports = class LobbyBase {
    constructor() {
        this.id = shortID.generate();
        this.connections = [];
        this.serverItems=[];
        this.currentHostNumber=Number(0);
        this.hostswap=false;
    }

    onUpdate() {  
    } 

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log("Player "+ player.displayPlayerInformation() + " entered (" + lobby.id + ")");

        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby;    
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayPlayerInformation() + ' leaved (' + lobby.id + ')');

        connection.lobby = undefined;

        let index = lobby.connections.indexOf(connection);
        if(index > -1) {
            lobby.connections.splice(index, 1);
        }
        if(this.connections.length>0 && lobby.id!='General Server')
        {
            this.connections[0].socket.emit('host');
            this.currentHostNumber=0;
        }
    }

    onServerSpawn(item=ServerItem,location=Vector3){
        let lobby=this;
        let serverItems=lobby.serverItems;
        let connections=lobby.connections;

        item.position=location;

        serverItems.push(item);

        connections.forEach(connection=>{
            connection.socket.emit('serverSpawn',{
                id:item.id,
                name:item.username,
                position:item.position.JSONData()
            })
        });
    }

    onServerUnspawn(item=ServerItem){
        let lobby = this;
        let connections=lobby.connections;

        lobby.deleteServerItem(item);

        connections.forEach(connection=>{
            connection.socket.emit('serverUnspawn',{
                id:item.id,
            })
        });
    }

    deleteServerItem(item=Server){
        let lobby =this;
        let serverItems=lobby.serverItems;
        let index=serverItems.indexOf(item);

        //SI es mas grande, existe
        if(index>-1){
            serverItems.splice(index,1);
        }
    }
    newHost(){
    }
}