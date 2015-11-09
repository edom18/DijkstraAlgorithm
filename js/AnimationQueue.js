(function (namespace) {
    'use strict';

    class AnimationQueue {
        constructor() {
            this._queue = [];
        }

        add(item) {
            this._queue.push(item);
        }

        start() {
            return new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject  = reject;
                this.next();
            })
        }

        next() {
            if (this._queue.length === 0) {
                console.log('animation queue ended');
                this.completion();
                return;
            }

            var item = this._queue.shift();
            item.start().then(this.next.bind(this));
        }

        completion() {
            if (this._resolve) {
                this._resolve();
                this._resolve = null;
                this._reject  = null;
            }
        }

        dispose() {
            this._queue = null;
            this._resolve = null;
            this._reject  = null;
        }
    }

    class AnimationQueueItem {
        constructor(animation, duration) {
            this._animation = animation;
            this._duration = duration;
        }

        start() {
            return new Promise((resolve, reject) => {
                Shape.animationWithDuration(this._duration, () => {
                    this._animation();
                }, () => {
                    this.completion(resolve, reject);
                });
            });
        }

        completion(resolve, reject) {
            resolve();
        }
    }

    // Exports
    namespace.AnimationQueue     = AnimationQueue;
    namespace.AnimationQueueItem = AnimationQueueItem;

}(window));
