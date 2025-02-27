class ArticleModel {
    #articles; // Private Instanzvariable von ArticleModel, nur innerhalb der Klasse sichtbar

    constructor() {
        this.#articles = [];
    }
    // Daten aus data.json laden
    async loadData() {
        try {
            let response = await fetch("data.json");
            let data = await response.json();
            this.#articles = data.articles || [];
            this.updateUI();
        } catch (error) {
            console.error("Fehler beim Laden der Artikel-Daten:", error);
        }
    }
    // Getter für Artikel
    get articles() {
        return this.#articles;
    }

    addArticle(name, icon, tag) {
        if (!name || !icon || !tag) {
            console.warn("Fehlende Felder beim Artikel anlegen!");
            return null;
        }
        let newArticle = {
            id: Date.now(),
            name,
            icon,
            tag,
            bought: false,
        };
        this.#articles.push(newArticle);

        this.updateUI();

        return newArticle;
    }

    updateArticle(articleId, name, icon, tag) {
        let article = this.#articles.find(a => a.id === parseInt(articleId));
        if (article) {
            article.name = name;
            article.icon = icon;
            article.tag = tag;
            this.updateUI();
        }
    }

    deleteArticle(articleId) {
        let index = this.#articles.findIndex(a => a.id === parseInt(articleId));
        if (index !== -1) {
            // ... die Logik
            this.#articles.splice(index, 1);
            this.updateUI();
        }
    }

    updateUI() {
        import("./articleView.js").then(({ articleViewInstance }) => {
            articleViewInstance.renderArticles(this.#articles);
        });
    }
}

export const articleModelInstance = new ArticleModel();