//subject.js
class Subject {
    constructor() {
        this.observers = {};
    }

    subscribe(event, listenerObj, callback) {
        if (!this.observers[event]) {
            this.observers[event] = [];
        }
        this.observers[event].push({ obj: listenerObj, fct: callback });
        console.log(`[Subject] Subscribed to event: ${event}`, listenerObj);
    }

    notify(event, data) {
        if (this.observers[event]) {
            console.log(`[Subject] Notifying ${this.observers[event].length} listeners for event: ${event}`, data);
            this.observers[event].forEach(subscriber => {
                subscriber.fct.call(subscriber.obj, data);
            });
        } else {
            console.warn(`[Subject] No listeners found for event: ${event}`);
        }
    }
}

export default Subject;