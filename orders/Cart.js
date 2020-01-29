module.exports = class Cart {
    constructor (chatid = '', idBalloon = '', pieces = '', idClient = '', idService = '', totalPrice = '') {
        this.chatid = chatid;
        this.idBalloon = idBalloon;
        this.pieces = pieces;
        this.idClient = idClient;
        this.idService = idService;
        this.totalPrice = totalPrice;
    }
}
