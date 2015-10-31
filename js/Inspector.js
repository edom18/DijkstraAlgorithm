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

    /**
     * Model renderer base class.
     *
     * @param {Model} Want to be shown a model.
     */
    class ModelRenderer {
        constructor(model) {
            this._model   = model;
            this._element = null;

            this._modelErrorListener = new Listener('error', (target, referData) => {
                console.log(target, referData);
            });
            this._model.addListener(this._modelErrorListener);

            this._modelListener = new Listener('change', (target, referData) => {
                this.update();
            });
            this._model.addListener(this._modelListener);
        }

        /**
         * This is a virtual method.
         * Render the model data.
         */
        render() { }

        /**
         * Set up each events for DOMs.
         */
        setupEvents() { }

        /**
         * Update if the model is updated.
         */
        update() { }

        /**
         * Clear all events.
         */
        clearEvents() {
            this._model.removeListener(this._modelErrorListener);
            this._modelErrorListener = null;

            this._model.removeListener(this._modelListener);
            this._modelListener = null;
        }

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

        /**
         * Dispose. Call for discard this class.
         */
        dispose() {
            this.clearEvents();
        }
    }

    class NodeModelRenderer extends ModelRenderer {
        constructor(model) {
            super(model);

            this.changeHandler = this._changeHandler.bind(this);
        }

        clearEvents() {
            if (!this.element) {
                return;
            }

            super.clearEvents();
            this._startCheckbox.removeEventListener('change', this.changeHandler);
            this._goalCheckbox.removeEventListener('change',  this.changeHandler);
        }

        setupElements() {
            this._typeField     = this.element.querySelector('.typeField');
            this._costField     = this.element.querySelector('.costField');
            this._startCheckbox = this.element.querySelector('.startNodeCheckbox');
            this._goalCheckbox  = this.element.querySelector('.goalNodeCheckbox');
        }

        _changeHandler(evt) {
            this.change();
        }

        change() {
            var isStart = this._startCheckbox.checked;
            var isGoal  = this._goalCheckbox.checked;
            this._model.set('isStart', isStart);
            this._model.set('isGoal', isGoal);
        }

        update() {
            this.render();
        }

        setupEvents() {
            this._startCheckbox.addEventListener('change', this.changeHandler, false);
            this._goalCheckbox.addEventListener('change',  this.changeHandler, false);
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

            this.changeHandler = this._changeHandler.bind(this);
        }

        clearEvents() {
            if (!this.element) {
                return;
            }

            super.clearEvents();

            this._costField.removeEventListener('change', this.changeHandler);
        }

        _changeHandler(evt) {
            this.change();
        }

        change() {
            var cost = +this._costField.value;
            this._model.set('cost', cost);
        }

        update() {
            this.render();
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
