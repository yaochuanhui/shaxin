cc.Class({
    extends: cc.Component,

    properties: {
        sceneParent: cc.Node,
        mask: cc.Node,

        firstScenePfb: cc.Prefab,
    },

    onLoad: function() {
        window.sceneManager = this
        this.CurrentModule = null
        this.current = null
        this.next = null
        this.stack = []

        this.actualShow(cc.instantiate(this.firstScenePfb), [true])

        this.mask.active = false
    },

    asyncLoad: function(key, cb) {
        let progressCB = (done, total, item) => {
            if (this.current && this.current.onprogress) {
                this.current.onprogress(done, total, item)
            }
        }

        let pfbName = key
        let url = `prefabs/sc_${pfbName}`

        this.mask.active = true
        cc.loader.loadRes(url, progressCB, (err, prefab) => {
            if (this.current && this.current.ondone) {
                this.current.ondone()
            }

            this.mask.active = false
            if (err) {
                return cc.log(err)
            }
            if (cb) {
                let it = cc.instantiate(prefab)
                it.pfbURL = url
                it.name = key
                it.autoCollect = true
                cb(it)
            }
        })
    },

    pop() {
        this.actualShow(this.stack.pop(), null, true)
    },

    push: function(name) {
        let args = Array.prototype.slice.call(arguments)
        let key = args.shift()

        cc.log('SceneManager show', key)

        if (this.current && key == this.current.name) {
            return
        }

        this.stack.push(this.current)

        this.asyncLoad(key, (next) => {
            this.actualShow(next, args)
        })
    },

    forceShow: function(name) {
        let args = Array.prototype.slice.call(arguments)
        let key = args.shift()

        cc.log('SceneManager show', key)

        this.asyncLoad(key, (next) => {
            this.actualShow(next, args)
        })
    },

    show: function(name) {
        let args = Array.prototype.slice.call(arguments)
        let key = args.shift()

        cc.log('SceneManager show', key)

        if (this.current && key == this.current.name) {
            return
        }

        this.asyncLoad(key, (next) => {
            this.actualShow(next, args)
        })
    },

    reEnter() {
        this.actualShow(this.current)
    },

    actualShow: function(next, args, ispop) {

        // UIMgr.clear()

        this.next = next
        this.next.parent = this.sceneParent
        this.next.zIndex = 0

        if (this.current) {
            this.current.zIndex = 1
        }

        if (!ispop) {
            cc.log('args', args)
            if (next.onenter) {
                next.onenter.apply(null, args)
            }
        }

        this.ready(ispop)
    },

    ready: function() {
        if (!this.next) {
            return
        }

        let prev = this.current
        if (prev) {
            if (prev.onleave) {
                prev.onleave()
            }
            if (prev != this.next) {
                prev.parent = null
            }
        }

        this.current = this.next
        this.next = null

        if (this.sceneParent.children.length > 2) {
            cc.error('children count of scene parent is more than 1.', this.sceneParent.children.length)
        }
    },
});