﻿type PromiseExecutor<T> = (resolve: Action<T | PromiseLike<T>>, reject: Action<any>) => void;


enum PromiseState {
    pending,
    fulfilled,
    rejected
}
class NeoPromise<T> implements PromiseLike<T>
{
    private _state = PromiseState.pending;
    private _callback_attached = false;
    private _value: T;
    private _reason: any;
    private _onFulfilled: Func<T, any | PromiseLike<any>>;
    private _onRejected: Func<T, any | PromiseLike<any>>;
    private _next_promise: NeoPromise<any>;
    private _tag: any;

    constructor(executor: PromiseExecutor<T>) {
        if (executor != null)
            executor(this.resolve.bind(this), this.reject.bind(this));
    }

    public static all(iterable: NeoPromise<any>[]): NeoPromise<any[]> {
        return new NeoPromise<any[]>((resolve, reject) => {
            if (iterable.length == 0) {
                resolve([]);
                return;
            }
            let results = new Array(iterable.length);
            let rejected = false;
            let onFulfilled = function (result) {
                results[this._tag] = result;
                for (let i = 0; i < iterable.length; i++)
                    if (iterable[i]._state != PromiseState.fulfilled)
                        return;
                resolve(results);
            };
            let onRejected = reason => {
                if (!rejected) {
                    rejected = true;
                    reject(reason);
                }
            };
            for (let i = 0; i < iterable.length; i++) {
                iterable[i]._tag = i;
                iterable[i].then(onFulfilled, onRejected);
            }
        });
    }

    public catch<TResult>(onrejected: (reason: any) => PromiseLike<TResult>): PromiseLike<TResult> {

        return this.then<TResult,any>(null, onrejected);
    }

    private checkState() {
        if (this._state != PromiseState.pending && this._callback_attached) {
            let callback = this._state == PromiseState.fulfilled ? this._onFulfilled : this._onRejected;
            let arg = this._state == PromiseState.fulfilled ? this._value : this._reason;
            let value, reason;
            try {
                value = callback == null ? this : callback.call(this, arg);
            }
            catch (ex) {
                reason = ex;
            }
            if (this._next_promise == null) {
                if (reason != null)
                    return NeoPromise.reject(reason);
                else if (value instanceof NeoPromise)
                    return value;
                else
                    return NeoPromise.resolve(value);
            }
            else {
                if (reason != null)
                    this._next_promise.reject(reason);
                else if (value instanceof NeoPromise)
                    value.then(this.resolve.bind(this._next_promise), this.reject.bind(this._next_promise));
                else
                    this._next_promise.resolve(value);
            }
        }
    }

    private reject(reason: any): void {
        this._state = PromiseState.rejected;
        this._reason = reason;
        this.checkState();
    }

    public static reject(reason: any): PromiseLike<any> {
        return new NeoPromise((resolve, reject) => reject(reason));
    }

    private resolve(value: T): void {
        this._state = PromiseState.fulfilled;
        this._value = value;
        this.checkState();
    }

    public static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T> {
        if (value instanceof NeoPromise) return value;
        return new NeoPromise<T>((resolve, reject) => resolve(value));
    }

    public then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike < TResult1 | TResult2 >
        {
        this._onFulfilled = onFulfilled;
        this._onRejected = onRejected;
        this._callback_attached = true;
        if (this._state == PromiseState.pending) {
            this._next_promise = new NeoPromise<TResult1>(null);
            return this._next_promise;
        }
        else {
            return this.checkState();
        }
    }
}

