let Connection = require('../Connection')
let ServerItem=require('../Utility/ServerItem')
let Vector3=require('../Vector3')
let AIBase=require('../AI/AIBase')
const Server = require('socket.io')

module.exports = class LobbyBase {
    constructor(id) {
        this.id = id;
        this.connections = [];
        this.serverItems=[];
    }

    onUpdate() {       
        let lobby=this;
        let serverItems=lobby.serverItems;
        /*
        let aiList=serverItems.filter(item =>{return item instanceof AIBase;});
        aiList.forEach(AI=>{
            AI.onObtainTarget(lobby.connections);
            
            AI.onUpdate(data=>{
                lobby.connections.forEach(connection=>{
                   let socket=connection.socket;
                    socket.emit('updatePosition',data);
                });
            }, (data) =>{
                lobby.connections.forEach(connection=>{
                    let socket=connection.socket;
                    socket.emit('updateZombieRotation',data);
                });
            });
        });
        */
    } 

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayPlayerInformation() + ' has entered the lobby (' + lobby.id + ')');

        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby;
        
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayPlayerInformation() + ' has left the lobby (' + lobby.id + ')');

        connection.lobby = undefined;

        let index = lobby.connections.indexOf(connection);
        if(index > -1) {
            lobby.connections.splice(index, 1);
        }
        if(this.connections.length>0 && lobby.id>0)
        {
            this.connections[0].socket.emit('host');
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

        lobby.this.deleteServerItem(item);

        connections.forEach(connection=>{
            connection.socket.emit('serverUnspawn',{
                id:item.id,
            })
        });
    }

    deleteServerItem(item=Server){
        let lobby =this;
        let serverItems=lobby.serverItems;
        let index=serverItem.indexOf(item);

        //SI es mas grande, existe
        if(index>-1){
            serverItems.splice(index,1);
        }
    }
}