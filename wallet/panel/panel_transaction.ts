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
        setTran(tran: ThinNeo.Transaction): void
        {
            this.panel.divContent.textContent = "";

            lightsPanel.QuickDom.addSpan(this.panel, "type=" + ThinNeo.TransactionType[tran.type].toString());
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "version=" + tran.version);
            lightsPanel.QuickDom.addElement(this.panel, "hr");

            var inputAddrs: string[] = [];
            //輸入顯示
            
            lightsPanel.QuickDom.addSpan(this.panel, "inputcount=" + tran.inputs.length);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < tran.inputs.length; i++)
            {
                var _addr = tran.inputs[i]["_addr"];
                if (inputAddrs.indexOf(_addr) < 0)
                {
                    inputAddrs.push(_addr);
                }

                //必须clone后翻转,因爲這個hash是input的成員，直接反轉會改變它
                var rhash = tran.inputs[i].hash.clone().reverse();
                var inputhash = rhash.toHexString();
                var outstr = "    input[" + i + "]" + inputhash + "(" + tran.inputs[i].index + ")";

                var a = lightsPanel.QuickDom.addA(this.panel, outstr, "http://be.nel.group/page/txInfo.html?txid=" + inputhash);
                a.target = "_blank";

                lightsPanel.QuickDom.addElement(this.panel, "br");
            }

            lightsPanel.QuickDom.addElement(this.panel, "hr");

            //輸出顯示
            lightsPanel.QuickDom.addSpan(this.panel, "outputcount=" + tran.outputs.length);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            for (var i = 0; i < tran.outputs.length; i++)
            {
                var addrt = tran.outputs[i].toAddress;
                var address = ThinNeo.Helper.GetAddressFromScriptHash(addrt);
                var a = lightsPanel.QuickDom.addA(this.panel, "    outputs[" + i + "]" + address, "http://be.nel.group/page/address.html?addr=" + address);
                a.target = "_blank";

                var assethash = tran.outputs[i].assetId.clone().reverse();
                var assetid = "0x" + assethash.toHexString();
                if (inputAddrs.length == 1 && address == inputAddrs[0])
                {
                    lightsPanel.QuickDom.addSpan(this.panel, "    (change)" + CoinTool.assetID2name[assetid] + "=" + tran.outputs[i].value.toString());
                }
                else
                {
                    lightsPanel.QuickDom.addSpan(this.panel, "    " + CoinTool.assetID2name[assetid] + "=" + tran.outputs[i].value.toString());
                }
                lightsPanel.QuickDom.addElement(this.panel, "br");
            }
            if (tran.type == ThinNeo.TransactionType.InvocationTransaction && tran.extdata != null)
            {
                var scriptdata = tran.extdata as ThinNeo.InvokeTransData;
                lightsPanel.QuickDom.addElement(this.panel, "hr");
                lightsPanel.QuickDom.addSpan(this.panel,"call script:");
                var ops = ThinNeo.Compiler.Avm2Asm.Trans(scriptdata.script);
                for (var i = 0; i < ops.length;i++)
                {
                    lightsPanel.QuickDom.addSpan(this.panel, ops[i].toString());
                    lightsPanel.QuickDom.addElement(this.panel, "br");
                }
            }
            //transaction info
            lightsPanel.QuickDom.addElement(this.panel, "hr");

            let msg = tran.GetMessage();
            var msglen = msg.length;
            var txid = tran.GetHash().toHexString();
            lightsPanel.QuickDom.addSpan(this.panel, "--this TXLen=" + msglen);
            lightsPanel.QuickDom.addSpan(this.panel, "--this TXID=" + txid);
            lightsPanel.QuickDom.addElement(this.panel, "br");

            for (var i = 0; i < inputAddrs.length; i++)
            {
                lightsPanel.QuickDom.addSpan(this.panel, "must witness[" + i + "]=" + inputAddrs[i]);
                //let addr = inputAddrs[i];

                //if (addr == this.main.panelLoadKey.address)//currkey
                //{
                //    var btnsign = lightsPanel.QuickDom.addButton(this.panel, "use current key sign it.");

                //    btnsign.onclick = () =>
                //    {
                //        if (addr == this.main.panelLoadKey.address)//當前key地址
                //        {//直接加私鑰

                //        }
                //    };
                //}
                //else
                //{
                //    var btnsign = lightsPanel.QuickDom.addButton(this.panel, "specsign.");
                //    btnsign.onclick = () =>
                //    {
                //    };
                //}
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");

            var btnsign = lightsPanel.QuickDom.addButton(this.panel, "Sign");
            btnsign.onclick = () =>
            {
                this.panel.hide();
                tran.witnesses = [];
                this.main.panelSign.setTran(tran, inputAddrs);
                this.main.panelSign.panel.show();
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");

            lightsPanel.QuickDom.addSpan(this.panel,msg.toHexString());
        }

    }

}