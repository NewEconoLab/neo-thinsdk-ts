
namespace what
{
    export class Main
    {
        panelState: panel_State;//显示 api状态的面板
        panelLoadKey: panel_LoadKey;//加载key的面板
        panelFunction: panel_Function;//钱包功能面板
        panelTransaction: panel_Transaction;//交易面板
        panelUTXO: panel_UTXO;
        async start()
        {
            await CoinTool.initAllAsset();
            setTimeout(() => { this.update() }, 1000);
            var divpanel = document.getElementById("panel") as HTMLDivElement;
            lightsPanel.panelMgr.instance().init(divpanel);
            lightsPanel.panelMgr.instance().setbackImg("res/back1.jpg");

            this.panelState = new panel_State();
            this.panelState.init(this);

            this.panelLoadKey = new panel_LoadKey();
            this.panelLoadKey.init(this);

            this.panelFunction = new panel_Function();
            this.panelFunction.init(this);

            this.panelTransaction = new panel_Transaction();
            this.panelTransaction.init(this);

            this.panelUTXO = new panel_UTXO();
            this.panelUTXO.init(this);
       }

        update(): void
        {
            //console.log("hello there.");
            this.panelState.update();
            setTimeout(() => { this.update() }, 1000);
        }
    }
    window.onload = () =>
    {
        var main = new Main();
        main.start();


    }

}