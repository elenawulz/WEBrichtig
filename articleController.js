// articleController.js
import { articleModelInstance } from "./articleModel.js";
import { articleViewInstance } from "./articleView.js";
import { shoppingModelInstance } from "./model.js";
import { shoppingViewInstance } from "./view.js";

class ArticleController {
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.loadInitialData();
            this.attachEventListeners();
        });
    }

    async loadInitialData() {
        console.log("Lade Daten...");
        await articleModelInstance.loadData();
        articleViewInstance.renderArticles(articleModelInstance.articles)
    }

    addArticle(name, icon, tag) {
        articleModelInstance.addArticle(name, icon, tag);
        articleViewInstance.renderArticles(articleModelInstance.articles);
        articleViewInstance.updateDetailViewForOpenList();
    }

    updateArticle(articleId, name, icon, tag) {
        articleModelInstance.updateArticle(articleId, name, icon, tag);
        articleViewInstance.renderArticles(articleModelInstance.articles);
        articleViewInstance.updateDetailViewForOpenList();
    }

    deleteArticle(articleId) {
        articleModelInstance.deleteArticle(articleId);
        articleViewInstance.renderArticles(articleModelInstance.articles);
        articleViewInstance.updateDetailViewForOpenList();
    }
    // 1. Event-Listener für die Artikel-Liste, damit Artikel zur Liste hinzu gefügt werden können
    attachEventListeners() {
        let addArticleBtn = document.getElementById("add-new-article");
        if (addArticleBtn) {
            addArticleBtn.addEventListener("click", () => {
                console.log("Neuen Artikel hinzufügen geklickt");
            });
        }

        let addSelectedItemsBtn = document.getElementById("add-selected-items");
        if (addSelectedItemsBtn) {
            addSelectedItemsBtn.addEventListener("click", () => {
                console.log("Artikel zur Liste hinzufügen geklickt");
                this.addArticlesToList();
            });
        }
    }

    // 2. Funktion zum Hinzufügen von Artikeln zur Liste
    addArticlesToList() {
        console.log("Artikel zur Liste hinzufügen wurde geklickt."); // 1. Check: Wird die Funktion aufgerufen?

        let selectedListId = document.getElementById("list-title").dataset.listid;
        console.log("Aktuelle Listen-ID:", selectedListId); // 2. Check: Hat die Liste eine ID?

        if (!selectedListId) {
            alert("Bitte wähle zuerst eine Liste aus!");
            return;
        }

        let selectedItems = Array.from(document.querySelectorAll(".list-group-item input[type=checkbox]:checked"));
        console.log("Ausgewählte Artikel:", selectedItems); // 3. Check: Sind Artikel ausgewählt?

        if (selectedItems.length === 0) {
            alert("Bitte mindestens einen Artikel auswählen!");
            return;
        }
        function highlightArticleInDetail(listId, articleId) {
            let list = shoppingModelInstance.getListById(listId);
            shoppingViewInstance.renderDetailView(list);

            // jetzt bekommt <li data-id="...">
            let itemNode = document.querySelector(`#item-list [data-id='${articleId}']`);
            if (itemNode) {
                itemNode.classList.add("pulse");
                setTimeout(() => {
                    itemNode.classList.remove("pulse");
                }, 1000);
            }
        }


        selectedItems.forEach(item => {
            let articleId = Number(item.getAttribute("data-id"));
            console.log("Artikel-ID:", articleId); // 4. Check: Ist die Artikel-ID korrekt?

            if (!articleId) {
                console.error("Fehler: Artikel-ID nicht gefunden!");
                return;
            }

            shoppingModelInstance.addArticleToList(selectedListId, articleId);

            highlightArticleInDetail(selectedListId, articleId);
        });


        alert("Artikel erfolgreich zur Liste hinzugefügt!");

        // 5. Überprüfung: Anzeigen, ob die Liste aktualisiert wurde
        let updatedList = shoppingModelInstance.getListById(selectedListId);
        console.log("Aktualisierte Liste nach dem Hinzufügen:", updatedList);
        selectedItems.forEach(item => item.checked = false);
    }
}

export const articleControllerInstance = new ArticleController();