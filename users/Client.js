class Client extends User {
    constructor (chatId, name, mobilePhone, orderList, adress, bonusPoints) {
        super(chatId, name, mobilePhone);
        this.orderList = orderList;
        this.adress = adress;
        this.bonusPoints = bonusPoints;
    }

    setOrderList (orderList) {
        this.orderList = orderList;
    }
    getOrderList (){
        return this.orderList;
    }

    setAdress (adress) {
        this.adress = adress;
    }
    getAdress (adress){
        return this.adress;
    }

    setBonusPoints (bonusPoints) {
        this.bonusPoints = bonusPoints;
    }
    getBonusPoints (){
        return this.bonus_points;
    }
}
