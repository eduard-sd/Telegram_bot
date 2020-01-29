module.exports = class OrderService {
    constructor (order = '', service = '', price = '') {
        this.order  = order;
        this.service = service;
        this.price = price;
    }
}
