// model.js
import Subject from "./subject.js";

class ShoppingModel extends Subject {
    #lists;
    #tags;
    static id = 0;

    constructor() {
        super();
        this.#lists = new Map();
        this.#tags = [];
        this.loadData();
    }

    // Daten aus data.json laden
    async loadData() {
        try {
            let response = await fetch("data.json");
            let data = await response.json();
            this.#tags = data.tags || [];
            data.lists.forEach(listData => {
                let articleObjects = listData.articles.map(articleId => ({
                    id: articleId,
                    quantity: 1
                }));
                const newList = {
                    id: listData.id,
                    name: listData.name,
                    status: listData.status,
                    icon: listData.icon || "",
                    articles: articleObjects
                };
                this.#lists.set(listData.id, newList);
            });
            this.notify("updateLists", this.lists);
        } catch (error) {
            console.error("Fehler beim Laden der Daten:", error);
        }
    }


    get lists() {
        return Array.from(this.#lists.values());
    }

    get tags() {
        return this.#tags;
    }

    getListById(id) {
        return this.#lists.get(Number(id));
    }

    //Artikel zur Liste hinzufügen
    addArticleToList(listId, articleId) {
        let list = this.#lists.get(Number(listId));
        if (!list) {
            console.error("Liste nicht gefunden:", listId);
            return;
        }
        let itemObj = list.articles.find(a => a.id === articleId);
        if (itemObj) {
            itemObj.quantity++;
        } else {
            list.articles.push({ id: articleId, quantity: 1 });
        }
        this.notify("updateLists", this.lists);
    }

    //Artikel von der Liste entfernen
    removeArticleFromList(listId, articleId) {
        let list = this.#lists.get(Number(listId));
        if (!list) {
            console.error("Liste nicht gefunden:", listId);
            return;
        }
        let itemObj = list.articles.find(a => a.id === Number(articleId));
        if (itemObj) {
            itemObj.quantity--;
            if (itemObj.quantity <= 0) {
                list.articles = list.articles.filter(a => a.id !== Number(articleId));
            }
        }
        this.notify("updateLists", this.lists);
    }

    //Liste erstellen
    addList(name, icon) {
        const newList = {
            id: Date.now(),
            name: name,
            icon: icon || "🛒",
            status: 'offen',
            articles: []
        };
        this.#lists.set(newList.id, newList);
        this.notify("updateLists", this.lists);
        return newList;
    }

    //Liste löschen
    deleteList(listId) {
        this.#lists.delete(Number(listId));
        this.notify("updateLists", this.lists);
    }

    //Liste abschließen
    completeList(listId) {
        let list = this.#lists.get(Number(listId));
        if (list) {
            list.status = 'abgeschlossen';
            this.notify("updateLists", this.lists);
        }
    }

    //Liste umbenennen
    updateList(listId, name, icon) {
        let list = this.#lists.get(Number(listId));
        if (list) {
            list.name = name;
            list.icon = icon || "🛒";
            this.notify("updateLists", this.lists);
        }
    }

    //Liste öffnen
    reopenList(listId) {
        let list = this.#lists.get(Number(listId));
        if (list) {
            list.status = 'offen';
            this.notify("updateLists", this.lists);
        }
    }
}

export const shoppingModelInstance = new ShoppingModel();
