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
        update() { }

        set element(value) {
            if (this._element === value) {
                return;
            }

            this.clearEvents();
            this._element = value;

            this.setupElements();
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

            this._modelErrorListener = new Listener('error', (target, referData) => {
                console.log(target, referData);
            });
            this._model.addListener(this._modelErrorListener);

            this._modelListener = new Listener('change', (target, referData) => {
                console.log(referData);
            });
            this._model.addListener(this._modelListener);

            this.updateHandler = this._updateHandler.bind(this);
        }

        clearEvents() {
            if (!this.element) {
                return;
            }

            this._typeField.removeEventListener('change',     this.updateHandler);
            this._costField.removeEventListener('change',     this.updateHandler);
            this._startCheckbox.removeEventListener('change', this.updateHandler);
            this._goalCheckbox.removeEventListener('change',  this.updateHandler);

            this._model.removeListener(this._modelErrorListener);
            this._modelErrorListener = null;

            this._model.removeListener(this._modelListener);
            this._modelListener = null;
        }

        setupElements() {
            this._typeField     = this.element.querySelector('.typeField');
            this._costField     = this.element.querySelector('.costField');
            this._startCheckbox = this.element.querySelector('.startNodeCheckbox');
            this._goalCheckbox  = this.element.querySelector('.goalNodeCheckbox');
        }

        _updateHandler(evt) {
            this.update();
        }

        update() {
            var isStart = this._startCheckbox.checked;
            var isGoal  = this._goalCheckbox.checked;
            this._model.set('isStart', isStart);
            this._model.set('isGoal', isGoal);
        }

        setupEvents() {
            this._typeField.addEventListener('change',     this.updateHandler, false);
            this._costField.addEventListener('change',     this.updateHandler, false);
            this._startCheckbox.addEventListener('change', this.updateHandler, false);
            this._goalCheckbox.addEventListener('change',  this.updateHandler, false);
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

            this._costField.removeEventListener('change', this.updateHandler);
        }

        _updateHandler(evt) {
            this.update();
        }

        update() {
            var cost = +this._costField.value;
            this._model.set('cost', cost);
        }

        setupElements() {
            this._typeField = this.element.querySelector('.typeField');
            this._costField = this.element.querySelector('.costField');
        }

        setupEvents() {
            this._costField.addEventListener('change', this.updateHandler, false);
        }

        render() {
            this._typeField.innerHTML = this._model.type;
            this._costField.value     = this._model.cost;
        }
    }

    namespace.Inspector = Inspector;

}(window));
