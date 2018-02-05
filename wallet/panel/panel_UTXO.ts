///<reference path="../../lib/neo-ts.d.ts"/>
namespace what
{

    export class panel_UTXO
    {
        constructor()
        {

        }
        panel: lightsPanel.panel;
        main: Main;
        tree: lightsPanel.treeView;
        assets: { [id: string]: UTXO[] }
        async init(main: Main)
        {
            this.main = main;
            this.panel = lightsPanel.panelMgr.instance().createPanel("UTXO");

            this.panel.divRoot.style.left = "920px";
            this.panel.divRoot.style.top = "30px";
            this.panel.floatWidth = 400;
            this.panel.floatHeight = 150;
            this.panel.canDrag = true;
            this.panel.canScale = true;

            this.panel.onFloat();
            this.panel.divContent.textContent = "";

            this.tree = new lightsPanel.treeView(this.panel);
        }

        async refresh()
        {
            var utxos = await WWW.api_getUTXO(this.main.panelLoadKey.address);
            this.assets = {};
            for (var i in utxos)
            {
                var item = utxos[i];
                var txid = item.txid;
                var n = item.n;
                var asset = item.asset;
                var count = item.value;
                if (this.assets[asset] == undefined)
                {
                    this.assets[asset] = [];
                }
                var utxo = new UTXO();
                utxo.addr = item.addr;
                utxo.asset = asset;
                utxo.n = n;
                utxo.txid = txid;
                utxo.count = Neo.Fixed8.parse(count);
                this.assets[asset].push(utxo);
            }

            this.tree.updateData(new Filter(this.assets));
        }
    }
    export class UTXO
    {
        addr: string;
        txid: string;
        n: number;
        asset: string;
        count: Neo.Fixed8;
    }
    class Filter implements lightsPanel.ITreeViewFilter
    {

        assets: { [id: string]: UTXO[] };
        constructor(assets: { [id: string]: UTXO[] })
        {
            this.assets = assets;
        }
        getChildren(rootObj: any): { name: string, txtcolor: string }[]
        {
            if (rootObj == null)
            {
                var item = [];
                for (var asset in this.assets)
                {
                    var name = CoinTool.assetID2name[asset];
                    var count: Neo.Fixed8 = Neo.Fixed8.Zero;
                    for (var i in this.assets[asset])
                    {
                        var utxo = this.assets[asset][i] as UTXO;
                        count = count.add(utxo.count);
                    }
                    item.push({ "name": name + " count=" + count.toString(), "txtcolor": "FFF", "asset": asset })
                }
                return item;
            }
            else
            {
                if (rootObj["asset"] != undefined)
                {
                    var utxos = this.assets[rootObj["asset"]];
                    var item = [];
                    for (var i in utxos)
                    {
                        var utxo = utxos[i] as UTXO;
                        item.push({ "name": utxo.count, "txtcolor": "FFF", "asset": asset })
                    }
                    return item;
                }

                return [];
            }
        }
    }

}