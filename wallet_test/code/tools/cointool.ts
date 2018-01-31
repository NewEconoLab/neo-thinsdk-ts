namespace what
{
    export class CoinTool
    {
        static readonly id_GAS: string = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
        static readonly id_NEO: string = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
        static assetID2name: { [id: string]: string } = {};
        static name2assetID: { [id: string]: string } = {};
        static async initAllAsset()
        {
            var allassets = await WWW.api_getAllAssets();
            for (var a in allassets)
            {
                var asset = allassets[a];
                var names = asset.name;
                var id = asset.id;
                var name: string = "";
                if (id == CoinTool.id_GAS)
                {
                    name = "GAS";
                }
                else if (id == CoinTool.id_NEO)
                {
                    name = "NEO";
                }
                else
                {
                    for (var i in names)
                    {
                        name = names[i].name;
                        if (names[i].lang == "en")
                            break;
                    }
                }
                CoinTool.assetID2name[id] = name;
                CoinTool.name2assetID[name] = id;
            }
        }
    }
}