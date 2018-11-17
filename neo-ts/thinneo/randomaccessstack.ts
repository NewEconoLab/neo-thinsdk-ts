
namespace ThinNeo.VM {
    export class RandomAccessStack<T>
    {
        private readonly list: Array<T> = new Array<T>();

        public get Count(): number {
            return this.list.length;
        }

        public Clear(): void {
            this.list.splice(0, this.list.length);
        }

        public GetItem(index: number): T {
            return this.list[index];//this.list.length - 1 - index];
        }

        public Insert(index: number, item: T): void {
            if (index > this.list.length) throw new Error("InvalidOperationException");
            this.list.splice(this.list.length - index, 0, item);
        }

        public Peek(index: number = 0): T {
            if (index >= this.list.length) throw new Error("InvalidOperationException");
            return this.list[this.list.length - 1 - index];
        }

        public Pop(): T {
            return this.Remove(0);
        }

        public Push(item: T): void {
            this.list.push(item);
        }

        public Remove(index: number): T {
            if (index >= this.list.length) throw new Error("InvalidOperationException");
            let item = this.list[this.list.length - index - 1];
            this.list.splice(this.list.length - index - 1, 1);
            return item;
        }

        public Set(index: number, item: T): void {
            if (index >= this.list.length) throw new Error("InvalidOperationException");
            this.list[this.list.length - index - 1] = item;
        }

    }
}
