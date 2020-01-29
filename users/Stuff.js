class Stuff extends User {
    constructor (chatId, name, mobilePhone, curretDateOrders) {
        super(chatId, name, mobilePhone);
        this.curretDateOrders = curretDateOrders;
    }

    setcCurretDateOrders (curretDateOrders) {
        this.curretDateOrders = curretDateOrders;
    }
    getCurretDateOrders (){
        return this.curretDateOrders;
    }
}
