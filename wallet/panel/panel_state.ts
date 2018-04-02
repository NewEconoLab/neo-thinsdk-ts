namespace what
{

    export class panel_State
    {
        constructor()
        {

        }
        panel: lightsPanel.panel;
        main: Main;
        spanAPIHeight: HTMLSpanElement;
        spanRPC: HTMLSpanElement;
        spanRPCHeight: HTMLSpanElement;
        init(main: Main): void
        {
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
            lightsPanel.QuickDom.addSpan(this.panel, "API=" + WWW.api);
            lightsPanel.QuickDom.addElement(this.panel, "br");

            this.spanAPIHeight = lightsPanel.QuickDom.addSpan(this.panel, "");
            lightsPanel.QuickDom.addElement(this.panel, "br");

            //this.spanRPC = lightsPanel.QuickDom.addSpan(this.panel, "");
            //lightsPanel.QuickDom.addElement(this.panel, "br");

            //this.spanRPCHeight = lightsPanel.QuickDom.addSpan(this.panel, "");
            //lightsPanel.QuickDom.addElement(this.panel, "br");
        }
        async update(): Promise<void>
        {
            this.spanAPIHeight.textContent = "API height=" + await WWW.api_getHeight();
            //if (WWW.rpc == "")
            //{
            //    WWW.rpc = await WWW.rpc_getURL();
            //}
            //this.spanRPC.textContent = "RPC=" + WWW.rpcName + ":" + WWW.rpc;
            //this.spanRPCHeight.textContent = "RPC height=" + await WWW.rpc_getHeight();

        }
    }

}