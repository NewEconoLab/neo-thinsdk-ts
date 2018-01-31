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
        setTran(tran: ThinNeo.Transaction): void
        {
            this.panel.divContent.textContent = "";

            lightsPanel.QuickDom.addSpan(this.panel, "type=" + tran.type.toString());
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "version=" + tran.version);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "inputcount=" + tran.inputs.length);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < tran.inputs.length; i++)
            {
                lightsPanel.QuickDom.addSpan(this.panel, "    input[" + i + "]" + tran.inputs[i].hash.toHexString() + "(" + tran.inputs[i].index + ")");
                lightsPanel.QuickDom.addElement(this.panel, "br");
            }
            lightsPanel.QuickDom.addSpan(this.panel, "outputcount=" + tran.outputs.length);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < tran.outputs.length; i++)
            {
                lightsPanel.QuickDom.addSpan(this.panel, "    outputs[" + i + "]" + ThinNeo.Helper.GetAddressFromScriptHash(tran.outputs[i].toAddress));
                lightsPanel.QuickDom.addElement(this.panel, "br");
                lightsPanel.QuickDom.addSpan(this.panel, "    " + tran.outputs[i].assetId.toHexString() + "=" + tran.outputs[i].value.toString());
                lightsPanel.QuickDom.addElement(this.panel, "br");
            }
            var txid = tran.GetHash().toHexString();
            lightsPanel.QuickDom.addSpan(this.panel, "this TXID=" + txid);
            lightsPanel.QuickDom.addElement(this.panel, "br");
        }

    }

}