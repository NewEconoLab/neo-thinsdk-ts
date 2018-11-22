﻿///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest2 {

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
            this.addText("NEO-ThinSDK(typescript) test2 debugpage");
            this.addLink("Github", "https://github.com/NewEconoLab/neo-thinsdk-ts");
            this.addLink("TestPage1", "index.html");
            this.addText("==avm相关==");
            this.addMenuItem(new Test3_Codemirror_CursorControl());

        }
        addText(str: string) {
            var link = document.createElement("a");
            link.textContent = str;
            this.divMenu.appendChild(link);
            this.divMenu.appendChild(document.createElement("hr"));//newline         
        }
        addLink(str: string, url: string) {
            var link = document.createElement("a");
            link.textContent = str;
            link.href = url;
            this.divMenu.appendChild(link);
            this.divMenu.appendChild(document.createElement("hr"));//newline         
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