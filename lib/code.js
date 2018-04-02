var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var what;
(function (what) {
    class Main {
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                yield what.CoinTool.initAllAsset();
                setTimeout(() => { this.update(); }, 1000);
                var divpanel = document.getElementById("panel");
                lightsPanel.panelMgr.instance().init(divpanel);
                lightsPanel.panelMgr.instance().setbackImg("res/back1.jpg");
                this.panelState = new what.panel_State();
                this.panelState.init(this);
                this.panelLoadKey = new what.panel_LoadKey();
                this.panelLoadKey.init(this);
                this.panelFunction = new what.panel_Function();
                this.panelFunction.init(this);
                this.panelTransaction = new what.panel_Transaction();
                this.panelTransaction.init(this);
                this.panelSign = new what.panel_Sign();
                this.panelSign.init(this);
                this.panelSign.panel.hide();
                this.panelUTXO = new what.panel_UTXO();
                this.panelUTXO.init(this);
            });
        }
        update() {
            this.panelState.update();
            setTimeout(() => { this.update(); }, 1000);
        }
    }
    what.Main = Main;
    window.onload = () => {
        var main = new Main();
        main.start();
    };
})(what || (what = {}));
var lightsPanel;
(function (lightsPanel) {
    let direction;
    (function (direction) {
        direction[direction["H_Left"] = 0] = "H_Left";
        direction[direction["H_Right"] = 1] = "H_Right";
        direction[direction["V_Top"] = 2] = "V_Top";
        direction[direction["V_Bottom"] = 3] = "V_Bottom";
    })(direction = lightsPanel.direction || (lightsPanel.direction = {}));
    class panel {
        constructor(div) {
            this.divRoot = null;
            this.subPanels = null;
            this.divTitle = null;
            this.divContent = null;
            this.divResize = null;
            this.btnFloat = null;
            this.btnClose = null;
            this.onClose = null;
            this.isFloat = false;
            this.canDrag = true;
            this.canScale = true;
            this.canDock = true;
            this.divRoot = div;
            this.divRoot["inv"] = this;
            for (var i = 0; i < this.divRoot.childElementCount; i++) {
                var div = this.divRoot.children[i];
                if (div != undefined && div.className == "dialog-content") {
                    this.divContent = div;
                    break;
                }
            }
        }
        setTitleText(txt) {
            var a = this.divTitle.children[1];
            a.text = txt;
        }
        setTitle(txt, img = null) {
            var a = this.divTitle.children[1];
            a.text = txt;
            var i = this.divTitle.children[0];
            if (img == null) {
                i.hidden = true;
            }
            else {
                i.hidden = false;
                if (img != "-")
                    i.src = img;
            }
        }
        splitWith(p, dir, v) {
            var parent = this.container;
            var pc = null;
            if (this.container.subPanels.length < this.container.maxPanelCount) {
                pc = this.container;
            }
            else {
                for (var i in parent.subPanels) {
                    if (parent.subPanels[i] == this) {
                        var dd = document.createElement("div");
                        dd.className = "full";
                        pc = new panelContainer(dd);
                        parent.addSubPanel(pc, parseInt(i));
                        pc.divRoot.style.left = this.divRoot.style.left;
                        pc.divRoot.style.top = this.divRoot.style.top;
                        pc.divRoot.style.right = this.divRoot.style.right;
                        pc.divRoot.style.bottom = this.divRoot.style.bottom;
                        pc.addSubPanel(this);
                    }
                }
            }
            if (dir == direction.H_Left) {
                this.divRoot.style.left = "1px";
                p.divRoot.style.left = "0px";
            }
            else if (dir == direction.H_Right) {
                p.divRoot.style.left = "1px";
                this.divRoot.style.left = "0px";
            }
            else if (dir == direction.V_Top) {
                this.divRoot.style.top = "1px";
                p.divRoot.style.top = "0px";
            }
            else if (dir == direction.V_Bottom) {
                p.divRoot.style.top = "1px";
                this.divRoot.style.top = "0px";
            }
            pc.addSubPanel(p);
            pc.onSplit(dir, v);
            return;
        }
        onDock(container) {
            this.container = container;
            this.isFloat = false;
            this.divRoot.style.boxShadow = "0px";
            this.btnFloat.hidden = !this.canDrag;
            this.btnClose.hidden = true;
            this.divResize.hidden = true;
            this.divTitle.style.cursor = "auto";
        }
        makeMini(width, height) {
            this.canDock = false;
            this.canScale = false;
            this.floatWidth = width;
            this.floatHeight = height;
            this.divTitle.textContent = "";
            this.divTitle.style.height = "12px";
            this.divTitle.style.width = "100%";
            this.divContent.style.top = "12px";
            this.divRoot.style.right = "auto";
            this.divRoot.style.bottom = "auto";
            this.divRoot.style.width = this.floatWidth + "px";
            this.divRoot.style.height = this.floatHeight + "px";
        }
        onFloat() {
            this.isFloat = true;
            this.divRoot.style.boxShadow = "1px 1px 3px #292929";
            this.btnFloat.hidden = true;
            if (this.onClose != null)
                this.btnClose.hidden = false;
            else
                this.btnClose.hidden = true;
            if (this.canDrag) {
                this.divTitle.style.cursor = "move";
            }
            else {
                this.divTitle.style.cursor = "auto";
            }
            this.divResize.hidden = !this.canScale;
            var pos = panelMgr.instance()._calcRootPos(this.divRoot);
            var cx = panelMgr.instance()._calcRootCenterPos();
            var dirx = cx.x - pos.x;
            if (dirx != 0)
                dirx /= Math.abs(dirx);
            var diry = cx.y - pos.y;
            if (diry != 0)
                diry /= Math.abs(diry);
            pos.x += dirx * 16;
            pos.y += diry * 16;
            if (this.floatWidth > panelMgr.instance().width - 32 - pos.x) {
                this.floatWidth = panelMgr.instance().width - 32 - pos.x;
            }
            if (this.floatHeight > panelMgr.instance().height - 32 - pos.y) {
                this.floatHeight = panelMgr.instance().height - 32 - pos.y;
            }
            if (this.floatWidth < 100) {
                this.floatWidth = 100;
            }
            if (this.floatHeight < 100) {
                this.floatHeight = 100;
            }
            if (pos.x > panelMgr.instance().width - this.floatWidth) {
                pos.x = panelMgr.instance().width - this.floatWidth;
            }
            if (pos.y > panelMgr.instance().height - this.floatHeight) {
                pos.y = panelMgr.instance().height - this.floatHeight;
            }
            this.divRoot.style.left = pos.x + "px";
            this.divRoot.style.top = pos.y + "px";
            this.divRoot.style.right = "auto";
            this.divRoot.style.bottom = "auto";
            this.divRoot.style.width = this.floatWidth + "px";
            this.divRoot.style.height = this.floatHeight + "px";
        }
        toCenter() {
            if (this.isFloat == false)
                return;
            this.divRoot.style.left = (panelMgr.instance().width - this.floatWidth) / 2 + "px";
            this.divRoot.style.top = (panelMgr.instance().height - this.floatHeight) / 2 + "px";
        }
        show() {
            this.divRoot.hidden = false;
        }
        hide() {
            this.divRoot.hidden = true;
        }
    }
    lightsPanel.panel = panel;
    class panelContainer {
        constructor(div) {
            this.divRoot = null;
            this.subPanels = [];
            this.divScale = null;
            this.divRoot = div;
            this.divRoot["inv"] = this;
        }
        get maxPanelCount() {
            return 2;
        }
        onSplit(dir, v) {
            if (dir == direction.H_Left || dir == direction.H_Right) {
                this.scalew = v;
                this.scaleh = 1;
            }
            else {
                this.scalew = 1;
                this.scaleh = v;
            }
            this._doSplit();
        }
        _doSplit() {
            var mgr = panelMgr.instance();
            if (this.divScale == null) {
                this.divScale = document.createElement("div");
                this.divRoot.appendChild(this.divScale);
                this.divScale.className = "dialog-split";
                this.divScale.style.position = "absolute";
                this.divScale.style.zIndex = "1000";
            }
            this.divScale.hidden = false;
            if (this.scaleh == 1) {
                this.divScale.style.height = "auto";
                this.divScale.style.top = "0px";
                this.divScale.style.bottom = "0px";
                this.divScale.style.width = "auto";
                this.divScale.style.left = this.scalew * 100 + "%";
                this.divScale.style.right = ((1 - this.scalew) * 100) + "%";
                this.divScale.style.marginLeft = "-3px";
                this.divScale.style.marginRight = "-3px";
                this.divScale.style.marginTop = "0px";
                this.divScale.style.marginBottom = "0px";
                this.divScale.style.cursor = "ew-resize";
                for (var i = 0; i < this.subPanels.length; i++) {
                    var subdiv = this.subPanels[i].divRoot;
                    if (subdiv.style.left == "0px") {
                        mgr._setDockPos(subdiv, "0px", "0px", (1 - this.scalew) * 100 + "%", "0px");
                    }
                    else {
                        mgr._setDockPos(subdiv, (this.scalew * 100) + "%", "0px", "0px", "0px");
                    }
                }
            }
            else if (this.scalew == 1) {
                this.divScale.style.height = "auto";
                this.divScale.style.left = "0px";
                this.divScale.style.right = "0px";
                this.divScale.style.width = "auto";
                this.divScale.style.top = this.scaleh * 100 + "%";
                this.divScale.style.bottom = ((1 - this.scaleh) * 100) + "%";
                this.divScale.style.marginTop = "-3px";
                this.divScale.style.marginBottom = "-3px";
                this.divScale.style.marginLeft = "0px";
                this.divScale.style.marginRight = "0px";
                this.divScale.style.cursor = "ns-resize";
                for (var i = 0; i < this.subPanels.length; i++) {
                    var subdiv = this.subPanels[i].divRoot;
                    if (subdiv.style.top == "0px") {
                        mgr._setDockPos(subdiv, "0px", "0px", "0px", (1 - this.scaleh) * 100 + "%");
                    }
                    else {
                        mgr._setDockPos(subdiv, "0px", (this.scaleh * 100) + "%", "0px", "0px");
                    }
                }
            }
            else {
                throw new Error("无效数据");
            }
        }
        onDock(container) {
            this.container = container;
        }
        addSubPanel(p, pos = -1) {
            if (p.divRoot.parentElement != null) {
                p.divRoot.parentElement.removeChild(p.divRoot);
            }
            if (p.container != null) {
                p.container.removeSubPanel(p);
            }
            this.divRoot.appendChild(p.divRoot);
            if (pos < 0)
                this.subPanels.push(p);
            else {
                this.subPanels[pos] = p;
            }
            p.onDock(this);
        }
        removeSubPanel(p) {
            var i = this.subPanels.indexOf(p);
            if (i >= 0) {
                this.subPanels.splice(i, 1);
                this.divRoot.removeChild(p.divRoot);
            }
            if (this.subPanels.length == 1) {
                this._fillStyle(this.subPanels[0].divRoot);
            }
            if (this.subPanels.length == 0 && this.container != null) {
                this.container.removeSubPanel(this);
            }
            p.container = null;
            if (this.subPanels.length < 2) {
                if (this.divScale != null)
                    this.divScale.hidden = true;
            }
        }
        _fillStyle(div) {
            div.style.left = "0px";
            div.style.top = "0px";
            div.style.width = "auto";
            div.style.height = "auto";
            div.style.right = "0px";
            div.style.bottom = "0px";
        }
        fill(p) {
            this.addSubPanel(p);
            this._fillStyle(p.divRoot);
            p.onDock(this);
        }
    }
    lightsPanel.panelContainer = panelContainer;
    class panelMgr {
        constructor() {
            this.urlfill = "data:image/png;base64,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";
            this.urlleft = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBA3y7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BUNTVQYqg4jIKAX08EGIIUByaVEZhMXIwMDAIMCgxeDHUMmwiuEBozRjFOM8xqdMhkwNTJeYNZgbme+y2LDMY2VmzWa9yubEtoldhX0mhwBHJycrZzMXM1cbNzf3RB4pnqW8xryH+IL5nvFXCwgJrBZ0E3wk1CisKHxYJF2UV3SrWJw4p/hWiRRJYcmjUhXSutJPZObIhsoJyp2V71HwUeRVvKA0RTlKRUnltepWtUZ1Pw1Zjbea+7QmaqfqWOsK6b7SO6I/36DGMMrI0ljS+LfJPdPDZivM+y0qLBOtfKwtbFRtRexY7L7aP3e47XjB6ZjzXpetruvdVrov9VjkudBrgfdCn8W+y/xW+a8P2Bq4N+hY8PmQW6HPwr5EMEUKRilFG8e4xUbF5cW3JMxO3Jx0Nvl5KlOaXLpNRlRmVdas7D059/KY8tULfAqLi2YXHy55WyZR7lJRWDmv6mz131q9uvj6SQ3HGn83G7Skt85ru94h2Ond1d59uJehz76/bsK+if8nO05pnXpiOu+M4JmzZj2aozW3ZN6+BVwLwxYtXvxxqcOyCcsfrjRe1br65lrddU3rb2402NSx+cFWq21Tt3/Y6btr1R6Oven7jh9QP9h56PURv6Obj4ufqD355LT3mS3nZM+3X/h0Ke7yqasW15bdEL3ZeuvrnfS7N+/7PDjwyPTx6qeKz2a+EHzZ9Zr5Td3bn+9LP3z6VPD53de8b+9+5P/88Lv4z7d/Vf//AwAqvx2K829RWwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAEAklEQVR42uzZT2xUVRTH8c+bGUopCLSWShAQxaSCRgmtLowYrQmogYCRaFNIY4RisQs3xpUYdhp3RkhVCjEqBhQWaogaS0ysLoRGgyEVIfzRSDQt1oiUQmnnuegwtOibts5Ma0zPW0xu3suc7zv3d+6597wglLKYSlWWWKRMdtblmANa7HVpGE+H/VdjmA97IzTUFYTwmqdC7ZoddFRnlgGYZI7bLFcuzttqMz8dhEzQk/SNHQ7Inc1Ra5kittkwFMCHVrR6QbvcWkyDteIUZNJCzF1WtNuRc/ck7fQtbMn0VEIVn6WDX2CeImFWjkOn/QY6vW+x2AYNeqMBlnAwNZhopWrT9WXhPpB0SKMT4KgzyrjO6WiAOziaFs5as3IQ/Psd86YedPpJGeWZAGZKBYxrTIFS8axm4FGNpRJ60OMMzMykgUGy6YP4QEVWjpigNSE95UG/nmKZsiAkkD8L+t8sA8AY2/8XIBz4GxumCCNlFZMQH7ZUzlNomokCBSZCt6I0T+/ghTkxDOdb1Y/0/e9ze0qCM2DPoJvbPH8lz4YCaFRPqE9yRAt0YXpBC10clBNx8Tp19lijZ2iAnWpCvzjsuB9dyjpdkya7SbkFildbrUldZoAmNecc8JbDOdZ9lRoLJdbrtTFan7Otu2SHTTl2T1KzZzULqReLBniJz+0dNIO5s07bHYPaqCmYZk2X3bpSw+nmSWS5TyCmywkXwEm7baIqCqCcU+kaOstGFVkDBAJ/2mdX6rUOwj1RAAs4pTstmodyFPpiT/gutQE6A7OiAMroTBXVhHmwwUdZ5mEo6ZVJ1SWpYR8kEtE1IryqpFb++m+8tkb+bwBhLDJXri4seSpb4/uBcYBxgHGA/wBAIOsymx3AgKNZ0B+QZFaH0xEDdFCc7q+dh1f1enn0ANq4MTX42QfOUp0cxUlJ+NIDi1Itmm67fG+apEdU5PXMPBCghQd94Qg45yuweNQAYvbbP9eTSsZwHajhXi+6e0wAEmjXlFhfYa6vHXLcH+KmjyoAdRq8N2Plw5a64KLAlMx9lTwsxT1WeT2mwFQzlCock1pQL6FIqdmu99zoToH0Vr07dRoZL8fjAGMOEPvboC8n/pJXdh8hBFGH07MUpSiS/Z+xnm5dmnV96lMt1aC4fDiNAviBGxTqRp9md7q1QkUuAvCxtnSvAB1RAG3Md63fETpis5tzUJ5jLmjTcaUH0t/b/0drp9hyW1N91ZNO5lh8JR6DlvjmqG7GzKByfh4cX7Z1lomzKjoNN9o52TNW5qEwlWiw2gS2Ox9k3H5+YlmXT+1zKt2wy9aKLfC4xSbwrjUM9XH5nTBf1jTw43UmW6jWEreYmqMQdGjVYsvlqvvXAH+q4om+d8gJAAAAAElFTkSuQmCC";
            this.divRoot = null;
            this.root = null;
            this.floatDiv = null;
            this.overDiv = null;
            this.overDiv_Show = null;
            this.overDiv_FillImg = null;
            this.overDiv_LeftImg = null;
            this.overDiv_RightImg = null;
            this.overDiv_TopImg = null;
            this.overDiv_BottomImg = null;
            this.backimg = null;
        }
        static instance() {
            if (panelMgr.g_this == null)
                panelMgr.g_this = new panelMgr();
            return panelMgr.g_this;
        }
        get width() {
            return this.divRoot.clientWidth;
        }
        get height() {
            return this.divRoot.clientHeight;
        }
        setbackImg(url) {
            this.backimg.src = url;
        }
        init(div) {
            this.divRoot = div;
            this.backimg = document.createElement("img");
            this.backimg.style.position = "absoutle";
            this.backimg.style.width = "100%";
            this.backimg.style.height = "100%";
            this.divRoot.appendChild(this.backimg);
            var panelDiv = document.createElement("div");
            panelDiv.className = "full";
            panelDiv.style.zIndex = "1";
            this.divRoot.appendChild(panelDiv);
            this.root = new panelContainer(panelDiv);
            this.floatDiv = document.createElement("div");
            this.floatDiv.className = "full";
            this.floatDiv.style.zIndex = "2";
            this.floatDiv.style.width = "0px";
            this.floatDiv.style.overflow = "visible";
            this.divRoot.appendChild(this.floatDiv);
            this.overDiv = document.createElement("div");
            this.overDiv.className = "full";
            this.overDiv.style.zIndex = "3";
            this.overDiv.style.background = "rgba(204, 0, 0, 0.48);";
            this.overDiv.style.overflow = "visible";
            this.overDiv.style.width = "0px";
            this.overDiv.hidden = true;
            this.divRoot.appendChild(this.overDiv);
            this._initOverDiv();
            var mode = 0;
            var px = 0;
            var py = 0;
            var dialog = null;
            var overobj = null;
            var btouch = false;
            var onDown = (ele, clientX, clientY) => {
                var stin = ele["className"];
                var stinp = "";
                if ((ele instanceof HTMLButtonElement) == false)
                    stinp = ele.parentElement["className"];
                this.overDiv_Show.hidden = true;
                this.overDiv_FillImg.hidden = true;
                this.overDiv_LeftImg.hidden = true;
                this.overDiv_RightImg.hidden = true;
                this.overDiv_TopImg.hidden = true;
                this.overDiv_BottomImg.hidden = true;
                if (stin == "dialog-title") {
                    var float = ele.parentElement["inv"].isFloat;
                    var drag = ele.parentElement["inv"].canDrag;
                    if (float == false || drag == false)
                        return;
                    var p = this._calcClientPos(ele);
                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 1;
                    dialog = ele.parentElement;
                    this._moveTop(dialog);
                    this.overDiv.hidden = false;
                }
                else if (stinp == "dialog-title") {
                    var float = ele.parentElement.parentElement["inv"].isFloat;
                    var drag = ele.parentElement.parentElement["inv"].canDrag;
                    if (float == false || drag == false)
                        return;
                    var p = this._calcClientPos(ele);
                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 1;
                    dialog = ele.parentElement.parentElement;
                    this._moveTop(dialog);
                    this.overDiv.hidden = false;
                }
                else if (stin == "dialog-resize") {
                    var float = ele.parentElement["inv"].isFloat;
                    if (float == false)
                        return;
                    var p = this._calcClientPos(ele);
                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 2;
                    dialog = ele.parentElement;
                    this._moveTop(dialog);
                    return true;
                }
                else if (stin == "dialog-split") {
                    var p = this._calcClientPos(ele);
                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 3;
                    dialog = ele.parentElement;
                    return true;
                }
                else {
                    var dd = ele;
                    while (dd != null) {
                        if (dd.className == "dialog" && dd instanceof HTMLDivElement) {
                            this._moveTop(dd);
                            break;
                        }
                        dd = dd.parentElement;
                    }
                    return false;
                }
            };
            var onUp = (clientX, clientY) => {
                mode = 0;
                this.overDiv.hidden = true;
                if (overobj == null) {
                    return false;
                }
                else if (overobj.id == "overDiv_FillImg") {
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panelContainer)) {
                        inele.fill(dialog["inv"]);
                    }
                    return true;
                }
                else if (overobj.id == "overDiv_LeftImg") {
                    overobj = null;
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel)) {
                        inele.splitWith(dialog["inv"], direction.H_Left, 0.5);
                    }
                    return true;
                }
                else if (overobj.id == "overDiv_RightImg") {
                    overobj = null;
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel)) {
                        inele.splitWith(dialog["inv"], direction.H_Right, 0.5);
                    }
                    return true;
                }
                else if (overobj.id == "overDiv_TopImg") {
                    overobj = null;
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel)) {
                        inele.splitWith(dialog["inv"], direction.V_Top, 0.5);
                    }
                    return true;
                }
                else if (overobj.id == "overDiv_BottomImg") {
                    overobj = null;
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel)) {
                        inele.splitWith(dialog["inv"], direction.V_Bottom, 0.5);
                    }
                    return true;
                }
                else {
                    return false;
                }
            };
            var onMove = (clientX, clientY) => {
                if (mode == 1) {
                    var pp = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (pp == null)
                        return;
                    var dock = dialog["inv"].canDock;
                    var pos = this._calcRootPos(pp.divRoot);
                    this.overDiv_FillImg.style.borderWidth = "0px";
                    this.overDiv_FillImg.style.margin = "4px";
                    this.overDiv_LeftImg.style.borderWidth = "0px";
                    this.overDiv_LeftImg.style.margin = "4px";
                    this.overDiv_RightImg.style.borderWidth = "0px";
                    this.overDiv_RightImg.style.margin = "4px";
                    this.overDiv_TopImg.style.borderWidth = "0px";
                    this.overDiv_TopImg.style.margin = "4px";
                    this.overDiv_BottomImg.style.borderWidth = "0px";
                    this.overDiv_BottomImg.style.margin = "4px";
                    if (dock) {
                        overobj = this.pickOverLay(clientX, clientY);
                    }
                    else {
                        overobj = null;
                    }
                    if (overobj == null) {
                        this.overDiv_Show.hidden = true;
                    }
                    else if (overobj.id == "overDiv_FillImg") {
                        this.overDiv_FillImg.style.borderColor = "#ffffff";
                        this.overDiv_FillImg.style.borderStyle = "solid";
                        this.overDiv_FillImg.style.borderWidth = "4px";
                        this.overDiv_FillImg.style.margin = "0px";
                        this.overDiv_Show.hidden = false;
                        this.overDiv_Show.style.left = pos.x + "px";
                        this.overDiv_Show.style.top = pos.y + "px";
                        this.overDiv_Show.style.width = pp.divRoot.clientWidth + "px";
                        this.overDiv_Show.style.height = pp.divRoot.clientHeight + "px";
                        this.overDiv_Show.style.right = "auto";
                        this.overDiv_Show.style.bottom = "auto";
                    }
                    else if (overobj.id == "overDiv_LeftImg" && overobj.hidden == false) {
                        this.overDiv_LeftImg.style.borderColor = "#ffffff";
                        this.overDiv_LeftImg.style.borderStyle = "solid";
                        this.overDiv_LeftImg.style.borderWidth = "4px";
                        this.overDiv_LeftImg.style.margin = "0px";
                        this.overDiv_Show.hidden = false;
                        this.overDiv_Show.style.left = pos.x + "px";
                        this.overDiv_Show.style.top = pos.y + "px";
                        this.overDiv_Show.style.width = (pp.divRoot.clientWidth / 2) + "px";
                        this.overDiv_Show.style.height = pp.divRoot.clientHeight + "px";
                        this.overDiv_Show.style.right = "auto";
                        this.overDiv_Show.style.bottom = "auto";
                    }
                    else if (overobj.id == "overDiv_RightImg" && overobj.hidden == false) {
                        this.overDiv_RightImg.style.borderColor = "#ffffff";
                        this.overDiv_RightImg.style.borderStyle = "solid";
                        this.overDiv_RightImg.style.borderWidth = "4px";
                        this.overDiv_RightImg.style.margin = "0px";
                        this.overDiv_Show.hidden = false;
                        this.overDiv_Show.style.left = (pos.x + pp.divRoot.clientWidth / 2) + "px";
                        this.overDiv_Show.style.top = pos.y + "px";
                        this.overDiv_Show.style.width = (pp.divRoot.clientWidth / 2) + "px";
                        this.overDiv_Show.style.height = pp.divRoot.clientHeight + "px";
                        this.overDiv_Show.style.right = "auto";
                        this.overDiv_Show.style.bottom = "auto";
                    }
                    else if (overobj.id == "overDiv_TopImg" && overobj.hidden == false) {
                        this.overDiv_TopImg.style.borderColor = "#ffffff";
                        this.overDiv_TopImg.style.borderStyle = "solid";
                        this.overDiv_TopImg.style.borderWidth = "4px";
                        this.overDiv_TopImg.style.margin = "0px";
                        this.overDiv_Show.hidden = false;
                        this.overDiv_Show.style.left = pos.x + "px";
                        this.overDiv_Show.style.top = (pos.y) + "px";
                        this.overDiv_Show.style.width = (pp.divRoot.clientWidth) + "px";
                        this.overDiv_Show.style.height = (pp.divRoot.clientHeight / 2) + "px";
                        this.overDiv_Show.style.right = "auto";
                        this.overDiv_Show.style.bottom = "auto";
                    }
                    else if (overobj.id == "overDiv_BottomImg" && overobj.hidden == false) {
                        this.overDiv_BottomImg.style.borderColor = "#ffffff";
                        this.overDiv_BottomImg.style.borderStyle = "solid";
                        this.overDiv_BottomImg.style.borderWidth = "4px";
                        this.overDiv_BottomImg.style.margin = "0px";
                        this.overDiv_Show.hidden = false;
                        this.overDiv_Show.style.left = pos.x + "px";
                        this.overDiv_Show.style.top = (pos.y + pp.divRoot.clientHeight / 2) + "px";
                        this.overDiv_Show.style.width = (pp.divRoot.clientWidth) + "px";
                        this.overDiv_Show.style.height = (pp.divRoot.clientHeight / 2) + "px";
                        this.overDiv_Show.style.right = "auto";
                        this.overDiv_Show.style.bottom = "auto";
                    }
                    else {
                        this.overDiv_Show.hidden = true;
                    }
                    var left = (clientX - (this.divRoot.offsetLeft + px));
                    var top = (clientY - (this.divRoot.offsetTop + py));
                    if (left < 0)
                        left = 0;
                    if (left > this.divRoot.offsetWidth - dialog.offsetWidth) {
                        left = this.divRoot.offsetWidth - dialog.offsetWidth;
                    }
                    if (top < 0)
                        top = 0;
                    if (top > this.divRoot.offsetHeight - dialog.offsetHeight) {
                        top = this.divRoot.offsetHeight - dialog.offsetHeight;
                    }
                    dialog.style.left = left + "px";
                    dialog.style.top = top + "px";
                    this.testOverlay(dock, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    return true;
                }
                else if (mode == 2) {
                    var width = (clientX - (this.divRoot.offsetLeft - px)) - dialog.offsetLeft;
                    if (width < 100)
                        width = 100;
                    if (width > this.divRoot.offsetWidth - dialog.offsetLeft)
                        width = this.divRoot.offsetWidth - dialog.offsetLeft;
                    var height = (clientY - (this.divRoot.offsetTop - py)) - dialog.offsetTop;
                    if (height < 100)
                        height = 100;
                    if (height > this.divRoot.offsetHeight - dialog.offsetTop)
                        height = this.divRoot.offsetHeight - dialog.offsetTop;
                    dialog.style.width = width + "px";
                    dialog.style.height = height + "px";
                    var p = dialog["inv"];
                    p.floatWidth = width;
                    p.floatHeight = height;
                    return true;
                }
                else if (mode == 3) {
                    var pos = this._calcRootPos(dialog);
                    var left = (clientX - (this.divRoot.offsetLeft - px)) - dialog.offsetLeft;
                    var top = (clientY - (this.divRoot.offsetTop - py)) - dialog.offsetTop;
                    if (left < 100)
                        left = 100;
                    if (top < 100)
                        top = 100;
                    if (left > dialog.offsetWidth - 100)
                        left = dialog.offsetWidth - 100;
                    if (top > dialog.offsetHeight - 100)
                        top = dialog.offsetHeight - 100;
                    var w = left / dialog.offsetWidth;
                    var h = top / dialog.offsetHeight;
                    var pc = dialog["inv"];
                    if (dialog.offsetWidth < 200)
                        w = pc.scalew;
                    if (dialog.offsetHeight < 200)
                        h = pc.scaleh;
                    if (pc.scalew == 1)
                        pc.onSplit(direction.V_Top, h);
                    if (pc.scaleh == 1)
                        pc.onSplit(direction.H_Left, w);
                    return true;
                }
                else {
                    return false;
                }
            };
            {
                var lastx;
                var lasty;
                this.divRoot.addEventListener("touchstart", (ev) => {
                    btouch = true;
                    lastx = ev.touches[0].clientX;
                    lasty = ev.touches[0].clientY;
                    var b = onDown(ev.target, lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
                this.divRoot.addEventListener("touchend", (ev) => {
                    var b = onUp(lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
                this.divRoot.addEventListener("touchcancel", (ev) => {
                    var b = onUp(lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
                this.divRoot.addEventListener("touchmove", (ev) => {
                    lastx = ev.touches[0].clientX;
                    lasty = ev.touches[0].clientY;
                    var b = onMove(lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
            }
            {
                this.divRoot.addEventListener("mousedown", (ev) => {
                    onDown(ev.target, ev.clientX, ev.clientY);
                });
                this.divRoot.addEventListener("mouseup", (ev) => {
                    onUp(ev.clientX, ev.clientY);
                });
                this.divRoot.addEventListener("mousemove", (ev) => {
                    onMove(ev.clientX, ev.clientY);
                });
            }
        }
        pickPanel(panel, cx, cy) {
            var b = this._inbox(panel, cx, cy);
            if (!b)
                return null;
            if (panel instanceof panelContainer) {
                for (var p in panel.subPanels) {
                    var sp = this.pickPanel(panel.subPanels[p], cx, cy);
                    if (sp != null)
                        return sp;
                }
            }
            return panel;
        }
        createPanel(name, width = 200, height = 200, customctor = null) {
            var div = document.createElement("div");
            div.className = "dialog";
            this.floatDiv.appendChild(div);
            var title = document.createElement("div");
            title.className = "dialog-title";
            div.appendChild(title);
            var i = document.createElement("img");
            i.draggable = false;
            title.appendChild(i);
            i.style.position = "absolute";
            i.style.top = "1px";
            i.style.left = "1px";
            i.style.width = "28px";
            i.style.height = "28px";
            i.src = "";
            var a = document.createElement("a");
            title.appendChild(a);
            a.text = name;
            a.style.lineHeight = "28px";
            a.style.left = "30px";
            a.style.position = "absolute";
            var content = document.createElement("div");
            content.className = "dialog-content";
            div.appendChild(content);
            var resize = document.createElement("div");
            resize.className = "dialog-resize";
            div.appendChild(resize);
            var button = document.createElement("button");
            button.textContent = "float";
            title.appendChild(button);
            button.style.position = "absolute";
            button.style.right = "4px";
            button.style.top = "4px";
            button.style.bottom = "4px";
            button.style.width = "40px";
            button.style.lineHeight = "22px";
            button.onclick = () => {
                this.floatPanel(p);
            };
            var buttonClose = document.createElement("button");
            buttonClose.textContent = "X";
            title.appendChild(buttonClose);
            buttonClose.style.position = "absolute";
            buttonClose.style.right = "4px";
            buttonClose.style.top = "4px";
            buttonClose.style.bottom = "4px";
            buttonClose.style.width = "20px";
            buttonClose.style.lineHeight = "22px";
            buttonClose.onclick = () => {
                p.onClose();
            };
            var p = null;
            if (customctor != null) {
                p = customctor(div);
            }
            else {
                p = new panel(div);
            }
            p.divTitle = title;
            p.divContent = content;
            p.divResize = resize;
            p.btnFloat = button;
            p.btnClose = buttonClose;
            p.name = name;
            p.isFloat = true;
            p.floatWidth = width;
            p.floatHeight = height;
            p.onFloat();
            return p;
        }
        toTop(panel) {
            if (panel != null) {
                this._moveTop(panel.divRoot);
            }
        }
        floatPanel(panel) {
            if (panel instanceof (panelContainer)) {
                throw new Error("panelContainer can't be float.");
            }
            if (panel.container == null)
                return;
            panel.onFloat();
            panel.container.removeSubPanel(panel);
            this.floatDiv.appendChild(panel.divRoot);
        }
        removePanel(panel) {
            if (panel.isFloat == false) {
                this.floatPanel(panel);
            }
            this.floatDiv.removeChild(panel.divRoot);
        }
        fillPanel(panel) {
            if (this.root.subPanels.length > 0) {
                throw new Error("只有在空的时候可以用");
            }
            this.root.fill(panel);
        }
        _moveTop(divsrc) {
            if (divsrc.style.zIndex == "")
                divsrc.style.zIndex = "1";
            var zme = parseInt(divsrc.style.zIndex);
            var needdec = false;
            for (var i = 0; i < this.floatDiv.childElementCount; i++) {
                var div = this.floatDiv.children[i];
                if (div == divsrc)
                    continue;
                if (div.style == undefined && div.style.zIndex == undefined)
                    continue;
                var zindex = parseInt(div.style.zIndex);
                if (zindex >= zme) {
                    needdec = true;
                    break;
                }
            }
            if (!needdec)
                return;
            var zindexmax = zme;
            for (var i = 0; i < this.floatDiv.childElementCount; i++) {
                var div = this.floatDiv.children[i];
                if (div == divsrc)
                    continue;
                if (div.style == undefined && div.style.zIndex == undefined)
                    continue;
                var zindex = parseInt(div.style.zIndex);
                zindexmax = Math.max(zindexmax, zindex);
                if (zindex > 0)
                    zindex--;
                div.style.zIndex = zindex.toString();
            }
            divsrc.style.zIndex = Math.max((zindexmax + 1), this.floatDiv.childElementCount).toString();
        }
        _initOverDiv() {
            this.overDiv_Show = document.createElement("div");
            this.overDiv_Show.className = "full";
            this.overDiv_Show.style.backgroundColor = "rgba(0, 20, 204, 0.48)";
            this.overDiv.appendChild(this.overDiv_Show);
            this.overDiv_FillImg = new Image();
            this.overDiv_FillImg.id = "overDiv_FillImg";
            this.overDiv_FillImg.src = this.urlfill;
            this.overDiv_FillImg.style.position = "absolute";
            this.overDiv_FillImg.style.width = "64px";
            this.overDiv_FillImg.style.height = "64px";
            this.overDiv.appendChild(this.overDiv_FillImg);
            this.overDiv_LeftImg = new Image();
            this.overDiv_LeftImg.id = "overDiv_LeftImg";
            this.overDiv_LeftImg.src = this.urlleft;
            this.overDiv_LeftImg.style.position = "absolute";
            this.overDiv_LeftImg.style.width = "64px";
            this.overDiv_LeftImg.style.height = "64px";
            this.overDiv.appendChild(this.overDiv_LeftImg);
            this.overDiv_RightImg = new Image();
            this.overDiv_RightImg.id = "overDiv_RightImg";
            this.overDiv_RightImg.src = this.urlleft;
            this.overDiv_RightImg.style.position = "absolute";
            this.overDiv_RightImg.style.width = "64px";
            this.overDiv_RightImg.style.height = "64px";
            this.overDiv.appendChild(this.overDiv_RightImg);
            this.overDiv_BottomImg = new Image();
            this.overDiv_BottomImg.id = "overDiv_BottomImg";
            this.overDiv_BottomImg.src = this.urlleft;
            this.overDiv_BottomImg.style.position = "absolute";
            this.overDiv_BottomImg.style.width = "64px";
            this.overDiv_BottomImg.style.height = "64px";
            this.overDiv.appendChild(this.overDiv_BottomImg);
            this.overDiv_TopImg = new Image();
            this.overDiv_TopImg.id = "overDiv_TopImg";
            this.overDiv_TopImg.src = this.urlleft;
            this.overDiv_TopImg.style.position = "absolute";
            this.overDiv_TopImg.style.width = "64px";
            this.overDiv_TopImg.style.height = "64px";
            this.overDiv.appendChild(this.overDiv_TopImg);
        }
        pickOverLay(cx, cy) {
            var cp = this._calcClientPos(this.overDiv_FillImg);
            if (cx > cp.x && cy > cp.y && cx < cp.x + 64 && cy < cp.y + 64)
                return this.overDiv_FillImg;
            var cp = this._calcClientPos(this.overDiv_LeftImg);
            if (cx > cp.x && cy > cp.y && cx < cp.x + 64 && cy < cp.y + 64)
                return this.overDiv_LeftImg;
            var cp = this._calcClientPos(this.overDiv_RightImg);
            if (cx > cp.x && cy > cp.y && cx < cp.x + 64 && cy < cp.y + 64)
                return this.overDiv_RightImg;
            var cp = this._calcClientPos(this.overDiv_TopImg);
            if (cx > cp.x && cy > cp.y && cx < cp.x + 64 && cy < cp.y + 64)
                return this.overDiv_TopImg;
            var cp = this._calcClientPos(this.overDiv_BottomImg);
            if (cx > cp.x && cy > cp.y && cx < cp.x + 64 && cy < cp.y + 64)
                return this.overDiv_BottomImg;
            return null;
        }
        testOverlay(usedock, cx, cy) {
            if (usedock == false) {
                this.overDiv_FillImg.hidden = true;
                this.overDiv_LeftImg.hidden = true;
                this.overDiv_RightImg.hidden = true;
                this.overDiv_TopImg.hidden = true;
                this.overDiv_BottomImg.hidden = true;
                return;
            }
            var inele = this.pickPanel(this.root, cx, cy);
            if (inele instanceof (panelContainer)) {
                this.overDiv_FillImg.hidden = true;
                this.overDiv_LeftImg.hidden = true;
                this.overDiv_RightImg.hidden = true;
                this.overDiv_TopImg.hidden = true;
                this.overDiv_BottomImg.hidden = true;
                if (inele.subPanels.length == 0) {
                    this.overDiv_FillImg.hidden = false;
                    this.overDiv_FillImg.style.left = (inele.divRoot.clientLeft + inele.divRoot.clientWidth / 2 - 32) + "px";
                    this.overDiv_FillImg.style.top = (inele.divRoot.clientTop + inele.divRoot.clientHeight / 2 - 32) + "px";
                }
            }
            else if (inele instanceof (panel)) {
                this.overDiv_FillImg.hidden = true;
                var pos = this._calcRootPos(inele.divRoot);
                this.overDiv_LeftImg.hidden = false;
                this.overDiv_LeftImg.style.left = (pos.x + inele.divRoot.clientWidth / 2 - 32 - 68) + "px";
                this.overDiv_LeftImg.style.top = (pos.y + inele.divRoot.clientHeight / 2 - 32) + "px";
                this.overDiv_RightImg.hidden = false;
                this.overDiv_RightImg.style.left = (pos.x + inele.divRoot.clientWidth / 2 - 32 + 68) + "px";
                this.overDiv_RightImg.style.top = (pos.y + inele.divRoot.clientHeight / 2 - 32) + "px";
                this.overDiv_TopImg.hidden = false;
                this.overDiv_TopImg.style.left = (pos.x + inele.divRoot.clientWidth / 2 - 32) + "px";
                this.overDiv_TopImg.style.top = (pos.y + inele.divRoot.clientHeight / 2 - 32 - 68) + "px";
                this.overDiv_BottomImg.hidden = false;
                this.overDiv_BottomImg.style.left = (pos.x + inele.divRoot.clientWidth / 2 - 32) + "px";
                this.overDiv_BottomImg.style.top = (pos.y + inele.divRoot.clientHeight / 2 - 32 + 68) + "px";
            }
        }
        _inbox(panel, cx, cy) {
            var divf = panel.divRoot;
            var left = 0;
            var top = 0;
            while (divf != null && divf != this.root.divRoot && divf != this.divRoot) {
                left += divf.offsetLeft;
                top += divf.offsetTop;
                divf = divf.parentElement;
            }
            if (cx < left || cy < top || cx >= (left + panel.divRoot.clientWidth) || cy >= (top + panel.divRoot.clientHeight)) {
                return false;
            }
            return true;
        }
        _setDockPos(div, x, y, r, b) {
            div.style.left = x;
            div.style.top = y;
            div.style.right = r;
            div.style.bottom = b;
            div.style.width = "auto";
            div.style.height = "auto";
        }
        _calcRootPos(div) {
            var divf = div;
            var left = 0;
            var top = 0;
            while (divf != null && divf != this.root.divRoot && divf != this.divRoot) {
                left += divf.offsetLeft;
                top += divf.offsetTop;
                divf = divf.parentElement;
            }
            return { x: left, y: top };
        }
        _calcClientPos(div) {
            var divf = div;
            var left = 0;
            var top = 0;
            while (divf != null) {
                left += divf.offsetLeft;
                top += divf.offsetTop;
                divf = divf.parentElement;
            }
            return { x: left, y: top };
        }
        _calcRootCenterPos() {
            return { x: this.divRoot.clientWidth / 2, y: this.divRoot.clientHeight / 2 };
        }
    }
    lightsPanel.panelMgr = panelMgr;
})(lightsPanel || (lightsPanel = {}));
var lightsPanel;
(function (lightsPanel) {
    class QuickDom {
        static addElement(panel, name) {
            var p = null;
            if (panel instanceof (lightsPanel.panel)) {
                p = panel.divContent;
            }
            else {
                p = panel;
            }
            var e = document.createElement(name);
            p.appendChild(e);
            return e;
        }
        static addA(panel, text, href = null) {
            var e = QuickDom.addElement(panel, "a");
            e.text = text;
            if (href != null)
                e.href = href;
            return e;
        }
        static addSpan(panel, text) {
            var e = QuickDom.addElement(panel, "Span");
            e.textContent = text;
            return e;
        }
        static addSpace(panel, width) {
            var e = QuickDom.addElement(panel, "div");
            e.style.width = width + "px";
            e.style.height = "1px";
            return e;
        }
        static addReturn(panel) {
            var e = QuickDom.addElement(panel, "br");
            return e;
        }
        static addTextInput(panel, text = "") {
            var e = QuickDom.addElement(panel, "input");
            e.type = "text";
            e.value = text;
            return e;
        }
        static addTextInputPassword(panel, text = "") {
            var e = QuickDom.addElement(panel, "input");
            e.type = "password";
            e.value = text;
            return e;
        }
        static addButton(panel, text = "") {
            var e = QuickDom.addElement(panel, "button");
            e.title = text;
            e.value = text;
            e.textContent = text;
            return e;
        }
    }
    lightsPanel.QuickDom = QuickDom;
})(lightsPanel || (lightsPanel = {}));
var lightsPanel;
(function (lightsPanel) {
    class treeNode {
        constructor() {
            this.left = 0;
        }
        getDivForChild() {
            if (this.divForChild != null)
                return this.divForChild;
            this.divForChild = document.createElement("div");
            this.divForChild.style.position = "relative";
            this.divForChild.style.overflow = "auto";
            this.divForChild.style.overflowX = "hidden";
            this.divForChild.style.overflowY = "auto";
            this.divForChild.style.left = "0px";
            this.divNode.appendChild(this.divForChild);
            return this.divForChild;
        }
        MakeLength(len) {
            if (len == 0)
                return;
            if (this.children == null)
                this.children = [];
            for (var i = this.children.length; i < len; i++) {
                var nnode = new treeNode();
                nnode.parent = this;
                this.children.push(nnode);
            }
            for (var i = len; i < this.children.length; i++) {
                this.children[i].hide();
            }
        }
        FillData(treeview, filter, data) {
            this.data = data;
            if (this.divNode == null) {
                this.divNode = document.createElement("div");
                this.divNode.style.position = "relative";
                this.divNode.style.overflow = "auto";
                this.divNode.style.overflowX = "hidden";
                this.divNode.style.overflowY = "auto";
                this.parent.getDivForChild().appendChild(this.divNode);
            }
            if (this.divText == null) {
                this.divChildButton = document.createElement("button");
                this.divChildButton.textContent = "-";
                this.divChildButton.style.position = "relative";
                this.divChildButton.style.width = "24px";
                this.divChildButton.style.left = this.left + "px";
                this.divChildButton.onclick = () => {
                    if (this.divForChild == null)
                        return;
                    this.divForChild.hidden = !this.divForChild.hidden;
                    if (this.divForChild.hidden == true) {
                        this.divChildButton.textContent = "+";
                    }
                    else {
                        this.divChildButton.textContent = "-";
                    }
                };
                this.divText = document.createElement("div");
                this.divText.style.position = "relative";
                this.divText.style.overflow = "auto";
                this.divText.style.overflowX = "hidden";
                this.divText.style.overflowY = "auto";
                var text = document.createElement("a");
                text.style.cursor = "default";
                text.style.position = "relative";
                text.style.left = (this.left) + "px";
                text.hidden = false;
                this.divText.appendChild(this.divChildButton);
                this.divText.appendChild(text);
                this.divNode.appendChild(this.divText);
            }
            treeview.makeSelectEvent(this);
            this.divText.childNodes[1].text = data.name;
            this.divText.childNodes[1].style.color = data.txtcolor;
            var children = filter.getChildren(data);
            this.divChildButton.hidden = (children.length == 0);
            this.MakeLength(children.length);
            for (var i = 0; i < children.length; i++) {
                this.children[i].left = this.left + 16;
                this.children[i].show();
                this.children[i].FillData(treeview, filter, children[i]);
            }
        }
        hide() {
            if (this.divNode != null) {
                this.divNode.hidden = true;
            }
        }
        show() {
            if (this.divNode != null) {
                this.divNode.hidden = false;
            }
        }
    }
    lightsPanel.treeNode = treeNode;
    class treeView {
        constructor(parent) {
            this.nodeRoot = new treeNode();
            this.onSelectItem = null;
            this.selectItem = null;
            this.treeArea = document.createElement("div");
            this.treeArea.className = "full";
            this.treeArea.style.overflow = "auto";
            this.treeArea.style.overflowX = "hidden";
            this.treeArea.style.overflowY = "auto";
            this.treeArea["inv"] = this;
            this.nodeRoot.divForChild = this.treeArea;
            if (parent instanceof lightsPanel.panel) {
                parent.divContent.textContent = "";
                parent.divContent.appendChild(this.treeArea);
            }
            else {
                parent.textContent = "";
                parent.appendChild(this.treeArea);
            }
        }
        onSelect(node) {
            this.selectItem = node;
            if (this.onSelectItem != null) {
                this.onSelectItem(node.divText.childNodes[1].text, node.data);
            }
        }
        makeSelectEvent(node) {
            node.divText.onclick = () => {
                if (this.selectItem != null) {
                    this.selectItem.divText.style.background = "transparent";
                }
                this.onSelect(node);
                if (this.selectItem != null) {
                    this.selectItem.divText.style.background = "#aaa";
                }
            };
        }
        updateData(filter) {
            var child = filter.getChildren(null);
            var ccount = child.length;
            this.nodeRoot.MakeLength(ccount);
            if (this.nodeRoot.children != null) {
                for (var i = 0; i < ccount; i++) {
                    var node = this.nodeRoot.children[i];
                    node.show();
                    node.FillData(this, filter, child[i]);
                }
            }
        }
    }
    lightsPanel.treeView = treeView;
})(lightsPanel || (lightsPanel = {}));
var what;
(function (what) {
    let FuncTag;
    (function (FuncTag) {
        FuncTag[FuncTag["transfer"] = 0] = "transfer";
        FuncTag[FuncTag["DApp_WhoAmI"] = 1] = "DApp_WhoAmI";
    })(FuncTag = what.FuncTag || (what.FuncTag = {}));
    class panel_Function {
        constructor() {
        }
        init(main) {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Function");
            this.panel.divRoot.style.left = "30px";
            this.panel.divRoot.style.top = "200px";
            this.panel.floatWidth = 300;
            this.panel.floatHeight = 350;
            this.panel.canDrag = true;
            this.panel.canScale = true;
            this.panel.onFloat();
            this.setFunc(FuncTag.transfer);
        }
        setFunc(tag) {
            this.panel.divContent.textContent = "";
            if (tag == FuncTag.transfer) {
                lightsPanel.QuickDom.addSpan(this.panel, "Transfer");
            }
            else {
                var btn = lightsPanel.QuickDom.addButton(this.panel, "Transfer");
                btn.onclick = () => {
                    this.setFunc(FuncTag.transfer);
                };
            }
            if (tag == FuncTag.DApp_WhoAmI) {
                lightsPanel.QuickDom.addSpan(this.panel, "DApp_WhoAmI");
            }
            else {
                var btn = lightsPanel.QuickDom.addButton(this.panel, "DApp_WhoAmI");
                btn.onclick = () => {
                    this.setFunc(FuncTag.DApp_WhoAmI);
                };
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            if (tag == FuncTag.transfer) {
                this.initTransfer();
            }
            if (tag == FuncTag.DApp_WhoAmI) {
                this.initDApp_WhoAmI();
            }
        }
        initTransfer() {
            lightsPanel.QuickDom.addSpan(this.panel, "Target");
            var target = lightsPanel.QuickDom.addTextInput(this.panel, "AdzQq1DmnHq86yyDUkU3jKdHwLUe2MLAVv");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "Asset Type:");
            var select = document.createElement("select");
            this.panel.divContent.appendChild(select);
            for (var name in what.CoinTool.name2assetID) {
                var sitem = document.createElement("option");
                sitem.text = name;
                select.appendChild(sitem);
            }
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "Count");
            var count = lightsPanel.QuickDom.addTextInput(this.panel, "");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            var btn = lightsPanel.QuickDom.addButton(this.panel, "MakeTransaction");
            btn.onclick = () => {
                var targetaddr = target.value;
                var asset = select.childNodes[select.selectedIndex].text;
                var assetid = what.CoinTool.name2assetID[asset];
                var _count = Neo.Fixed8.parse(count.value);
                var tran = what.CoinTool.makeTran(this.main.panelUTXO.assets, targetaddr, assetid, _count);
                this.main.panelTransaction.setTran(tran);
            };
            lightsPanel.QuickDom.addElement(this.panel, "br");
        }
        initDApp_WhoAmI() {
            var pkey = this.main.panelLoadKey.pubkey;
            lightsPanel.QuickDom.addSpan(this.panel, "(No need key)");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "Target");
            var target = lightsPanel.QuickDom.addTextInput(this.panel, pkey == null ? "AdzQq1DmnHq86yyDUkU3jKdHwLUe2MLAVv" : this.main.panelLoadKey.address);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            var btn = lightsPanel.QuickDom.addButton(this.panel, "getName");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            var result = lightsPanel.QuickDom.addSpan(this.panel, "result=");
            btn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                var targetaddr = target.value;
                var scriptaddress = "0x42832a25cf11d0ceee5629cb8b4daee9bac207ca";
                var key = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(targetaddr);
                var script = scriptaddress.hexToBytes();
                var r = yield what.WWW.rpc_getStorage(script, key);
                if (r == null || r == undefined) {
                    result.textContent = "no name";
                }
                else {
                    var hex = r.hexToBytes();
                    result.textContent = "name=" + ThinNeo.Helper.Bytes2String(hex);
                }
            });
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            if (pkey != null) {
                var pkeyhash = ThinNeo.Helper.GetPublicKeyScriptHashFromPublicKey(pkey);
                lightsPanel.QuickDom.addSpan(this.panel, "(need key)");
                lightsPanel.QuickDom.addElement(this.panel, "br");
                lightsPanel.QuickDom.addSpan(this.panel, "cur addr=" + this.main.panelLoadKey.address);
                lightsPanel.QuickDom.addElement(this.panel, "br");
                var inputName = lightsPanel.QuickDom.addTextInput(this.panel, "");
                lightsPanel.QuickDom.addElement(this.panel, "br");
                var btnSetName = lightsPanel.QuickDom.addButton(this.panel, "setName");
                btnSetName.onclick = () => {
                    var targetaddr = this.main.panelLoadKey.address;
                    var assetid = what.CoinTool.id_GAS;
                    var _count = Neo.Fixed8.Zero;
                    var tran = what.CoinTool.makeTran(this.main.panelUTXO.assets, targetaddr, assetid, _count);
                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    let script = null;
                    var sb = new ThinNeo.ScriptBuilder();
                    var scriptaddress = "0x42832a25cf11d0ceee5629cb8b4daee9bac207ca".hexToBytes().reverse();
                    sb.EmitPushString(inputName.value);
                    sb.EmitPushBytes(this.main.panelLoadKey.pubkey);
                    sb.EmitAppCall(scriptaddress);
                    tran.extdata.script = sb.ToArray();
                    tran.extdata.gas = Neo.Fixed8.fromNumber(1.0);
                    this.main.panelTransaction.setTran(tran);
                };
            }
        }
    }
    what.panel_Function = panel_Function;
})(what || (what = {}));
var what;
(function (what) {
    class panel_LoadKey {
        constructor() {
        }
        init(main) {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Key Info");
            this.panel.divRoot.style.left = "400px";
            this.panel.divRoot.style.top = "30px";
            this.panel.floatWidth = 400;
            this.panel.floatHeight = 150;
            this.panel.canDrag = true;
            this.panel.canScale = true;
            this.panel.onFloat();
            this.panel.divContent.textContent = "";
            lightsPanel.QuickDom.addSpan(this.panel, "Load NEP6 File");
            var file = document.createElement("input");
            this.panel.divContent.appendChild(file);
            file.type = "file";
            var wallet;
            var reader = new FileReader();
            reader.onload = (e) => {
                var walletstr = reader.result;
                wallet = new ThinNeo.nep6wallet();
                wallet.fromJsonStr(walletstr);
                this.keylist.textContent = "";
                for (var i = 0; i < wallet.accounts.length; i++) {
                    if (wallet.accounts[i].nep2key != null) {
                        let nepkey = wallet.accounts[i].nep2key;
                        var s = wallet.scrypt;
                        var btn = document.createElement("button");
                        btn.textContent = "use " + wallet.accounts[i].address;
                        btn.onclick = () => {
                            var pass = prompt("password?");
                            ThinNeo.Helper.GetPrivateKeyFromNep2(nepkey, pass, s.N, s.r, s.p, (info, result) => {
                                if (info == "finish") {
                                    this.setKey(result);
                                }
                            });
                        };
                        this.keylist.appendChild(btn);
                    }
                }
            };
            file.onchange = (ev) => {
                if (file.files[0].name.includes(".json")) {
                    reader.readAsText(file.files[0]);
                }
            };
            this.keylist = document.createElement("div");
            this.panel.divContent.appendChild(this.keylist);
            this.panel.divContent.appendChild(document.createElement("br"));
            this.spanKey = lightsPanel.QuickDom.addSpan(this.panel, "");
        }
        setKey(key) {
            this.prikey = key;
            this.pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(this.prikey);
            this.address = ThinNeo.Helper.GetAddressFromPublicKey(this.pubkey);
            this.keylist.textContent = "";
            this.spanKey.textContent = "usekey= " + this.address;
            var btn = lightsPanel.QuickDom.addButton(this.keylist, "refresh UTXO");
            btn.onclick = () => {
                this.main.panelUTXO.refresh();
            };
            this.main.panelUTXO.refresh();
        }
    }
    what.panel_LoadKey = panel_LoadKey;
})(what || (what = {}));
var what;
(function (what) {
    class panel_Sign {
        constructor() {
        }
        init(main) {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Sign");
            this.panel.onClose = () => {
                this.panel.hide();
                this.main.panelTransaction.panel.show();
            };
            this.panel.divRoot.style.left = "400px";
            this.panel.divRoot.style.top = "200px";
            this.panel.floatWidth = 1000;
            this.panel.floatHeight = 600;
            this.panel.canDrag = true;
            this.panel.canScale = true;
            this.panel.onFloat();
            this.panel.divContent.textContent = "";
        }
        setTran(tran, inputaddr) {
            if (tran.witnesses == null)
                tran.witnesses = [];
            let txid = tran.GetHash().clone().reverse().toHexString();
            this.panel.divContent.textContent = "";
            var a = lightsPanel.QuickDom.addA(this.panel, "TXID:" + txid, "http://be.nel.group/page/txInfo.html?txid=" + txid);
            a.target = "_blank";
            lightsPanel.QuickDom.addSpan(this.panel, "need witness:");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < inputaddr.length; i++) {
                lightsPanel.QuickDom.addSpan(this.panel, "Withess[" + i + "]:" + inputaddr[i]);
                lightsPanel.QuickDom.addElement(this.panel, "br");
                var hadwit = false;
                for (var w = 0; w < tran.witnesses.length; w++) {
                    if (tran.witnesses[w].Address == inputaddr[i]) {
                        lightsPanel.QuickDom.addSpan(this.panel, "V_script:" + tran.witnesses[w].VerificationScript.toHexString());
                        lightsPanel.QuickDom.addElement(this.panel, "br");
                        lightsPanel.QuickDom.addSpan(this.panel, "I_script:" + tran.witnesses[w].InvocationScript.toHexString());
                        lightsPanel.QuickDom.addElement(this.panel, "br");
                        let witi = w;
                        var btn = lightsPanel.QuickDom.addButton(this.panel, "delete witness");
                        btn.onclick = () => {
                            tran.witnesses.splice(witi, 1);
                            this.setTran(tran, inputaddr);
                            return;
                        };
                        hadwit = true;
                        break;
                    }
                }
                if (hadwit == false) {
                    lightsPanel.QuickDom.addSpan(this.panel, "NoWitness");
                    lightsPanel.QuickDom.addElement(this.panel, "br");
                    if (inputaddr[i] == this.main.panelLoadKey.address) {
                        var btn = lightsPanel.QuickDom.addButton(this.panel, "Add witness by current key");
                        btn.onclick = () => {
                            var msg = tran.GetMessage();
                            var pubkey = this.main.panelLoadKey.pubkey;
                            var signdata = ThinNeo.Helper.Sign(msg, this.main.panelLoadKey.prikey);
                            tran.AddWitness(signdata, pubkey, this.main.panelLoadKey.address);
                            this.setTran(tran, inputaddr);
                        };
                    }
                }
                lightsPanel.QuickDom.addElement(this.panel, "hr");
                var btn = lightsPanel.QuickDom.addButton(this.panel, "boardcast it.");
                btn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                    var result = yield what.WWW.rpc_postRawTransaction(tran.GetRawData());
                    if (result == true) {
                        alert("txid=" + txid);
                    }
                });
            }
        }
    }
    what.panel_Sign = panel_Sign;
})(what || (what = {}));
var what;
(function (what) {
    class panel_State {
        constructor() {
        }
        init(main) {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("API States(Refresh per 1 sec)");
            this.panel.divRoot.style.left = "30px";
            this.panel.divRoot.style.top = "30px";
            this.panel.floatWidth = 300;
            this.panel.floatHeight = 150;
            this.panel.canDrag = true;
            this.panel.canScale = true;
            this.panel.onFloat();
            this.panel.divContent.textContent = "";
            lightsPanel.QuickDom.addSpan(this.panel, "API=" + what.WWW.api);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            this.spanAPIHeight = lightsPanel.QuickDom.addSpan(this.panel, "");
            lightsPanel.QuickDom.addElement(this.panel, "br");
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                this.spanAPIHeight.textContent = "API height=" + (yield what.WWW.api_getHeight());
            });
        }
    }
    what.panel_State = panel_State;
})(what || (what = {}));
var what;
(function (what) {
    class panel_Transaction {
        constructor() {
        }
        init(main) {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Transaction");
            this.panel.divRoot.style.left = "400px";
            this.panel.divRoot.style.top = "200px";
            this.panel.floatWidth = 1000;
            this.panel.floatHeight = 600;
            this.panel.canDrag = true;
            this.panel.canScale = true;
            this.panel.onFloat();
            this.panel.divContent.textContent = "";
        }
        setTran(tran) {
            this.panel.divContent.textContent = "";
            lightsPanel.QuickDom.addSpan(this.panel, "type=" + ThinNeo.TransactionType[tran.type].toString());
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "version=" + tran.version);
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            var inputAddrs = [];
            lightsPanel.QuickDom.addSpan(this.panel, "inputcount=" + tran.inputs.length);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < tran.inputs.length; i++) {
                var _addr = tran.inputs[i]["_addr"];
                if (inputAddrs.indexOf(_addr) < 0) {
                    inputAddrs.push(_addr);
                }
                var rhash = tran.inputs[i].hash.clone().reverse();
                var inputhash = rhash.toHexString();
                var outstr = "    input[" + i + "]" + inputhash + "(" + tran.inputs[i].index + ")";
                var a = lightsPanel.QuickDom.addA(this.panel, outstr, "http://be.nel.group/page/txInfo.html?txid=" + inputhash);
                a.target = "_blank";
                lightsPanel.QuickDom.addElement(this.panel, "br");
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            lightsPanel.QuickDom.addSpan(this.panel, "outputcount=" + tran.outputs.length);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < tran.outputs.length; i++) {
                var addrt = tran.outputs[i].toAddress;
                var address = ThinNeo.Helper.GetAddressFromScriptHash(addrt);
                var a = lightsPanel.QuickDom.addA(this.panel, "    outputs[" + i + "]" + address, "http://be.nel.group/page/address.html?addr=" + address);
                a.target = "_blank";
                var assethash = tran.outputs[i].assetId.clone().reverse();
                var assetid = "0x" + assethash.toHexString();
                if (inputAddrs.length == 1 && address == inputAddrs[0]) {
                    lightsPanel.QuickDom.addSpan(this.panel, "    (change)" + what.CoinTool.assetID2name[assetid] + "=" + tran.outputs[i].value.toString());
                }
                else {
                    lightsPanel.QuickDom.addSpan(this.panel, "    " + what.CoinTool.assetID2name[assetid] + "=" + tran.outputs[i].value.toString());
                }
                lightsPanel.QuickDom.addElement(this.panel, "br");
            }
            if (tran.type == ThinNeo.TransactionType.InvocationTransaction && tran.extdata != null) {
                var scriptdata = tran.extdata;
                lightsPanel.QuickDom.addElement(this.panel, "hr");
                lightsPanel.QuickDom.addSpan(this.panel, "call script:");
                var ops = ThinNeo.Compiler.Avm2Asm.Trans(scriptdata.script);
                for (var i = 0; i < ops.length; i++) {
                    lightsPanel.QuickDom.addSpan(this.panel, ops[i].toString());
                    lightsPanel.QuickDom.addElement(this.panel, "br");
                }
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            let msg = tran.GetMessage();
            var msglen = msg.length;
            var txid = tran.GetHash().toHexString();
            lightsPanel.QuickDom.addSpan(this.panel, "--this TXLen=" + msglen);
            lightsPanel.QuickDom.addSpan(this.panel, "--this TXID=" + txid);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < inputAddrs.length; i++) {
                lightsPanel.QuickDom.addSpan(this.panel, "must witness[" + i + "]=" + inputAddrs[i]);
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            var btnsign = lightsPanel.QuickDom.addButton(this.panel, "Sign");
            btnsign.onclick = () => {
                this.panel.hide();
                tran.witnesses = [];
                this.main.panelSign.setTran(tran, inputAddrs);
                this.main.panelSign.panel.show();
            };
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            lightsPanel.QuickDom.addSpan(this.panel, msg.toHexString());
        }
    }
    what.panel_Transaction = panel_Transaction;
})(what || (what = {}));
var what;
(function (what) {
    class panel_UTXO {
        constructor() {
        }
        init(main) {
            return __awaiter(this, void 0, void 0, function* () {
                this.main = main;
                this.panel = lightsPanel.panelMgr.instance().createPanel("UTXO");
                this.panel.divRoot.style.left = "920px";
                this.panel.divRoot.style.top = "30px";
                this.panel.floatWidth = 400;
                this.panel.floatHeight = 150;
                this.panel.canDrag = true;
                this.panel.canScale = true;
                this.panel.onFloat();
                this.panel.divContent.textContent = "";
                this.tree = new lightsPanel.treeView(this.panel);
            });
        }
        refresh() {
            return __awaiter(this, void 0, void 0, function* () {
                var utxos = yield what.WWW.api_getUTXO(this.main.panelLoadKey.address);
                this.assets = {};
                for (var i in utxos) {
                    var item = utxos[i];
                    var txid = item.txid;
                    var n = item.n;
                    var asset = item.asset;
                    var count = item.value;
                    if (this.assets[asset] == undefined) {
                        this.assets[asset] = [];
                    }
                    var utxo = new UTXO();
                    utxo.addr = item.addr;
                    utxo.asset = asset;
                    utxo.n = n;
                    utxo.txid = txid;
                    utxo.count = Neo.Fixed8.parse(count);
                    this.assets[asset].push(utxo);
                }
                this.tree.updateData(new Filter(this.assets));
            });
        }
    }
    what.panel_UTXO = panel_UTXO;
    class UTXO {
    }
    what.UTXO = UTXO;
    class Filter {
        constructor(assets) {
            this.assets = assets;
        }
        getChildren(rootObj) {
            if (rootObj == null) {
                var item = [];
                for (var asset in this.assets) {
                    var name = what.CoinTool.assetID2name[asset];
                    var count = Neo.Fixed8.Zero;
                    for (var i in this.assets[asset]) {
                        var utxo = this.assets[asset][i];
                        count = count.add(utxo.count);
                    }
                    item.push({ "name": name + " count=" + count.toString(), "txtcolor": "FFF", "asset": asset });
                }
                return item;
            }
            else {
                if (rootObj["asset"] != undefined) {
                    var utxos = this.assets[rootObj["asset"]];
                    var item = [];
                    for (var i in utxos) {
                        var utxo = utxos[i];
                        item.push({ "name": utxo.count, "txtcolor": "FFF", "asset": asset });
                    }
                    return item;
                }
                return [];
            }
        }
    }
})(what || (what = {}));
var what;
(function (what) {
    class CoinTool {
        static initAllAsset() {
            return __awaiter(this, void 0, void 0, function* () {
                var allassets = yield what.WWW.api_getAllAssets();
                for (var a in allassets) {
                    var asset = allassets[a];
                    var names = asset.name;
                    var id = asset.id;
                    var name = "";
                    if (id == CoinTool.id_GAS) {
                        name = "GAS";
                    }
                    else if (id == CoinTool.id_NEO) {
                        name = "NEO";
                    }
                    else {
                        for (var i in names) {
                            name = names[i].name;
                            if (names[i].lang == "en")
                                break;
                        }
                    }
                    CoinTool.assetID2name[id] = name;
                    CoinTool.name2assetID[name] = id;
                }
            });
        }
        static makeTran(utxos, targetaddr, assetid, sendcount) {
            var tran = new ThinNeo.Transaction();
            tran.type = ThinNeo.TransactionType.ContractTransaction;
            tran.version = 0;
            tran.extdata = null;
            tran.attributes = [];
            tran.inputs = [];
            var scraddr = "";
            utxos[assetid].sort((a, b) => {
                return a.count.compareTo(b.count);
            });
            var us = utxos[assetid];
            var count = Neo.Fixed8.Zero;
            for (var i = 0; i < us.length; i++) {
                var input = new ThinNeo.TransactionInput();
                input.hash = us[i].txid.hexToBytes().reverse();
                input.index = us[i].n;
                input["_addr"] = us[i].addr;
                tran.inputs.push(input);
                count = count.add(us[i].count);
                scraddr = us[i].addr;
                if (count.compareTo(sendcount) > 0) {
                    break;
                }
            }
            if (count.compareTo(sendcount) >= 0) {
                tran.outputs = [];
                if (sendcount.compareTo(Neo.Fixed8.Zero) > 0) {
                    var output = new ThinNeo.TransactionOutput();
                    output.assetId = assetid.hexToBytes().reverse();
                    output.value = sendcount;
                    output.toAddress = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(targetaddr);
                    tran.outputs.push(output);
                }
                var change = count.subtract(sendcount);
                if (change.compareTo(Neo.Fixed8.Zero) > 0) {
                    var outputchange = new ThinNeo.TransactionOutput();
                    outputchange.toAddress = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(scraddr);
                    outputchange.value = change;
                    outputchange.assetId = assetid.hexToBytes().reverse();
                    tran.outputs.push(outputchange);
                }
            }
            else {
                throw new Error("no enough money.");
            }
            return tran;
        }
    }
    CoinTool.id_GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    CoinTool.id_NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
    CoinTool.assetID2name = {};
    CoinTool.name2assetID = {};
    what.CoinTool = CoinTool;
})(what || (what = {}));
var what;
(function (what) {
    class WWW {
        static makeRpcUrl(url, method, ..._params) {
            if (url[url.length - 1] != '/')
                url = url + "/";
            var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
            for (var i = 0; i < _params.length; i++) {
                urlout += JSON.stringify(_params[i]);
                if (i != _params.length - 1)
                    urlout += ",";
            }
            urlout += "]";
            return urlout;
        }
        static makeRpcPostBody(method, ..._params) {
            var body = {};
            body["jsonrpc"] = "2.0";
            body["id"] = 1;
            body["method"] = method;
            var params = [];
            for (var i = 0; i < _params.length; i++) {
                params.push(_params[i]);
            }
            body["params"] = params;
            return body;
        }
        static api_getHeight() {
            return __awaiter(this, void 0, void 0, function* () {
                var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
                var result = yield fetch(str, { "method": "get" });
                var json = yield result.json();
                var r = json["result"];
                var height = parseInt(r[0]["blockcount"]) - 1;
                return height;
            });
        }
        static api_getAllAssets() {
            return __awaiter(this, void 0, void 0, function* () {
                var str = WWW.makeRpcUrl(WWW.api, "getallasset");
                var result = yield fetch(str, { "method": "get" });
                var json = yield result.json();
                var r = json["result"];
                return r;
            });
        }
        static api_getUTXO(address) {
            return __awaiter(this, void 0, void 0, function* () {
                var str = WWW.makeRpcUrl(WWW.api, "getutxo", address);
                var result = yield fetch(str, { "method": "get" });
                var json = yield result.json();
                var r = json["result"];
                return r;
            });
        }
        static rpc_getHeight() {
            return __awaiter(this, void 0, void 0, function* () {
                var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
                var result = yield fetch(str, { "method": "get" });
                var json = yield result.json();
                var r = json["result"];
                var height = parseInt(r) - 1;
                return height;
            });
        }
        static rpc_postRawTransaction(data) {
            return __awaiter(this, void 0, void 0, function* () {
                var postdata = WWW.makeRpcPostBody("sendrawtransaction", data.toHexString());
                var result = yield fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
                var json = yield result.json();
                var r = json["result"][0]["sendrawtransactionresult"];
                return r;
            });
        }
        static rpc_getStorage(scripthash, key) {
            return __awaiter(this, void 0, void 0, function* () {
                var str = WWW.makeRpcUrl(WWW.api, "getstorage", scripthash.toHexString(), key.toHexString());
                var result = yield fetch(str, { "method": "get" });
                var json = yield result.json();
                if (json["result"] == null)
                    return null;
                var r = json["result"][0];
                return r["storagevalue"];
            });
        }
    }
    WWW.api = "https://api.nel.group/api/testnet";
    WWW.rpc = "http://47.96.168.8:20332/testnet";
    WWW.rpcName = "";
    what.WWW = WWW;
})(what || (what = {}));
//# sourceMappingURL=code.js.map