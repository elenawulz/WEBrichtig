// view.js
//import { shoppingViewInstance } from "./view.js"; // Hier wird die eigene Instanz nicht benötigt
import { shoppingControllerInstance } from "./controller.js";
import { articleModelInstance } from "./articleModel.js";

class ShoppingView {
    #dom;

    constructor() {
        this.#dom = {
            listContainer: document.querySelector("#shopping-lists"),
            addListBtn: document.querySelector("#add-list-btn"),
            listNameInput: document.querySelector("#list-name"),
            listIconInput: document.querySelector("#list-icon"),
            detailView: document.querySelector("#detail-view"),
            listTitle: document.querySelector("#list-title"),
            itemList: document.querySelector("#item-list"),
            listStatus: document.querySelector("#list-status"),
            completeListBtn: document.querySelector("#complete-list-btn"),
            editListBtn: document.querySelector("#edit-list-btn")
        };

        if (this.#dom.addListBtn) {
            this.#dom.addListBtn.addEventListener("click", () => this.handleAddList());
        }
        if (this.#dom.editListBtn) {
            this.#dom.editListBtn.addEventListener("click", () => this.openEditListModal());
        }
    }

    get dom() {
        return this.#dom;
    }

    handleAddList() {
        const name = this.#dom.listNameInput.value.trim();
        const icon = this.#dom.listIconInput.value.trim();
        if (!name) {
            alert("Bitte Namen angeben");
            return;
        }
        shoppingControllerInstance.addList(name, icon);
        this.#dom.listNameInput.value = "";
        this.#dom.listIconInput.value = "";
    }

    renderLists(lists) {
        console.log("Rendering Lists:", lists);
        this.#dom.listContainer.innerHTML = "";
        lists.forEach(list => {
            let html = `<div class="card p-3 mb-2 shadow-sm list-slide-up" data-listid='${list.id}'>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title">${list.icon ? list.icon : "🛒"} ${list.name}</h5>
                                <span class="badge ${list.status === 'offen' ? 'bg-success' : 'bg-secondary'}">${list.status}</span>
                            </div>
                            <button class="btn btn-danger delete-list">Löschen</button>
                        </div>
                    </div>`;
            this.#dom.listContainer.insertAdjacentHTML("beforeend", html);
        });

        // Event-Listener für die Listenübersicht
        this.#dom.listContainer.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (event) => {
                if (event.target.classList.contains('delete-list')) {
                    const listId = card.dataset.listid;
                    shoppingControllerInstance.deleteList(listId);
                } else {
                    const listId = card.dataset.listid;
                    shoppingControllerInstance.openList(listId);
                    // Für Handy: Detailansicht anzeigen und linke Spalte ausblenden
                    if (window.innerWidth <= 768) {
                        document.getElementById("detail-view").classList.add("show");
                        document.getElementById("left-col").style.display = "none";
                    }
                }
            });
        });
    }

    renderDetailView(list) {
        console.log("Rendering Detail View for List:", list);
        if (!list) {
            this.#dom.listTitle.textContent = "Keine Liste ausgewählt";
            this.#dom.listTitle.removeAttribute("data-listid");
            this.#dom.listStatus.textContent = "";
            this.#dom.itemList.innerHTML = "";
            this.#dom.completeListBtn.style.display = "none";
            this.#dom.editListBtn.style.display = "none";
            return;
        }
        if (!this.#dom.listTitle || !this.#dom.itemList || !this.#dom.listStatus || !this.#dom.detailView) {
            console.error("Fehlende DOM-Elemente für Detailansicht");
            return;
        }
        this.#dom.listTitle.dataset.listid = list.id;
        this.#dom.listTitle.innerHTML = `${list.icon ? list.icon : "🛒"} ${list.name}`;
        this.#dom.listStatus.innerHTML = `<span class="badge ${list.status === 'offen' ? 'bg-success' : 'bg-secondary'}">${list.status}</span>`;


        const backBtn = document.getElementById("back-to-lists-btn");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                document.getElementById("detail-view").classList.remove("show");
                document.getElementById("left-col").style.display = "block";
            });
        }
        let articleTagsBtn = document.getElementById("open-article-tags-btn");
        if (articleTagsBtn) {
            articleTagsBtn.onclick = () => {
                if (window.innerWidth < 768) {
                    document.getElementById("detail-view").classList.add("hide");
                    document.getElementById("right-col").classList.add("show");
                }
            };
        }
        let backToDetailBtn = document.getElementById("back-to-detail-btn");
        if (backToDetailBtn) {
            backToDetailBtn.onclick = () => {
                if (window.innerWidth < 768) {
                    document.getElementById("right-col").classList.remove("show");
                    document.getElementById("detail-view").classList.remove("hide");
                }
            };
        }

        this.#dom.completeListBtn.style.display = "inline-block";
        this.#dom.editListBtn.style.display = "inline-block";


        if (list.status === 'offen') {
            this.#dom.completeListBtn.textContent = "Liste abschließen";

            this.#dom.completeListBtn.onclick = () => shoppingControllerInstance.completeList(list.id);
        } else {
            this.#dom.completeListBtn.textContent = "Liste öffnen";

            this.#dom.completeListBtn.onclick = () => shoppingControllerInstance.reopenList(list.id);
        }

        if (!list.articles || !Array.isArray(list.articles)) {
            this.#dom.itemList.innerHTML = "<p>Keine Artikel in dieser Liste.</p>";
            return;
        }
        this.#dom.itemList.innerHTML = list.articles.map(itemObj => {
            let baseArticle = articleModelInstance.articles.find(a => a.id === itemObj.id);
            if (!baseArticle) {
                console.warn("Artikel nicht gefunden für ID:", itemObj.id);
                return "";
            }
            return `
    <li class="list-group-item d-flex justify-content-between align-items-center" data-id="${itemObj.id}">
        <div>
            <input type="checkbox" class="form-check-input me-2" data-id="${itemObj.id}" ${baseArticle.bought ? 'checked' : ''}> 
            ${baseArticle.icon} ${baseArticle.name}
        </div>
        <div>
            x${itemObj.quantity}
            <button class="btn btn-sm btn-danger remove-article" data-id="${itemObj.id}">Entfernen</button>
        </div>
    </li>`;
        }).join('');

        this.#dom.itemList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener("change", (event) => {
                let articleId = Number(event.target.dataset.id);
                shoppingControllerInstance.updateArticleBoughtStatus(articleId, event.target.checked);
            });
        });


        if (this.#dom.detailView) {
            this.#dom.detailView.style.display = "block";
        }

        this.#dom.itemList.querySelectorAll('.remove-article').forEach(button => {
            button.addEventListener('click', (event) => {
                const articleId = event.target.dataset.id;
                shoppingControllerInstance.removeArticleFromList(list.id, articleId);
            });
        });
    }


    openEditListModal() {
        const listId = this.#dom.listTitle.dataset.listid;
        shoppingControllerInstance.openEditListModal(listId);
    }

}

export const shoppingViewInstance = new ShoppingView();
