// articleView.js
import { articleModelInstance } from './articleModel.js';
import { shoppingModelInstance } from "./model.js";
import { shoppingViewInstance } from "./view.js";
import {articleControllerInstance} from "./articleController.js";

class ArticleView {
    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            this.dom = {
                searchInput: document.getElementById("article-search"),
                addArticleBtn: document.getElementById("add-new-article"),
                itemList: document.getElementById("modal-item-list"),
                addSelectedItemsBtn: document.getElementById("add-selected-items"),
                tagFilter: document.getElementById("tag-filter"),
                addArticleModal: new bootstrap.Modal(document.getElementById("addArticleModal")),
                addArticleForm: document.getElementById("add-article-form"),
                articleNameInput: document.getElementById("article-name"),
                articleIconInput: document.getElementById("article-icon"),
                articleTagSelect: document.getElementById("article-tag"),
                addArticleSubmitBtn: document.querySelector("#add-article-form button[type='submit']")
            };
            this.attachEventListeners();
            this.loadTags();
        });
    }

    attachEventListeners() {
        if (this.dom.addArticleBtn) {
            this.dom.addArticleBtn.addEventListener("click", () => {
                this.clearArticleForm();
                this.dom.addArticleSubmitBtn.textContent = "Hinzufügen";
                this.dom.addArticleModal.show();
            });
        }

        if (this.dom.addArticleForm) {
            this.dom.addArticleForm.addEventListener("submit", (event) => {
                event.preventDefault();
                this.addOrUpdateArticle();
            });
        }

        if (this.dom.tagFilter) {
            this.dom.tagFilter.addEventListener("change", () => {
                let selectedTag = this.dom.tagFilter.value;
                this.filterArticlesByTag(selectedTag);
            });
        }
    }

    loadTags() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.populateTagSelect(data.tags);
            })
            .catch(error => console.error('Fehler beim Laden der Tags:', error));
    }

    populateTagSelect(tags) {
        this.dom.articleTagSelect.innerHTML = ''; // Clear existing options
        tags.forEach(tag => {
            let option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            this.dom.articleTagSelect.appendChild(option);
        });
    }
    //Artikelformular leeren, nach hinzufügen oder bearbeiten
    clearArticleForm() {
        this.dom.articleNameInput.value = '';
        this.dom.articleIconInput.value = '';
        this.dom.articleTagSelect.value = '';
        this.dom.addArticleForm.dataset.articleId = '';
    }
    //Artikel hinzufügen oder bearbeiten
    addOrUpdateArticle() {
        const name = this.dom.articleNameInput.value.trim();
        const icon = this.dom.articleIconInput.value.trim();
        const tag = this.dom.articleTagSelect.value;
        const articleId = this.dom.addArticleForm.dataset.articleId;

        if (!name || !icon || !tag) {
            alert("Bitte alle Felder ausfüllen.");
            return;
        }

        // Sende Info an Controller => (articleId ? edit : add)
        if (articleId) {
            // wir feuern ein Event => oder rufen `articleControllerInstance.updateExistingArticle(...)`
            articleControllerInstance.updateArticle(articleId, name, icon, tag);
        } else {
            articleControllerInstance.addArticle(name, icon, tag);
        }

        // Form schließen
        this.dom.addArticleModal.hide();
        this.dom.addArticleForm.reset();
    }


    // Detailansicht aktualisieren, wenn eine Liste geöffnet ist
    updateDetailViewForOpenList() {
        const listTitle = document.getElementById("list-title");
        if (!listTitle) return;
        const currentListId = listTitle.dataset.listid;
        if (!currentListId) return;

        const currentList = shoppingModelInstance.getListById(currentListId);
        if (currentList) {
            // Erneut Detailansicht zeichnen
            shoppingViewInstance.renderDetailView(currentList);
        }
    }
    //Artikel in der Artikel-Übersicht anzeigen
    renderArticles(articles) {
        if (!this.dom.itemList) {
            console.error("Artikel-Liste wurde nicht gefunden.");
            return;
        }
        this.dom.itemList.innerHTML = "";
        articles.forEach(article => {
            let html = `
            <li class="list-group-item d-flex align-items-center justify-content-between">
                <div>
                    <input type="checkbox" class="form-check-input me-2" data-id="${article.id}">
                    <strong>${article.icon} ${article.name}</strong>
                </div>
                <div class="d-flex align-items-center">
                    <input type="number" class="form-control form-control-sm mx-1 text-center"
                           style="width: 60px;" value="1" min="1" data-id="${article.id}">
                    <button class="btn btn-outline-secondary btn-sm edit-article ms-2" data-id="${article.id}">✏️</button>
                    <button class="btn btn-outline-danger btn-sm delete-article ms-2" data-id="${article.id}">🗑</button>
                </div>
            </li>`;
            this.dom.itemList.insertAdjacentHTML("beforeend", html);
        });

        this.attachItemEventListeners();
    }
    //Artikel nach Tag filtern
    filterArticlesByTag(tag) {
        let filteredArticles;
        if (tag === "all") {
            filteredArticles = articleModelInstance.articles;
        } else {
            filteredArticles = articleModelInstance.articles.filter(article => article.tag === tag);
        }
        this.renderArticles(filteredArticles);
    }
    //Event-Listener für Artikel-Liste
    attachItemEventListeners() {
        document.querySelectorAll(".edit-article").forEach(button => {
            button.addEventListener("click", (event) => {
                let articleId = event.target.dataset.id;
                this.editArticle(articleId);
            });
        });

        document.querySelectorAll(".delete-article").forEach(button => {
            button.addEventListener("click", (event) => {
                let articleId = event.target.dataset.id;
                this.deleteArticle(articleId);
            });
        });
    }
    //Artikel bearbeiten
    editArticle(articleId) {
        const article = articleModelInstance.articles.find(a => a.id === parseInt(articleId));
        if (article) {
            this.dom.articleNameInput.value = article.name;
            this.dom.articleIconInput.value = article.icon;
            this.dom.articleTagSelect.value = article.tag;
            this.dom.addArticleForm.dataset.articleId = article.id;
            this.dom.addArticleSubmitBtn.textContent = "Speichern";
            this.dom.addArticleModal.show();
        }
    }
    //Artikel löschen
    deleteArticle(articleId) {
        if (this.isArticleInAnyList(articleId)) {
            alert("Artikel ist in einer Liste ...");
            return;
        }
        // Ruf Controller statt direkt array
        articleControllerInstance.deleteArticle(articleId);
    }
    //Prüfen ob Artikel in einer Liste ist
    isArticleInAnyList(articleId) {
        for (let list of shoppingModelInstance.lists) {
            let found = list.articles.find(a => a.id === parseInt(articleId));
            if (found) return true;
        }
        return false;
    }
}

export const articleViewInstance = new ArticleView();
