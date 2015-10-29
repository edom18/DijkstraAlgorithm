(function (namespace) {
    'use strict';

    class Inspector {
        constructor() {
            this._renderer = null;
            this._model    = null;
            this._element  = document.getElementById('inspector');

            this._element.addEventListener('click', (evt) => {
                this._model.set('cost', 10);
            }, false);
        }
        set selectedItem(model) {
            this._model = model;
            this._renderer = this.choiseRenderer(model);
            this.update();
        }
        choiseRenderer(model) {
            if (model.type === 'edge') {
                return new EdgeModelRenderer(model);
            }
            else if (model.type === 'node') {
                return new NodeModelRenderer(model);
            }
        }
        update() {
            this._renderer.update(this._element);
        }
        render() {
            this._renderer.render(this._element);
        }
    }

    class ModelRenderer {
        constructor(model) {
            this._model = model;
        }
        update(element) {
            element.innerHTML = '';
            this.render(element);
        }
        render(element) {
            element.innerHTML = `Type: ${this._model.type}, ID: ${this._model.id}`;
        }
    }

    class NodeModelRenderer extends ModelRenderer {
    }

    class EdgeModelRenderer extends ModelRenderer {
        render(element) {
            element.innerHTML = 'hoge';
        }
    }

    namespace.Inspector = Inspector;

}(window));
