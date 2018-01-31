namespace lightsPanel
{
    export interface IPanel
    {
        divRoot: HTMLDivElement;
        //subPanels: IPanel[];
        container: panelContainer;
        onDock(container: panelContainer);
    }
    export enum direction
    {
        H_Left,
        H_Right,
        V_Top,
        V_Bottom,
    }
    export class panel implements IPanel
    {
        container: panelContainer;
        divRoot: HTMLDivElement = null;
        subPanels: IPanel[] = null;
        name: string;
        divTitle: HTMLDivElement = null;
        divContent: HTMLDivElement = null;
        divResize: HTMLDivElement = null;
        btnFloat: HTMLButtonElement = null;
        btnClose: HTMLButtonElement = null;
        onClose: () => void = null;
        floatWidth: number;
        floatHeight: number;
        isFloat: boolean = false;
        canDrag: boolean = true;
        canScale: boolean = true;
        canDock: boolean = true;
        constructor(div: HTMLDivElement)
        {
            this.divRoot = div;
            this.divRoot["inv"] = this;
            for (var i = 0; i < this.divRoot.childElementCount; i++)
            {
                var div = this.divRoot.children[i] as HTMLDivElement;
                if (div != undefined && div.className == "dialog-content")
                {
                    this.divContent = div;
                    break;
                }
            }
        }
        setTitleText(txt: string)
        {
            var a = (this.divTitle.children[1] as HTMLAnchorElement);
            a.text = txt;
        }
        setTitle(txt: string, img: string = null)
        {
            var a = (this.divTitle.children[1] as HTMLAnchorElement);
            a.text = txt;
            var i = (this.divTitle.children[0] as HTMLImageElement);
            if (img == null)
            {
                i.hidden = true;
            }
            else
            {
                i.hidden = false;
                if (img != "-")
                    i.src = img;
            }
        }
        splitWith(p: panel, dir: direction, v: number)// x: number, y: number, w: number, h: number)
        {
            var parent = this.container;
            var pc: panelContainer = null;
            if (this.container.subPanels.length < this.container.maxPanelCount)
            {
                pc = this.container;
            }
            else
            {
                for (var i in parent.subPanels)
                {
                    if (parent.subPanels[i] == this)
                    {
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
            if (dir == direction.H_Left)
            {
                this.divRoot.style.left = "1px";
                p.divRoot.style.left = "0px";
            }
            else if (dir == direction.H_Right)
            {
                p.divRoot.style.left = "1px";
                this.divRoot.style.left = "0px";
            }
            else if (dir == direction.V_Top)
            {
                this.divRoot.style.top = "1px";
                p.divRoot.style.top = "0px";
            }
            else if (dir == direction.V_Bottom)
            {
                p.divRoot.style.top = "1px";
                this.divRoot.style.top = "0px";
            }
            pc.addSubPanel(p);
            pc.onSplit(dir, v);

            return;
        }
        //    }
        //}
        onDock(container: panelContainer)
        {
            this.container = container;
            this.isFloat = false;
            this.divRoot.style.boxShadow = "0px";
            this.btnFloat.hidden = !this.canDrag;
            this.btnClose.hidden = true;
            this.divResize.hidden = true;
            this.divTitle.style.cursor = "auto";

        }
        makeMini(width: number, height: number)
        {
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
        onFloat()
        {
            this.isFloat = true;
            this.divRoot.style.boxShadow = "1px 1px 3px #292929";
            this.btnFloat.hidden = true;
            if (this.onClose != null)
                this.btnClose.hidden = false;
            else
                this.btnClose.hidden = true;

            if (this.canDrag)
            {
                this.divTitle.style.cursor = "move";
            }
            else
            {
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

            //先看超尺寸，缩小他
            if (this.floatWidth > panelMgr.instance().width - 32 - pos.x)
            {
                this.floatWidth = panelMgr.instance().width - 32 - pos.x;
            }
            if (this.floatHeight > panelMgr.instance().height - 32 - pos.y)
            {
                this.floatHeight = panelMgr.instance().height - 32 - pos.y;
            }
            //再看极限尺寸
            if (this.floatWidth < 100)
            {
                this.floatWidth = 100;
            }
            if (this.floatHeight < 100)
            {
                this.floatHeight = 100;
            }
            //再看不要出街
            if (pos.x > panelMgr.instance().width - this.floatWidth)
            {
                pos.x = panelMgr.instance().width - this.floatWidth;
            }
            if (pos.y > panelMgr.instance().height - this.floatHeight)
            {
                pos.y = panelMgr.instance().height - this.floatHeight;
            }
            this.divRoot.style.left = pos.x + "px";
            this.divRoot.style.top = pos.y + "px";
            this.divRoot.style.right = "auto";
            this.divRoot.style.bottom = "auto";
            this.divRoot.style.width = this.floatWidth + "px";
            this.divRoot.style.height = this.floatHeight + "px";
        }
        toCenter()
        {
            if (this.isFloat == false)
                return;
            this.divRoot.style.left = (panelMgr.instance().width - this.floatWidth) / 2 + "px";
            this.divRoot.style.top = (panelMgr.instance().height - this.floatHeight) / 2 + "px";
        }

        show()
        {
            this.divRoot.hidden = false;
        }
        hide()
        {
            this.divRoot.hidden = true;
        }
    }
    export class panelContainer implements IPanel
    {
        divRoot: HTMLDivElement = null;
        subPanels: IPanel[] = [];
        container: panelContainer;
        get maxPanelCount(): number
        {
            return 2;
        }
        constructor(div: HTMLDivElement)
        {
            this.divRoot = div;
            this.divRoot["inv"] = this;
        }
        scalew: number;
        scaleh: number;
        divScale: HTMLDivElement = null;
        onSplit(dir: direction, v: number)//,w: number, h: number)
        {
            if (dir == direction.H_Left || dir == direction.H_Right)
            {
                this.scalew = v;
                this.scaleh = 1;
            }
            else
            {
                this.scalew = 1;
                this.scaleh = v;
            }
            //this.scalew = w;
            //this.scaleh = h;
            this._doSplit();
        }
        _doSplit()
        {
            var mgr = panelMgr.instance();

            if (this.divScale == null)
            {
                this.divScale = document.createElement("div");
                this.divRoot.appendChild(this.divScale);
                this.divScale.className = "dialog-split";
                this.divScale.style.position = "absolute";
                this.divScale.style.zIndex = "1000";
            }
            this.divScale.hidden = false;
            if (this.scaleh == 1)//水平
            {
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
                for (var i = 0; i < this.subPanels.length; i++)
                {
                    var subdiv = this.subPanels[i].divRoot;
                    if (subdiv.style.left == "0px")
                    {
                        mgr._setDockPos(subdiv, "0px", "0px", (1 - this.scalew) * 100 + "%", "0px");
                    }
                    else
                    {
                        mgr._setDockPos(subdiv, (this.scalew * 100) + "%", "0px", "0px", "0px");
                    }
                }
            }
            else if (this.scalew == 1)//垂直
            {
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
                for (var i = 0; i < this.subPanels.length; i++)
                {
                    var subdiv = this.subPanels[i].divRoot;
                    if (subdiv.style.top == "0px")
                    {
                        mgr._setDockPos(subdiv, "0px", "0px", "0px", (1 - this.scaleh) * 100 + "%");
                    }
                    else
                    {
                        mgr._setDockPos(subdiv, "0px", (this.scaleh * 100) + "%", "0px", "0px");
                    }
                }

            }
            else
            {
                throw new Error("无效数据");
            }

        }
        onDock(container: panelContainer)
        {
            this.container = container;
        }
        addSubPanel(p: IPanel, pos: number = -1)
        {
            if (p.divRoot.parentElement != null)
            {
                p.divRoot.parentElement.removeChild(p.divRoot);
            }
            if (p.container != null)
            {
                p.container.removeSubPanel(p);
            }
            this.divRoot.appendChild(p.divRoot);
            if (pos < 0)
                this.subPanels.push(p);
            else
            {
                this.subPanels[pos] = p;
            }
            p.onDock(this);
        }
        removeSubPanel(p: IPanel)
        {
            var i = this.subPanels.indexOf(p);
            if (i >= 0)
            {
                this.subPanels.splice(i, 1);
                this.divRoot.removeChild(p.divRoot);

            }
            if (this.subPanels.length == 1)
            {
                this._fillStyle(this.subPanels[0].divRoot);
            }
            if (this.subPanels.length == 0 && this.container != null)
            {
                this.container.removeSubPanel(this);
            }
            p.container = null;
            if (this.subPanels.length < 2)
            {
                if (this.divScale != null)
                    this.divScale.hidden = true;
            }
        }
        _fillStyle(div: HTMLDivElement)
        {
            div.style.left = "0px";
            div.style.top = "0px";
            div.style.width = "auto";
            div.style.height = "auto";
            div.style.right = "0px";
            div.style.bottom = "0px";
        }
        fill(p: IPanel)
        {
            this.addSubPanel(p);
            this._fillStyle(p.divRoot);
            p.onDock(this);
        }

    }

    //面板管理器
    export class panelMgr
    {
        private static g_this: panelMgr;
        static instance(): panelMgr
        {
            if (panelMgr.g_this == null)
                panelMgr.g_this = new panelMgr();
            return panelMgr.g_this;
        }
        get width(): number
        {
            return this.divRoot.clientWidth;
        }
        get height(): number
        {
            return this.divRoot.clientHeight;
        }
        //面板字典
        //private mapPanel: { [id: string]: panel } = {};

        private urlfill: string = "data:image/png;base64,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";
        private urlleft: string = "data:image/png;base64,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";
        private divRoot: HTMLDivElement = null;
        root: panelContainer = null;    //面板层
        private floatDiv: HTMLDivElement = null;//漂浮层
        private overDiv: HTMLDivElement = null;//覆盖层
        private overDiv_Show: HTMLDivElement = null;//覆盖层
        private overDiv_FillImg: HTMLImageElement = null;
        private overDiv_LeftImg: HTMLImageElement = null;
        private overDiv_RightImg: HTMLImageElement = null;
        private overDiv_TopImg: HTMLImageElement = null;
        private overDiv_BottomImg: HTMLImageElement = null;

        private backimg: HTMLImageElement = null;
        setbackImg(url: string)
        {
            this.backimg.src = url;
        }
        //初始化面板
        init(div: HTMLDivElement): void
        {
            this.divRoot = div;

            //背景
            this.backimg = document.createElement("img");
            this.backimg.style.position = "absoutle";
            this.backimg.style.width = "100%";
            this.backimg.style.height = "100%";
            this.divRoot.appendChild(this.backimg);
            //面板层


            var panelDiv = document.createElement("div");
            panelDiv.className = "full";
            panelDiv.style.zIndex = "1";
            this.divRoot.appendChild(panelDiv);

            this.root = new panelContainer(panelDiv);

            //漂浮层
            this.floatDiv = document.createElement("div");
            this.floatDiv.className = "full";
            this.floatDiv.style.zIndex = "2";
            this.floatDiv.style.width = "0px";
            this.floatDiv.style.overflow = "visible";
            this.divRoot.appendChild(this.floatDiv);

            //覆叠层
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
            var dialog: HTMLDivElement = null;
            var overobj: HTMLImageElement = null;
            var btouch = false;
            var onDown: (ele: HTMLElement, x: number, y: number) => boolean = (ele, clientX, clientY) =>
            {
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

                if (stin == "dialog-title")
                {
                    var float = (ele.parentElement["inv"] as panel).isFloat;
                    var drag = (ele.parentElement["inv"] as panel).canDrag;
                    if (float == false || drag == false) return;
                    var p = this._calcClientPos(ele as HTMLDivElement);

                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 1;
                    dialog = ele.parentElement as HTMLDivElement;
                    this._moveTop(dialog);
                    this.overDiv.hidden = false;
                }
                else if (stinp == "dialog-title")
                {
                    var float = (ele.parentElement.parentElement["inv"] as panel).isFloat;
                    var drag = (ele.parentElement.parentElement["inv"] as panel).canDrag;
                    if (float == false || drag == false) return;
                    var p = this._calcClientPos(ele as HTMLDivElement);

                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 1;
                    dialog = ele.parentElement.parentElement as HTMLDivElement;
                    this._moveTop(dialog);
                    this.overDiv.hidden = false;
                }
                else if (stin == "dialog-resize")
                {
                    var float = (ele.parentElement["inv"] as panel).isFloat;
                    if (float == false) return;
                    var p = this._calcClientPos(ele as HTMLDivElement);

                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 2;
                    dialog = ele.parentElement as HTMLDivElement;
                    this._moveTop(dialog);
                    return true;
                }
                else if (stin == "dialog-split")
                {
                    var p = this._calcClientPos(ele as HTMLDivElement);
                    px = clientX - p.x;
                    py = clientY - p.y;
                    mode = 3;
                    dialog = ele.parentElement as HTMLDivElement;
                    return true;
                }
                else
                {
                    var dd = ele;
                    while (dd != null)
                    {
                        if (dd.className == "dialog" && dd instanceof HTMLDivElement)
                        {
                            this._moveTop(dd as HTMLDivElement);
                            break;
                        }
                        dd = dd.parentElement;
                    }
                    return false;
                }


            };
            var onUp: (x: number, y: number) => boolean = (clientX, clientY) =>
            {
                mode = 0;
                this.overDiv.hidden = true;

                if (overobj == null)
                {
                    return false;
                }
                else if (overobj.id == "overDiv_FillImg")
                {
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panelContainer))
                    {
                        inele.fill(dialog["inv"]);
                    }
                    return true;

                }
                else if (overobj.id == "overDiv_LeftImg")
                {
                    overobj = null;
                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel))
                    {
                        inele.splitWith(dialog["inv"], direction.H_Left, 0.5);
                    }
                    return true;

                }
                else if (overobj.id == "overDiv_RightImg")
                {
                    overobj = null;

                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel))
                    {
                        inele.splitWith(dialog["inv"], direction.H_Right, 0.5);
                    }
                    return true;

                }
                else if (overobj.id == "overDiv_TopImg")
                {
                    overobj = null;

                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel))
                    {
                        inele.splitWith(dialog["inv"], direction.V_Top, 0.5);
                    }
                    return true;

                }
                else if (overobj.id == "overDiv_BottomImg")
                {
                    overobj = null;

                    var inele = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (inele instanceof (panel))
                    {
                        inele.splitWith(dialog["inv"], direction.V_Bottom, 0.5);
                    }
                    return true;
                }
                else
                {
                    return false;
                }
            };
            var onMove: (x: number, y: number) => boolean = (clientX, clientY) =>
            {
                if (mode == 1)//move mode
                {
                    var pp = this.pickPanel(this.root, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    if (pp == null) return;

                    var dock = (dialog["inv"] as panel).canDock;
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
                    if (dock)
                    {
                        overobj = this.pickOverLay(clientX, clientY);
                    }
                    else
                    {
                        overobj = null;
                    }
                    if (overobj == null)
                    {
                        this.overDiv_Show.hidden = true;

                    }
                    else if (overobj.id == "overDiv_FillImg")
                    {
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
                    else if (overobj.id == "overDiv_LeftImg" && overobj.hidden == false)
                    {
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
                    else if (overobj.id == "overDiv_RightImg" && overobj.hidden == false)
                    {
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
                    else if (overobj.id == "overDiv_TopImg" && overobj.hidden == false)
                    {
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
                    else if (overobj.id == "overDiv_BottomImg" && overobj.hidden == false)
                    {
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
                    else
                    {
                        this.overDiv_Show.hidden = true;
                    }
                    var left = (clientX - (this.divRoot.offsetLeft + px));
                    var top = (clientY - (this.divRoot.offsetTop + py));
                    if (left < 0) left = 0;
                    if (left > this.divRoot.offsetWidth - dialog.offsetWidth)
                    {
                        left = this.divRoot.offsetWidth - dialog.offsetWidth;
                    }
                    if (top < 0) top = 0;
                    if (top > this.divRoot.offsetHeight - dialog.offsetHeight)
                    {
                        top = this.divRoot.offsetHeight - dialog.offsetHeight;
                    }
                    dialog.style.left = left + "px";
                    dialog.style.top = top + "px";
                    this.testOverlay(dock, clientX - this.divRoot.offsetLeft, clientY - this.divRoot.offsetTop);
                    return true;
                }
                else if (mode == 2)//resize mode
                {
                    var width = (clientX - (this.divRoot.offsetLeft - px)) - dialog.offsetLeft;
                    if (width < 100) width = 100;
                    if (width > this.divRoot.offsetWidth - dialog.offsetLeft) width = this.divRoot.offsetWidth - dialog.offsetLeft;
                    var height = (clientY - (this.divRoot.offsetTop - py)) - dialog.offsetTop;
                    if (height < 100) height = 100;
                    if (height > this.divRoot.offsetHeight - dialog.offsetTop) height = this.divRoot.offsetHeight - dialog.offsetTop;
                    dialog.style.width = width + "px";
                    dialog.style.height = height + "px";
                    var p = dialog["inv"] as panel;
                    p.floatWidth = width;
                    p.floatHeight = height;
                    return true;
                }
                else if (mode == 3)//split mode
                {
                    var pos = this._calcRootPos(dialog);
                    var left = (clientX - (this.divRoot.offsetLeft - px)) - dialog.offsetLeft;
                    var top = (clientY - (this.divRoot.offsetTop - py)) - dialog.offsetTop;

                    //限位
                    if (left < 100) left = 100;
                    if (top < 100) top = 100;
                    if (left > dialog.offsetWidth - 100) left = dialog.offsetWidth - 100;
                    if (top > dialog.offsetHeight - 100) top = dialog.offsetHeight - 100;

                    //算比例
                    var w = left / dialog.offsetWidth;
                    var h = top / dialog.offsetHeight;

                    var pc = dialog["inv"] as panelContainer;

                    if (dialog.offsetWidth < 200) w = pc.scalew;
                    if (dialog.offsetHeight < 200) h = pc.scaleh;

                    if (pc.scalew == 1) pc.onSplit(direction.V_Top, h);
                    if (pc.scaleh == 1) pc.onSplit(direction.H_Left, w);
                    return true;
                }
                else
                {
                    return false;
                }
            };
            //if (document.hasOwnProperty("ontouchstart")) 
            {
                var lastx: number;
                var lasty: number;
                //alert("cool");
                this.divRoot.addEventListener("touchstart", (ev: TouchEvent) =>
                {
                    btouch = true;
                    lastx = ev.touches[0].clientX;
                    lasty = ev.touches[0].clientY;
                    var b = onDown(ev.target as HTMLElement, lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
                this.divRoot.addEventListener("touchend", (ev: TouchEvent) =>
                {
                    var b = onUp(lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
                this.divRoot.addEventListener("touchcancel", (ev: TouchEvent) =>
                {
                    var b = onUp(lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });

                this.divRoot.addEventListener("touchmove", (ev: TouchEvent) =>
                {
                    lastx = ev.touches[0].clientX;
                    lasty = ev.touches[0].clientY;

                    var b = onMove(lastx, lasty);
                    if (b)
                        ev.preventDefault();
                });
            }
            //else
            {
                this.divRoot.addEventListener("mousedown", (ev: MouseEvent) =>
                {
                    onDown(ev.target as HTMLElement, ev.clientX, ev.clientY);
                });
                this.divRoot.addEventListener("mouseup", (ev: MouseEvent) =>
                {
                    onUp(ev.clientX, ev.clientY);
                });
                this.divRoot.addEventListener("mousemove", (ev: MouseEvent) =>
                {
                    onMove(ev.clientX, ev.clientY);
                });
            }


        }
        //拣选面板
        pickPanel(panel: IPanel, cx, cy): IPanel
        {
            var b = this._inbox(panel, cx, cy);
            if (!b)
                return null;
            if (panel instanceof panelContainer)
            {
                for (var p in (panel as panelContainer).subPanels)
                {
                    var sp = this.pickPanel((panel as panelContainer).subPanels[p], cx, cy);
                    if (sp != null)
                        return sp;
                }
            }
            return panel;
        }

        createPanel(name: string, width: number = 200, height: number = 200, customctor: (div: HTMLDivElement) => panel = null): panel
        {
            //dialog
            var div = document.createElement("div");
            div.className = "dialog";
            this.floatDiv.appendChild(div);
            //title
            var title = document.createElement("div");
            title.className = "dialog-title";
            //title.textContent = "";
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

            //context
            var content = document.createElement("div");
            content.className = "dialog-content";
            //content.textContent = "created float panel";
            div.appendChild(content);
            //var btn = document.createElement("button");
            //btn.textContent = "good";
            //content.appendChild(btn);
            //resize
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
            button.onclick = () =>
            {
                this.floatPanel(p);
            }
            var buttonClose = document.createElement("button");
            buttonClose.textContent = "X";
            title.appendChild(buttonClose);
            buttonClose.style.position = "absolute";
            buttonClose.style.right = "4px";
            buttonClose.style.top = "4px";
            buttonClose.style.bottom = "4px";
            buttonClose.style.width = "20px";
            buttonClose.style.lineHeight = "22px";
            buttonClose.onclick = () =>
            {
                p.onClose();
            }
            var p: panel = null;
            if (customctor != null)
            {
                p = customctor(div);
            }
            else
            {
                p = new panel(div);
            }
            p.divTitle = title;
            p.divContent = content;
            p.divResize = resize;
            p.btnFloat = button;
            p.btnClose = buttonClose;
            p.name = name;
            p.isFloat = true;
            //this.mapPanel[name] = p;
            p.floatWidth = width;
            p.floatHeight = height;
            p.onFloat();

            return p;
        }
        toTop(panel: panel)
        {
            if (panel != null)
            {
                this._moveTop(panel.divRoot);
            }
        }

        //让一个面板漂浮起来
        floatPanel(panel: panel)
        {
            if (panel instanceof (panelContainer))
            {
                throw new Error("panelContainer can't be float.");
            }
            if (panel.container == null)
                return;
            panel.onFloat();

            panel.container.removeSubPanel(panel);
            this.floatDiv.appendChild(panel.divRoot);
        }
        removePanel(panel: panel)
        {
            if (panel.isFloat == false)
            {
                this.floatPanel(panel);
            }
            this.floatDiv.removeChild(panel.divRoot);
        }
        fillPanel(panel: panel)
        {
            if (this.root.subPanels.length > 0)
            {
                throw new Error("只有在空的时候可以用");
            }
            this.root.fill(panel);
        }
        private _moveTop(divsrc: HTMLDivElement)
        {
            if (divsrc.style.zIndex == "")
                divsrc.style.zIndex = "1";
            var zme = parseInt(divsrc.style.zIndex);

            var needdec = false;
            for (var i = 0; i < this.floatDiv.childElementCount; i++)
            {
                var div = this.floatDiv.children[i] as HTMLDivElement;
                if (div == divsrc)
                    continue;
                if (div.style == undefined && div.style.zIndex == undefined)
                    continue;
                var zindex = parseInt(div.style.zIndex);
                if (zindex >= zme)
                {
                    needdec = true;
                    break;
                }
            }
            if (!needdec) return;
            var zindexmax = zme;
            for (var i = 0; i < this.floatDiv.childElementCount; i++)
            {
                var div = this.floatDiv.children[i] as HTMLDivElement;
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
        private _initOverDiv()
        {
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

        private pickOverLay(cx: number, cy: number): HTMLImageElement
        {
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
        private testOverlay(usedock: boolean, cx: number, cy: number)
        {
            if (usedock == false)
            {
                this.overDiv_FillImg.hidden = true;
                this.overDiv_LeftImg.hidden = true;
                this.overDiv_RightImg.hidden = true;
                this.overDiv_TopImg.hidden = true;
                this.overDiv_BottomImg.hidden = true;
                return;
            }

            var inele = this.pickPanel(this.root, cx, cy);
            if (inele instanceof (panelContainer))
            {
                this.overDiv_FillImg.hidden = true;
                this.overDiv_LeftImg.hidden = true;
                this.overDiv_RightImg.hidden = true;
                this.overDiv_TopImg.hidden = true;
                this.overDiv_BottomImg.hidden = true;
                if (inele.subPanels.length == 0)
                {
                    this.overDiv_FillImg.hidden = false;
                    this.overDiv_FillImg.style.left = (inele.divRoot.clientLeft + inele.divRoot.clientWidth / 2 - 32) + "px";
                    this.overDiv_FillImg.style.top = (inele.divRoot.clientTop + inele.divRoot.clientHeight / 2 - 32) + "px";
                }

            }
            else if (inele instanceof (panel))
            {
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
        //坐标判定工具
        private _inbox(panel: IPanel, cx: number, cy: number): boolean
        {
            var divf: HTMLElement = panel.divRoot;
            var left = 0;
            var top = 0;
            while (divf != null && divf != this.root.divRoot && divf != this.divRoot)
            {
                left += divf.offsetLeft;
                top += divf.offsetTop;
                divf = divf.parentElement as HTMLElement;
            }
            if (cx < left || cy < top || cx >= (left + panel.divRoot.clientWidth) || cy >= (top + panel.divRoot.clientHeight))
            {
                return false;
            }
            return true;
        }
        _setDockPos(div: HTMLDivElement, x: string, y: string, r: string, b: string)
        {
            div.style.left = x;
            div.style.top = y;
            div.style.right = r;
            div.style.bottom = b;
            div.style.width = "auto";
            div.style.height = "auto";
        }
        _calcRootPos(div: HTMLDivElement): { x: number, y: number }
        {
            var divf: HTMLElement = div;
            var left = 0;
            var top = 0;
            while (divf != null && divf != this.root.divRoot && divf != this.divRoot)
            {
                left += divf.offsetLeft;
                top += divf.offsetTop;
                divf = divf.parentElement as HTMLElement;
            }
            return { x: left, y: top };
        }
        _calcClientPos(div: HTMLElement): { x: number, y: number }
        {
            var divf: HTMLElement = div;
            var left = 0;
            var top = 0;
            while (divf != null)
            {
                left += divf.offsetLeft;
                top += divf.offsetTop;
                divf = divf.parentElement as HTMLElement;
            }
            return { x: left, y: top };
        }
        _calcRootCenterPos(): { x: number, y: number }
        {
            return { x: this.divRoot.clientWidth / 2, y: this.divRoot.clientHeight / 2 };

        }
    }


}