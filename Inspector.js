(function (namespace) {
    'use strict';

    class Inspector {
        constructor() {
            this._model = null;
            this._element = document.getElementById('inspector');
        }
        set selectedItem(model) {
            this._model = model;
            this.update();
        }
        update() {
            this._element.innerHTML = '';
            this.render();
        }
        render() {
            this._element.innerHTML = `Type: ${this._model.type}, ID: ${this._model.id}`;
        }
    }

    namespace.Inspector = Inspector;

}(window));
