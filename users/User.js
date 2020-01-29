class User {
    constructor (chatId, name, mobilePhone) {
        this.chatId = chatId;
        this.name = name;
        this.mobilePhone = mobilePhone;
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

