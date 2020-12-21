
let Res = require("Res")
let Tile = require("Tile")

cc.Class({
    extends: cc.Component,

    properties: {
        res: Res,
        tile: cc.Prefab,
        level: cc.JsonAsset,

        lb_level: cc.Label,
        grid: cc.Node,
        select: cc.Node,
        win: cc.Node,
    },

    onLoad () {
        this.node.onenter = this.enter.bind(this)
    },

    btn_home() {
        sceneManager.show("menu")
    },


    enter(lv) {
        this.win.active = false
        this.setLevel(lv)
    },

    setLevel(lv) {
        this.lb_level.string = `第${lv}关`
        this.grid.removeAllChildren()

        this.tiles = []
        for (let x = 0; x < 9; x ++) {
            this.tiles.push([])
            for (let y = 0; y < 9; y ++) {
                let node = cc.instantiate(this.tile)
                node.parent = this.grid
                let tile = node.getComponent(Tile)
                tile.bg.node.active = false
                tile.word.node.active = false
                tile.empty = true
                this.tiles[x].push(tile)
            }
        }
        this.grid.getComponent(cc.Layout).updateLayout ()

        let data = this.level.json[lv]
        let answer = {}
        for (let i in data.answer) {
            answer[data.answer[i]] = {answerid:data.answer[i]}
        }

        for (let i = 0; i < data.posx.length; i++) {
            let x = data.posx[i]
            let y = data.posy[i]
            let tile = this.tiles[x][y]
            tile.word.string = data.word[i]
            tile.x = x
            tile.y = y
            tile.empty = false
            tile.answerid = i

            if (answer[i]) {
                tile.word.node.active = false
                tile.bg.node.active = true
                tile.bg.spriteFrame = this.res.word_unselected
                answer[i] = tile
                tile.click_func = (tile)=> {
                    this.selectTile(tile, true)
                }
            } else {
                tile.ok = true
                tile.bg.node.active = true
                tile.word.node.active = true
            }
        }

        this.shouldFill = answer
        this.data = data
        this.showAnswers()
    },

    showAnswers() {

        for (let k in this.shouldFill) {
            let node = cc.instantiate(this.tile)
            node.parent = this.select
            let id = k
            let tile = node.getComponent(Tile)
            tile.bg.spriteFrame = this.res.word_tile
            tile.word.string = this.data.word[k]
            tile.click_func = ()=> {
                this.fillAnswer(tile, id)
            }
        }

        this.selectNext()
    },

    fillAnswer(tile, id) {
        if (this.currentTile.answerid == id) {
            let filled = this.shouldFill[id]
            filled.ok = true
            filled.word.node.active = true
            filled.word.string = this.data.word[id] 
            tile.node.parent = null
            this.selectNext()
            this.showGreen(filled)
        }
    },

    showGreen(filled) {
        let xtiles = this.matchx(filled)        
        if (xtiles) {
            xtiles.forEach((v)=> {
                v.bg.spriteFrame = this.res.word_correct
            })
        }
        let ytiles = this.matchy(filled)        
        if (ytiles) {
            ytiles.forEach((v)=> {
                v.bg.spriteFrame = this.res.word_correct
            })
        }
    },

    matchy(filled) {
        let ret = []
        for (let y = filled.y; y >= 0; y+=-1) {
            let tile = this.tiles[filled.x][y]
            if (tile.empty) {
                break
            }
            if (!tile.ok) {
                return false
            }
            ret.push(tile)
        }

        for (let y = filled.y+1; y < 9; y+=1) {
            let tile = this.tiles[filled.x][y]
            if (tile.empty) {
                break
            }
            if (!tile.ok) {
                return false
            }
            ret.push(tile) 
        }
        return ret
    },
    
    matchx(filled) {
        let ret = []
        for (let x = filled.x; x >= 0; x+=-1) {
            let tile = this.tiles[x][filled.y]
            if (tile.empty) {
                break
            }
            if (!tile.ok) {
                return false
            }
            ret.push(tile) 
        }

        for (let x = filled.x+1; x < 9; x+=1) {
            let tile = this.tiles[x][filled.y]
            if (tile.empty) {
                break
            }
            if (!tile.ok) {
                return false
            }
            ret.push(tile) 
        }
        return ret
    },

    selectNext() {
        for (let k in this.shouldFill) {
            if (!this.shouldFill[k].ok) {
                this.selectTile(this.shouldFill[k])
                return 
            }
        }

        this.showWin()
    },

    selectTile(tile) {
        if (this.currentTile) {
            this.setTileSelect(this.currentTile, false)
        }
        this.currentTile = tile
        this.setTileSelect(tile, true)
    },

    setTileSelect(tile, v) {
        if (v) {
            tile.bg.spriteFrame = this.res.word_selected
        } else {
            tile.bg.spriteFrame = this.res.word_unselected
        }
    },

    showWin() {
        this.win.active = true
    }


    // update (dt) {},
});
