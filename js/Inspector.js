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

            this.render();
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

            this._modelListener = new Listener('error', (target, referData) => {
                console.log(target, referData);
            });
            this._model.addListener(this._modelListener);
            this.updateHandler = this._updateHandler.bind(this);
        }

        clearEvents() {
            if (!this.element) {
                return;
            }
            this._updateButton.removeEventListener('click', this.updateHandler, false);
            this._model.removeListener(this._modelListener);
            this._modelListener = null;
        }

        update() {
            this._typeField     = this.element.querySelector('.typeField');
            this._costField     = this.element.querySelector('.costField');
            this._updateButton  = this.element.querySelector('.updateButton');
            this._startCheckbox = this.element.querySelector('.startNodeCheckbox');
            this._goalCheckbox  = this.element.querySelector('.goalNodeCheckbox');
        }

        _updateHandler(evt) {
            var isStart = this._startCheckbox.checked;
            var isGoal  = this._goalCheckbox.checked;
            this._model.set('isStart', isStart);
            this._model.set('isGoal', isGoal);
        }

        setupEvents() {
            this._updateButton.addEventListener('click', this.updateHandler, false);
        }

        render() {
            this._typeField.innerHTML = this._model.type;
            this._costField.value     = this._model.cost;

            this._startCheckbox.checked = this._model.isStart;
            this._goalCheckbox.checked  = this._model.isGoal;
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
