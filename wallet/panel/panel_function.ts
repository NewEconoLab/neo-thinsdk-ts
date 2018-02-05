///<reference path="../../lib/neo-ts.d.ts"/>
namespace what
{

    export class panel_Function
    {
        constructor()
        {

        }
        panel: lightsPanel.panel;
        main: Main;
        init(main: Main): void
        {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Function");

            this.panel.divRoot.style.left = "30px";
            this.panel.divRoot.style.top = "200px";
            this.panel.floatWidth = 300;
            this.panel.floatHeight = 150;
            this.panel.canDrag = true;
            this.panel.canScale = true;

            this.panel.onFloat();
            this.panel.divContent.textContent = "";



            lightsPanel.QuickDom.addSpan(this.panel, "Transfer");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            lightsPanel.QuickDom.addSpan(this.panel, "Target");
            var target = lightsPanel.QuickDom.addTextInput(this.panel, "AdzQq1DmnHq86yyDUkU3jKdHwLUe2MLAVv");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            lightsPanel.QuickDom.addSpan(this.panel, "Asset Type:");
            var select = document.createElement("select");
            this.panel.divContent.appendChild(select);
            for (var name in CoinTool.name2assetID)
            {
                var sitem = document.createElement("option");
                sitem.text = name;
                select.appendChild(sitem);
            }
            lightsPanel.QuickDom.addElement(this.panel, "br");

            lightsPanel.QuickDom.addSpan(this.panel, "Count");
            var count = lightsPanel.QuickDom.addTextInput(this.panel, "");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            var btn = lightsPanel.QuickDom.addButton(this.panel, "MakeTransaction");
            btn.onclick = () =>
            {
                var targetaddr = target.value;
                var asset = (select.childNodes[select.selectedIndex] as HTMLOptionElement).text;
                var assetid = CoinTool.name2assetID[asset];
                var _count = Neo.Fixed8.parse(count.value);
                var tran = CoinTool.makeTran(this.main.panelUTXO.assets, targetaddr, assetid, _count);
                this.main.panelTransaction.setTran(tran);
            }
            lightsPanel.QuickDom.addElement(this.panel, "br");
        }

       
    }

}