///<reference path="../../lib/neo-ts.d.ts"/>
namespace what
{

    export class panel_Transaction
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
            this.panel = lightsPanel.panelMgr.instance().createPanel("Transaction （** not finish）");

            this.panel.divRoot.style.left = "400px";
            this.panel.divRoot.style.top = "200px";
            this.panel.floatWidth = 1000;
            this.panel.floatHeight = 600;
            this.panel.canDrag = true;
            this.panel.canScale = true;

            this.panel.onFloat();
            this.panel.divContent.textContent = "";

        }

    }

}