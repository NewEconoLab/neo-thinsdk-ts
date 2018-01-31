
namespace what {
    export class Main {
        panelState: panel_State;//显示 api状态的面板
        start(): void {
            setTimeout(() => { this.update() }, 1000);
            var divpanel = document.getElementById("panel") as HTMLDivElement;
            lightsPanel.panelMgr.instance().init(divpanel);
            lightsPanel.panelMgr.instance().setbackImg("res/back1.jpg");

            this.panelState = new panel_State();
            this.panelState.init(this);
        }

        update(): void {
            //console.log("hello there.");
            this.panelState.update();
            setTimeout(() => { this.update() }, 1000);
        }
    }
    window.onload = () => {
        var main = new Main();
        main.start();


    }

}