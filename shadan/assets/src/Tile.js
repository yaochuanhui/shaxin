

cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Sprite,
        word: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },


    onClick() {
        if (this.click_func) {
            this.click_func(this)
        }
    }

    // update (dt) {},
});
