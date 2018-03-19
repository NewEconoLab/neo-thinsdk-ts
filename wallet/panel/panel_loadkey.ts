///<reference path="../../lib/neo-ts.d.ts"/>
namespace what
{

    export class panel_LoadKey
    {
        constructor()
        {

        }
        panel: lightsPanel.panel;
        main: Main;
        keylist: HTMLDivElement;
        prikey: Uint8Array;
        pubkey: Uint8Array;
        address: string;
        spanKey: HTMLSpanElement;
        init(main: Main): void
        {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("Key Info");

            this.panel.divRoot.style.left = "400px";
            this.panel.divRoot.style.top = "30px";
            this.panel.floatWidth = 400;
            this.panel.floatHeight = 150;
            this.panel.canDrag = true;
            this.panel.canScale = true;

            this.panel.onFloat();
            this.panel.divContent.textContent = "";



            lightsPanel.QuickDom.addSpan(this.panel,"Load NEP6 File");

            var file = document.createElement("input");
            this.panel.divContent.appendChild(file);
            file.type = "file";
            var wallet: ThinNeo.nep6wallet;
            var reader = new FileReader();
            reader.onload = (e: Event) =>
            {
                var walletstr = reader.result as string;
                wallet = new ThinNeo.nep6wallet();
                wallet.fromJsonStr(walletstr);
                this.keylist.textContent = "";
                for (var i = 0; i < wallet.accounts.length; i++)
                {
                    if (wallet.accounts[i].nep2key != null)
                    {
                        let nepkey = wallet.accounts[i].nep2key;
                        var s = wallet.scrypt;

                        var btn = document.createElement("button");
                        btn.textContent = "use " + wallet.accounts[i].address;
                        btn.onclick = () =>
                        {
                            var pass = prompt("password?");
                            ThinNeo.Helper.GetPrivateKeyFromNep2(nepkey, pass, s.N, s.r, s.p, (info, result) =>
                            {
                                if (info == "finish")
                                {
                                    this.setKey(result as Uint8Array);
                                }
                            }
                            );
                        };
                        this.keylist.appendChild(btn);
                    }
                }
            };
            file.onchange = (ev: Event) =>
            {
                if (file.files[0].name.includes(".json"))
                {
                    reader.readAsText(file.files[0]);
                }
            }


            this.keylist = document.createElement("div");
            this.panel.divContent.appendChild(this.keylist);

            this.panel.divContent.appendChild(document.createElement("br"));//newline

            this.spanKey = lightsPanel.QuickDom.addSpan(this.panel, "");
        }
        setKey(key: Uint8Array)
        {
            this.prikey = key;
            this.pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(this.prikey);
            this.address = ThinNeo.Helper.GetAddressFromPublicKey(this.pubkey);
            this.keylist.textContent = "";
            this.spanKey.textContent = "usekey= " + this.address;
            var btn = lightsPanel.QuickDom.addButton(this.keylist, "refresh UTXO");
            btn.onclick = () =>
            {
                this.main.panelUTXO.refresh();
            }
            this.main.panelUTXO.refresh();
        }
    }

}