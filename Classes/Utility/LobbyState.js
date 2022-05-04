module.exports = class LobbyState{
    constructor()
    {
        //Estados predefinidos:
        this.GAME='GAME';
        this.LOBBY='Lobby';
        this.ENDGAME='EndGame';

        //Current Estados 
        this.currentState=this.LOBBY;
    }
}