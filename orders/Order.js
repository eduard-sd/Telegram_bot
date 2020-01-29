module.exports = class Order {
    constructor (chatid = '', idCart = '', date = '', idClient = '', idService = '', payment = '', orderIsDone = 'false', orderIsDelivered = 'false', manager) {
        this.chatid = chatid;
        this.idCart = idCart;
        this.date = date;
        this.idClient = idClient;
        this.idService = idService;
        this.totalPrice = totalPrice;
        this.orderIsDone = orderIsDone;
        this.orderIsDelivered = orderIsDelivered;
        this.manager = manager;
    }
}
