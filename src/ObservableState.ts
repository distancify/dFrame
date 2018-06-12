/// <referece path="../../typings/index.d.ts"/>

export interface ObservableStateHandler<T> {
    (current : T) : void;
}

export class ObservableState<T> {

    private _default : T;
    private _current : T;
    private _onChangeHandlers : Array<ObservableStateHandler<T>> = [];
    private _onBeforeChangeHandlers : Array<ObservableStateHandler<T>> = [];

    public constructor(initialValue : T) {
        this._current = initialValue;
        this._default = initialValue;
    }

    public current() { return this._current; }

    public set(value : T) {
        if (this._current !== value) {
            for (let handler of this._onBeforeChangeHandlers) {
                handler(this._current);
            }

            this._current = value;
            
            for (let handler of this._onChangeHandlers) {
                handler(this._current);
            }
        }
    }

    public reset() {
        this.set(this._default);
    }

    public isDefault() {
        return this._current === this._default;
    }

    public onChange(handler : ObservableStateHandler<T>) {
        this._onChangeHandlers.push(handler);
    }

    public onBeforeChange(handler : ObservableStateHandler<T>) {
        this._onBeforeChangeHandlers.push(handler);
    }
}