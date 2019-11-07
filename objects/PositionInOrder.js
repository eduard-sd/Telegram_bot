module.exports = class PositionInOrder {

    constructor (chatid = '', idBalloon = '', material = '', formFactor = '', glue = false, textureColor = '', color = '', sizeInches = '', sizeSm = '', innerAtribut = '', numberFoil = '', printedText = false, madeIn = '', price = '') {
        this.idBalloon = idBalloon;
        this.material = material;
        this.formFactor = formFactor;
        this.glue = glue;
        this.textureColor = textureColor;
        this.color = color;
        this.sizeInches = sizeInches;
        this.sizeSm = sizeSm;
        this.innerAtribut = innerAtribut;
        this.numberFoil = numberFoil;
        this.printedText = printedText;
        this.madeIn = madeIn;
        this.price = price;
    }

    get idBalloonInfo() {
        return this.idBalloon;
    }

    set idBalloonInfo(value) {
        let valueInt = parseInt(value);
        if(!isNaN(valueInt) || valueInt < 0) {
            throw new Error("Cant be negative or not a number");
        }
        this.idBalloon = value;
    }
};


