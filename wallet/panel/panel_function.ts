///<reference path="../../lib/neo-ts.d.ts"/>
namespace what
{
    export enum FuncTag
    {
        transfer,
        DApp_WhoAmI,
    }
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
            this.panel.floatHeight = 350;
            this.panel.canDrag = true;
            this.panel.canScale = true;

            this.panel.onFloat();


            this.setFunc(FuncTag.transfer);
        }


        setFunc(tag: FuncTag): void
        {
            this.panel.divContent.textContent = "";

            if (tag == FuncTag.transfer)
            {
                lightsPanel.QuickDom.addSpan(this.panel, "Transfer");
            }
            else
            {
                var btn = lightsPanel.QuickDom.addButton(this.panel, "Transfer");
                btn.onclick = () =>
                {
                    this.setFunc(FuncTag.transfer);
                };
            }
            if (tag == FuncTag.DApp_WhoAmI)
            {
                lightsPanel.QuickDom.addSpan(this.panel, "DApp_WhoAmI");
            }
            else
            {
                var btn = lightsPanel.QuickDom.addButton(this.panel, "DApp_WhoAmI");
                btn.onclick = () =>
                {
                    this.setFunc(FuncTag.DApp_WhoAmI);
                };
            }
            lightsPanel.QuickDom.addElement(this.panel, "hr");
            if (tag == FuncTag.transfer)
            {
                this.initTransfer();

            }
            if (tag == FuncTag.DApp_WhoAmI)
            {
                this.initDApp_WhoAmI();
            }
        }
        initTransfer(): void
        {
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

        initDApp_WhoAmI(): void
        {
            var pkey = this.main.panelLoadKey.pubkey;
            lightsPanel.QuickDom.addSpan(this.panel, "(No need key)");
            lightsPanel.QuickDom.addElement(this.panel, "br");
            lightsPanel.QuickDom.addSpan(this.panel, "Target");
            var target = lightsPanel.QuickDom.addTextInput(this.panel, pkey == null ? "AdzQq1DmnHq86yyDUkU3jKdHwLUe2MLAVv" : this.main.panelLoadKey.address);
            lightsPanel.QuickDom.addElement(this.panel, "br");
            var btn = lightsPanel.QuickDom.addButton(this.panel, "getName");

            lightsPanel.QuickDom.addElement(this.panel, "br");

            var result = lightsPanel.QuickDom.addSpan(this.panel, "result=");

            btn.onclick = async () =>
            {
                //dapp 方式1 ，GetStorage  ，方式2 invokeScript，查NEP5余额就是
                var targetaddr = target.value;
                var scriptaddress = "0x42832a25cf11d0ceee5629cb8b4daee9bac207ca";
                var key = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(targetaddr);
                var script = scriptaddress.hexToBytes();//script 要反序
                var r = await WWW.rpc_getStorage(script, key);
                if (r == null || r == undefined)
                {
                    result.textContent = "no name";
                }
                else
                {
                    var hex = r.hexToBytes();
                    result.textContent = "name=" + ThinNeo.Helper.Bytes2String(hex);
                }
            };


            lightsPanel.QuickDom.addElement(this.panel, "hr");

            if (pkey != null)
            {
                var pkeyhash = ThinNeo.Helper.GetPublicKeyScriptHashFromPublicKey(pkey);
                lightsPanel.QuickDom.addSpan(this.panel, "(need key)");
                lightsPanel.QuickDom.addElement(this.panel, "br");
                lightsPanel.QuickDom.addSpan(this.panel, "cur addr=" + this.main.panelLoadKey.address);
                lightsPanel.QuickDom.addElement(this.panel, "br");
                var inputName = lightsPanel.QuickDom.addTextInput(this.panel, "");
                lightsPanel.QuickDom.addElement(this.panel, "br");
                var btnSetName = lightsPanel.QuickDom.addButton(this.panel, "setName");
                btnSetName.onclick = () =>
                {
                    var targetaddr = this.main.panelLoadKey.address;//给自己转账
                    var assetid = CoinTool.id_GAS;
                    var _count = Neo.Fixed8.Zero;//有数就行，是个gas以内都是不要钱的
                    var tran = CoinTool.makeTran(this.main.panelUTXO.assets, targetaddr, assetid, _count);

                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    let script = null;
                    var sb = new ThinNeo.ScriptBuilder();
                    var scriptaddress = "0x42832a25cf11d0ceee5629cb8b4daee9bac207ca".hexToBytes().reverse();
                    sb.EmitPushString(inputName.value);//先推第二个参数，新名字
                    sb.EmitPushBytes(this.main.panelLoadKey.pubkey);//再推第二个参数，自己的公钥
                    sb.EmitAppCall(scriptaddress);
                    (tran.extdata as ThinNeo.InvokeTransData).script = sb.ToArray();
                    //估计一个gas用量
                    //如果估计gas用量少了，智能合约执行会失败。
                    //如果估计gas用量>10,交易必须丢弃gas，否则智能合约执行会失败
                    (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

                    this.main.panelTransaction.setTran(tran);
                };
            }
        }
    }

}