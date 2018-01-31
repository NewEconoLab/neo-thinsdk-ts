namespace lightsPanel
{
    //需要数据对象提供此接口，若rootObj=null，则返回根物体的子物体
    //返回的为子物体列表，下次会用子物体作为rootObj再查询
    //子物体需要提供 name 和 txtcolor 两个字符串属性
    export interface ITreeViewFilter
    {
        getChildren(rootObj: any): { name: string, txtcolor: string }[];
    }
    export class treeNode
    {
        divNode: HTMLDivElement;
        divText: HTMLDivElement;
        divForChild: HTMLDivElement;
        divChildButton: HTMLButtonElement;
        text: string;
        children: treeNode[];
        parent: treeNode;
        left: number = 0;
        getDivForChild(): HTMLDivElement
        {
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
        data: any;
        MakeLength(len: number)
        {
            if (len == 0)
                return;
            if (this.children == null)
                this.children = [];
            //补位
            for (var i = this.children.length; i < len; i++)
            {
                var nnode = new treeNode();
                nnode.parent = this;
                this.children.push(nnode);
            }

            for (var i = len; i < this.children.length; i++)
            {
                this.children[i].hide();
            }
        }
        FillData(treeview: treeView, filter: ITreeViewFilter, data: { name: string, txtcolor: string })
        {
            this.data = data;
            if (this.divNode == null)
            {
                this.divNode = document.createElement("div");
                this.divNode.style.position = "relative";
                this.divNode.style.overflow = "auto";
                this.divNode.style.overflowX = "hidden";
                this.divNode.style.overflowY = "auto";
                this.parent.getDivForChild().appendChild(this.divNode);
            }
            if (this.divText == null)
            {
                this.divChildButton = document.createElement("button");
                this.divChildButton.textContent = "-";
                this.divChildButton.style.position = "relative";
                this.divChildButton.style.width = "24px";
                this.divChildButton.style.left = this.left + "px";

                this.divChildButton.onclick = () =>
                {
                    if (this.divForChild == null) return;
                    this.divForChild.hidden = !this.divForChild.hidden;
                    if (this.divForChild.hidden == true)
                    {
                        this.divChildButton.textContent = "+";
                    }
                    else
                    {
                        this.divChildButton.textContent = "-";
                    }
                }
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
            //fill
            treeview.makeSelectEvent(this);
            (this.divText.childNodes[1] as HTMLAnchorElement).text = data.name;
            (this.divText.childNodes[1] as HTMLAnchorElement).style.color = data.txtcolor;

            //childcheck
            var children = filter.getChildren(data);
            this.divChildButton.hidden = (children.length == 0);

            this.MakeLength(children.length);
            for (var i = 0; i < children.length; i++)
            {
                this.children[i].left = this.left + 16;
                this.children[i].show();
                this.children[i].FillData(treeview, filter, children[i]);
            }
        }
        hide()
        {
            if (this.divNode != null)
            {
                this.divNode.hidden = true;
            }
        }
        show()
        {
            if (this.divNode != null)
            {
                this.divNode.hidden = false;
            }
        }
    }
    export class treeView
    {
        constructor(parent: panel | HTMLDivElement)
        {
            this.treeArea = document.createElement("div");
            this.treeArea.className = "full";
            this.treeArea.style.overflow = "auto";
            this.treeArea.style.overflowX = "hidden";
            this.treeArea.style.overflowY = "auto";
            this.treeArea["inv"] = this;//将自己的引用挂上去，需要的时候可以用dom元素反过来查
            this.nodeRoot.divForChild = this.treeArea;
            if (parent instanceof panel)
            {
                (parent as panel).divContent.textContent = "";
                (parent as panel).divContent.appendChild(this.treeArea);
            }
            else
            {
                parent.textContent = "";
                parent.appendChild(this.treeArea);
            }
        }

        private treeArea: HTMLDivElement;
        private nodeRoot: treeNode = new treeNode();

        onSelectItem: (txt: string, data: any) => void = null;
        private selectItem: treeNode = null;
        private onSelect(node: treeNode)
        {
            this.selectItem = node;
            if (this.onSelectItem != null)
            {
                this.onSelectItem((node.divText.childNodes[1] as HTMLAnchorElement).text, node.data);
            }
        }
        makeSelectEvent(node: treeNode)
        {
            node.divText.onclick = () =>
            {
                if (this.selectItem != null)
                {
                    this.selectItem.divText.style.background = "transparent";
                }
                this.onSelect(node);
                if (this.selectItem != null)
                {
                    this.selectItem.divText.style.background = "#aaa";

                }
            }
        }
        updateData(filter: ITreeViewFilter)
        {
            var child = filter.getChildren(null);
            var ccount = child.length;

            this.nodeRoot.MakeLength(ccount);
            if (this.nodeRoot.children != null)
            {
                for (var i = 0; i < ccount; i++)
                {
                    var node = this.nodeRoot.children[i];
                    node.show();
                    node.FillData(this, filter, child[i]);
                }
            }

        }
    }
}