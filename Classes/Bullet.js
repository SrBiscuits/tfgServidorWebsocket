var ServerObject = require('./ServerObjects.js')
var Vector3 = require('./Vector3.js');

module.exports = class Bullet extends ServerObject {
    constructor() {
        super();
        this.direction = new Vector3();
        this.speed = 2;
        this.isDestroyed = false;
        this.activator = '';
    }

    onUpdate()
    {     
        this.position.x += this.direction.x * this.speed;
        this.position.y += this.direction.y * this.speed;
        this.position.z += this.direction.z * this.speed;

        return this.isDestroyed;
    }
}