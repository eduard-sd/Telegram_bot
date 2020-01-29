module.exports = class Order {
    constructor (date = '', orderList = [], totalSpend = '', totalRise = '') {
        this.date = date;
        this.orderList = orderList;
        this.totalSpend = totalSpend;
        this.totalRise = totalRise;
    }
}
