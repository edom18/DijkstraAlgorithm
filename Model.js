(function (namespace) {
    'use strict';


    class Model {
        constructor() {
            this._dispatcher = new Dispatcher();
        }
        addListener(type, listener) {
            this._dispatcher.addListener(type, listener);
        }
        removeListener(type, listener) {
            this._dispatcher.removeListener(type, listener);
        }
        dispatch(type) {
            this._dispatcher.dispatch(type);
        }
    }

    // Exports.
    namespace.Model = Model;

}(window));
