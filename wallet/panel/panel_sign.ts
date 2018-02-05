///<reference path="../../lib/neo-ts.d.ts"/>
namespace what
{

    export class panel_Sign
    {
        constructor()
        {

        }
        panel: lightsPanel.panel;
        main: Main;
        init(main: Main): void
        {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Sign");
            this.panel.onClose = () =>
            {
                this.panel.hide();
                this.main.panelTransaction.panel.show();
            }
            this.panel.divRoot.style.left = "400px";
            this.panel.divRoot.style.top = "200px";
            this.panel.floatWidth = 1000;
            this.panel.floatHeight = 600;
            this.panel.canDrag = true;
            this.panel.canScale = true;

            this.panel.onFloat();
            this.panel.divContent.textContent = "";


        }
        setTran(tran: ThinNeo.Transaction, inputaddr: string[]): void
        {
            if (tran.witnesses == null)
                tran.witnesses = [];
            let txid = tran.GetHash().clone().reverse().toHexString();
            this.panel.divContent.textContent = "";
            var a = lightsPanel.QuickDom.addA(this.panel, "TXID:" + txid, "http://be.nel.group/page/txInfo.html?txid=" + txid);
            a.target = "_blank";
            lightsPanel.QuickDom.addSpan(this.panel, "need witness:");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < inputaddr.length; i++)
            {
                lightsPanel.QuickDom.addSpan(this.panel, "Withess[" + i + "]:" + inputaddr[i]);
                lightsPanel.QuickDom.addElement(this.panel, "br");
                var hadwit = false;
                for (var w = 0; w < tran.witnesses.length; w++)
                {
                    if (tran.witnesses[w].Address == inputaddr[i])//命中
                    {
                        //m
                        lightsPanel.QuickDom.addSpan(this.panel, "V_script:" + tran.witnesses[w].VerificationScript.toHexString());
                        lightsPanel.QuickDom.addElement(this.panel, "br");
                        lightsPanel.QuickDom.addSpan(this.panel, "I_script:" + tran.witnesses[w].InvocationScript.toHexString());
                        lightsPanel.QuickDom.addElement(this.panel, "br");
                        let witi = w;
                        var btn = lightsPanel.QuickDom.addButton(this.panel, "delete witness")
                        btn.onclick = () =>
                        {
                            tran.witnesses.splice(witi, 1);
                            this.setTran(tran, inputaddr);
                            return;
                        };
                        hadwit = true;
                        break;
                    }
                }
                if (hadwit == false)
                {
                    lightsPanel.QuickDom.addSpan(this.panel, "NoWitness");
                    lightsPanel.QuickDom.addElement(this.panel, "br");
                    if (inputaddr[i] == this.main.panelLoadKey.address)
                    {
                        var btn = lightsPanel.QuickDom.addButton(this.panel, "Add witness by current key");
                        btn.onclick = () =>
                        {
                            var msg = tran.GetMessage();
                            var pubkey = this.main.panelLoadKey.pubkey;
                            var signdata = ThinNeo.Helper.Sign(msg, this.main.panelLoadKey.prikey);
                            tran.AddWitness(signdata, pubkey, this.main.panelLoadKey.address);
                            this.setTran(tran, inputaddr);
                        }
                    }

                }
                lightsPanel.QuickDom.addElement(this.panel, "hr");
                var btn = lightsPanel.QuickDom.addButton(this.panel, "boardcast it.")
                btn.onclick = async () =>
                {
                    var result = await WWW.rpc_postRawTransaction(tran.GetRawData());
                    if (result as boolean == true)
                    {
                        alert("txid=" + txid);
                    }
                };
            }
        }

    }

}