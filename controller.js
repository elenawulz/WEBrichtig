// controller.js
import { shoppingModelInstance } from "./model.js";
import { shoppingViewInstance } from "./view.js";
import { tagViewInstance } from "./tagView.js";
import {articleModelInstance} from "./articleModel.js";

class ShoppingController {
    async init() {
        let dom = shoppingViewInstance.dom;
        shoppingModelInstance.subscribe("updateLists", shoppingViewInstance, shoppingViewInstance.renderLists);

        // Warten, bis Daten geladen sind
        await shoppingModelInstance.loadData();

        // Liste und Tags rendern
        shoppingViewInstance.renderLists(shoppingModelInstance.lists);
        tagViewInstance.renderTags(shoppingModelInstance.tags);

        // Detailansicht initial leeren
        shoppingViewInstance.renderDetailView(null);

        // Event für Klicks in der Listenübersicht
        dom.listContainer.onclick = (ev) => {
            let target = ev.target.closest(".card");
            if (!target) return;
            let listId = target.dataset.listid;
            if (!listId) return;
            if (ev.target.classList.contains("delete-list")) {
                this.deleteList(listId);
            } else {
                this.openList(listId);
            }
        };

        let articleModalElement = document.getElementById('article-modal');
        if (articleModalElement) {
            let articleModal = new bootstrap.Modal(articleModalElement);
            let openArticleModalBtn = document.getElementById('open-article-modal');
            if (openArticleModalBtn) {
                openArticleModalBtn.onclick = () => {
                    articleModal.show();
                };
            }
        }

        let addItemBtn = document.getElementById("add-item-btn");
        if (addItemBtn) {
            addItemBtn.onclick = () => {
                let itemNameInput = document.getElementById("item-name");
                let itemQuantityInput = document.getElementById("item-quantity");
                let listTitle = document.getElementById("list-title");
                if (!itemNameInput || !itemQuantityInput || !listTitle) return;
                let itemName = itemNameInput.value.trim();
                let itemQuantity = itemQuantityInput.value.trim();
                if (!itemName || !itemQuantity) return;
                let currentListId = listTitle.dataset.listid;
                if (!currentListId) {
                    alert("Bitte wähle eine Liste aus");
                    return;
                }

                shoppingModelInstance.addArticleToList(currentListId, itemName, itemQuantity);
                shoppingViewInstance.renderDetailView(shoppingModelInstance.getListById(currentListId));
                itemNameInput.value = "";
                itemQuantityInput.value = "";
            };
        }
    }

    // Öffnet eine Liste
    openList(listId) {
        const list = shoppingModelInstance.getListById(listId);
        if (list) {
            shoppingViewInstance.renderDetailView(list);
        }
    }
    // Liste hinzufügen
    addList(name, icon) {
        shoppingModelInstance.addList(name, icon);
        shoppingViewInstance.renderLists(shoppingModelInstance.lists);
    }
    // Liste löschen
    deleteList(listId) {
        shoppingModelInstance.deleteList(listId);
        shoppingViewInstance.renderLists(shoppingModelInstance.lists);
    }

    // Liste umbenennen
    updateList(listId, newName, newIcon) {
        shoppingModelInstance.updateList(listId, newName, newIcon);
        shoppingViewInstance.renderDetailView(shoppingModelInstance.getListById(listId));
        shoppingViewInstance.renderLists(shoppingModelInstance.lists);
    }

    // Liste abschließen Status auf "abgeschlossen" setzen
    completeList(listId) {
        const list = shoppingModelInstance.getListById(listId);
        if (list) {
            const modal = new bootstrap.Modal(document.getElementById('completeListModal'));
            document.getElementById('complete-list-name').textContent = list.name;
            document.getElementById('confirm-complete-list').addEventListener('click', () => {
                shoppingModelInstance.completeList(listId);
                modal.hide();
                shoppingViewInstance.renderDetailView(shoppingModelInstance.getListById(listId));
                shoppingViewInstance.renderLists(shoppingModelInstance.lists);
            }, { once: true }); // { once: true } sorgt dafür, dass der Listener nur einmal ausgeführt wird

            modal.show();
        }
    }
    // Bearbeiten einer Liste Modal
    openEditListModal(listId) {
        const list = shoppingModelInstance.getListById(listId);
        if (list) {
            const modal = new bootstrap.Modal(document.getElementById('editListModal'));
            document.getElementById('edit-list-name').value = list.name;
            document.getElementById('edit-list-icon').value = list.icon || '';
            document.getElementById('save-list-changes').addEventListener('click', () => {
                const newName = document.getElementById('edit-list-name').value.trim();
                const newIcon = document.getElementById('edit-list-icon').value.trim();
                if (newName) {
                    this.updateList(listId, newName, newIcon);
                    modal.hide();
                }
            }, { once: true });
            modal.show();
        }
    }

    // Artikel zur Liste hinzufügen
    updateArticleBoughtStatus(articleId, isBought) {
        let article = articleModelInstance.articles.find(a => a.id === articleId);
        if (article) {
            article.bought = isBought;
            const listTitle = document.getElementById("list-title");
            if (listTitle && listTitle.dataset.listid) {
                let currentList = shoppingModelInstance.getListById(listTitle.dataset.listid);
                if (currentList) {
                    shoppingViewInstance.renderDetailView(currentList);
                }
            }
        }
    }



    //öffnet eine Liste wieder (setzt den Status auf "offen")
    reopenList(listId) {
        shoppingModelInstance.reopenList(listId);
        shoppingViewInstance.renderDetailView(shoppingModelInstance.getListById(listId));
        shoppingViewInstance.renderLists(shoppingModelInstance.lists);
    }

    // entfernt einen Artikel aus einer Liste
    removeArticleFromList(listId, articleId) {
        shoppingModelInstance.removeArticleFromList(listId, articleId);
        shoppingViewInstance.renderDetailView(shoppingModelInstance.getListById(listId));
    }




}

export const shoppingControllerInstance = new ShoppingController();
