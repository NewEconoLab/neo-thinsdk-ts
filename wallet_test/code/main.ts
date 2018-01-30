
namespace what {
    export class Main {
        other: lightsPanel.panel;
        panel2: lightsPanel.panel;
        panel3: lightsPanel.panel;
        Start(): void {
            console.log("hello there.");
            var panel = document.getElementById("panel") as HTMLDivElement;
            lightsPanel.panelMgr.instance().init(panel);


            lightsPanel.panelMgr.instance().setbackImg("res/back1.jpg");
            this.other = lightsPanel.panelMgr.instance().createPanel("SamplePanel ");

            this.other.divRoot.style.left = "30px";
            this.other.divRoot.style.top = "30px";
            this.other.floatWidth = 300;
            this.other.floatHeight = 100;
            this.other.canDrag = true;
            this.other.canScale = true;

            this.other.onFloat();
            this.other.divContent.textContent = "";

            lightsPanel.QuickDom.addA(this.other, "Begin Test Typescript Wallet", "");

            this.panel2 = lightsPanel.panelMgr.instance().createPanel("panel2");

            this.panel3 = lightsPanel.panelMgr.instance().createPanel("panel3");

        }
    }
    window.onload = () => {
        var main = new Main();
        main.Start();


    }

}