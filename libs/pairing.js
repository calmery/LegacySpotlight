function pairing( name, device, id ){
    this.name = name
    this.device = device
    this.id = id
}

pairing.prototype.getDevice = function(){
    return this.device
}

pairing.prototype.getName = function(){
    return this.name
}

pairing.prototype.getId = function(){
    return this.id
}

pairing.prototype.getPairingCode = function(){
    this.pairingCode = Math.floor( Math.random() * 9999 )
    return this.pairingCode
}

pairing.prototype.comparePairingCode = function( pairingCode ){
    return this.pairingCode === pairingCode
}

module.exports = pairing