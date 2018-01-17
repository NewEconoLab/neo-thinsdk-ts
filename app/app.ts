///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export interface ITestItem {
        getName(): string;
        start(div: HTMLDivElement): void
    }

    class Menu {
        constructor() {
            console.log("hello world");
        }
        div: HTMLDivElement;
        divMenu: HTMLDivElement;
        start(): void {
            this.createMenu();
            this.addMenuItem(new Test_CheckAddress());
            this.addMenuItem(new Test_WifDecode());
            this.addMenuItem(new Test_Sign());
      }
        addMenuItem(item: ITestItem) {
            var link = document.createElement("a");
            link.textContent = item.getName();
            link.href = "#";
            this.divMenu.appendChild(link);
            link.onclick = () => {

                this.resetDiv();
                item.start(this.div);
            };

            this.divMenu.appendChild(document.createElement("hr"));//newline            
        }
        createMenu() {
            this.divMenu = document.createElement("div");
            this.divMenu.style.left = "0px";
            this.divMenu.style.width = "200px";
            this.divMenu.style.top = "0px";
            this.divMenu.style.bottom = "0px";
            this.divMenu.style.position = "absolute";
            this.divMenu.style.overflow = "hidden";
            document.body.appendChild(this.divMenu);

        }
        resetDiv() {
            if (this.div != null) {
                document.body.removeChild(this.div);
            }
            this.div = document.createElement("div");
            this.div.style.left = "200px";
            this.div.style.right = "0px";
            this.div.style.top = "0px";
            this.div.style.bottom = "0px";
            this.div.style.position = "absolute";
            this.div.style.overflow = "hidden";
            document.body.appendChild(this.div);
        }
    }
    window.onload = () => {
        var main = new Menu();
        main.start();
    };
}