class User {
    constructor (chatId, name, mobilePhone, adress) {
        this.chatId = chatId;
        this.name = name;
        this.mobilePhone = mobilePhone;
        this.adress = adress;
    }

    getChatId () {
        return this.chatId;
    }
    setchatId (chatId) {
        this.chatId = chatId;
    }

    getName () {
        return this.name;
    }
    setName (name) {
        this.name = name;
    }

    getMobilePhone () {
        return this.mobilePhone;
    }
    setMobilePhone (mobilePhone) {
        this.mobilePhone = mobilePhone;
    }
}

