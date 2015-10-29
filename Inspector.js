(function (namespace) {
    'use strict';

    class Inspector {
        constructor() {
            this._renderer = null;
            this._model    = null;
            this._element  = document.getElementById('inspector');
        }
        set selectedItem(model) {
            this._model = model;
            if (this._renderer) {
                this._renderer.dispose();
            }
            this._renderer = this.choiseRenderer(model);
            this._renderer.element = this._element;
            this._renderer.render();
        }
        choiseRenderer(model) {
            if (model.type === 'edge') {
                return new EdgeModelRenderer(model);
            }
            else if (model.type === 'node') {
                return new NodeModelRenderer(model);
            }
        }
        render() {
            this._renderer.render();
        }
    }

    class ModelRenderer {
        constructor(model) {
            this._model   = model;
            this._element = null;
        }
        render() { }
        setupEvents() { }
        clearEvents() { }

        set element(value) {
            if (this._element === value) {
                return;
            }

            this.clearEvents();
            this._element = value;

            this.update();
            this.setupEvents();
        }
        get element() {
            return this._element;
        }

        dispose() {
            this.clearEvents();
        }
    }

    class NodeModelRenderer extends ModelRenderer {
        constructor(model) {
            super(model);

            this.updateHandler = this._updateHandler.bind(this);
        }

        clearEvents() {
            if (!this.element) {
                return;
            }
            this._updateButton.removeEventListener('click', this.updateHandler, false);
        }

        update() {
            this._typeField    = this.element.querySelector('.typeField');
            this._costField    = this.element.querySelector('.costField');
            this._updateButton = this.element.querySelector('.updateButton');
        }

        _updateHandler(evt) {
            console.log(this);
        }

        setupEvents() {
            this._updateButton.addEventListener('click', this.updateHandler, false);
        }
        render() {
            this._typeField.innerHTML = this._model.type;
            this._costField.innerHTML = this._model.cost;
        }
    }

    class EdgeModelRenderer extends ModelRenderer {
        constructor(model) {
            super(model);

            this.updateHandler = this._updateHandler.bind(this);
        }

        clearEvents() {
            if (!this.element) {
                return;
            }
            this._updateButton.removeEventListener('click', this.updateHandler, false);
        }

        _updateHandler(evt) {
            var cost = +this._costField.value;
            this._model.set('cost', cost);
        }

        update() {
            this._typeField    = this.element.querySelector('.typeField');
            this._costField    = this.element.querySelector('.costField');
            this._updateButton = this.element.querySelector('.updateButton');
        }

        setupEvents() {
            this._updateButton.addEventListener('click', this.updateHandler, false);
        }

        render() {
            this._typeField.innerHTML = this._model.type;
            this._costField.value     = this._model.cost;
        }
    }

    namespace.Inspector = Inspector;

}(window));
