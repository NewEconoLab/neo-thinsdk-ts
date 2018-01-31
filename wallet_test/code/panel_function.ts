///<reference path="../lib/neo-ts.d.ts"/>
namespace what
{

    export class panel_Function
    {
        constructor()
        {

        }
        panel: lightsPanel.panel;
        main: Main;
        target: HTMLInputElement;
        init(main: Main): void
        {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Function （** not finish）");

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
            lightsPanel.QuickDom.addTextInput(this.panel, "");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            lightsPanel.QuickDom.addSpan(this.panel, "Type:");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            lightsPanel.QuickDom.addSpan(this.panel, "Count");
            lightsPanel.QuickDom.addTextInput(this.panel, "");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            lightsPanel.QuickDom.addButton(this.panel, "MakeTransaction");
            lightsPanel.QuickDom.addElement(this.panel, "br");
        }

    }

}