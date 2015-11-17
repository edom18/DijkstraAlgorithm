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
            super.clearEvents();

            if (!this.element) {
                return;
            }

            this._startCheckbox.removeEventListener('click', this.changeHandler);
            this._goalCheckbox.removeEventListener('click',  this.changeHandler);
        }

        setupElements() {
            this._typeField     = this.element.querySelector('.typeField');
            this._costElement   = this.element.querySelector('.cost');
            this._costField     = this.element.querySelector('.costField');
            this._startCheckbox = this.element.querySelector('.startNodeCheckbox');
            this._goalCheckbox  = this.element.querySelector('.goalNodeCheckbox');
        }

        _changeHandler(evt) {
            this.change(evt);
        }

        change(evt) {
            if (evt.target === this._startCheckbox) {
                this._model.set('isStart', !this.isStart);
            }
            else if (evt.target === this._goalCheckbox) {
                this._model.set('isGoal', !this.isGoal);
            }
        }

        update() {
            this.render();
        }

        setupEvents() {
            this._startCheckbox.addEventListener('click', this.changeHandler, false);
            this._goalCheckbox.addEventListener('click',  this.changeHandler, false);
        }

        render() {
            if (this._model.type === 'node') {
                this._typeField.classList.add('typeNode');
            }
            else {
                this._typeField.classList.remove('typeNode');
            }

            this._costElement.classList.add('disabled');
            this._costField.value = '';
            this._costField.disabled = true;

            this.isStart = this._model.isStart;
            this.isGoal  = this._model.isGoal;
        }

        dispose() {
            super.dispose();

            this._costField.value    = '';
            this._costField.disabled = false;
            this._typeField.classList.remove('typeNode');
            this._costElement.classList.remove('disabled');

            this.isStart = false;
            this.isGoal  = false;
        }

        /**
         * is start
         */
        set isStart(value) {
            if (value) {
                this._startCheckbox.dataset.checked = 'true';
                this._startCheckbox.classList.add('checked');
            }
            else {
                this._startCheckbox.dataset.checked = 'false';
                this._startCheckbox.classList.remove('checked');
            }
        }
        get isStart() {
            return this._startCheckbox.dataset.checked === 'true' ? true : false;
        }

        /**
         * is goal
         */
        set isGoal(value) {
            if (value) {
                this._goalCheckbox.dataset.checked = 'true';
                this._goalCheckbox.classList.add('checked');
            }
            else {
                this._goalCheckbox.dataset.checked = 'false';
                this._goalCheckbox.classList.remove('checked');
            }
        }
        get isGoal() {
            return this._goalCheckbox.dataset.checked === 'true' ? true : false;
        }
    }


    /**
     * Edge model renderer
     */
    class EdgeModelRenderer extends ModelRenderer {
        constructor(model) {
            super(model);

            this.changeHandler = this._changeHandler.bind(this);
        }

        clearEvents() {
            super.clearEvents();

            if (!this.element) {
                return;
            }

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
            this._typeField   = this.element.querySelector('.typeField');
            this._costField   = this.element.querySelector('.costField');
            this._costElement = this.element.querySelector('.cost');
        }

        setupEvents() {
            this._costField.addEventListener('change', this.changeHandler, false);
        }

        render() {
            if (this._model.type === 'edge') {
                this._typeField.classList.add('typeEdge');
            }
            else {
                this._typeField.classList.remove('typeEdge');
            }

            this._costField.value = this._model.cost;
            this._costElement.classList.remove('disabled');
        }

        dispose() {
            super.dispose();

            this._costField.value    = '';
            this._costField.disabled = false;
            this._typeField.classList.remove('typeEdge');
            this._costElement.classList.remove('disabled');
        }
    }

    namespace.Inspector = Inspector;

}(window));
