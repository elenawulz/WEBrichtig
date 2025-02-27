import { articleModelInstance } from './articleModel.js';

class TagView {
    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            this.dom = {
                addTagBtn: document.getElementById("add-new-tag"),
                tagList: document.getElementById("tag-list"),
                tagNameInput: document.getElementById("tag-name-input"),
                tagFilter: document.getElementById("tag-filter") // Tag-Dropdown für Filterung
            };

            if (!this.dom.tagList) {
                console.error("Fehlendes DOM-Element: #tag-list. Stelle sicher, dass es im HTML existiert.");
                return;
            }
            this.loadTags();
            this.attachEventListeners();
        });
    }

    loadTags() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.renderTags(data.tags);
                this.updateTagFilter(data.tags);
            })
            .catch(error => console.error('Fehler beim Laden der Tags:', error));
    }

    attachEventListeners() {
        if (this.dom.addTagBtn) {
            this.dom.addTagBtn.addEventListener("click", () => {
                let tagName = this.dom.tagNameInput.value.trim();
                if (tagName) {
                    this.addTag(tagName);
                    this.dom.tagNameInput.value = ""; // Input leeren
                } else {
                    alert("Bitte einen Tag-Namen eingeben.");
                }
            });
        }

        this.dom.tagList.addEventListener("click", (event) => {
            if (event.target.classList.contains("delete-tag")) {
                this.deleteTag(event);
            } else if (event.target.classList.contains("edit-tag")) {
                this.editTag(event);
            }
        });
    }

    addTag(tagName) {
        console.log("Neuer Tag hinzugefügt:", tagName);
        this.appendTag(tagName);
        this.updateTagFilter([...document.querySelectorAll("#tag-list .list-group-item span")].map(tag => tag.textContent));
    }

    appendTag(tagName) {
        let html = `
            <li class="list-group-item d-flex align-items-center justify-content-between">
                <span>${tagName}</span>
                <div>
                    <button class="btn btn-outline-secondary btn-sm edit-tag">✏️</button>
                    <button class="btn btn-outline-danger btn-sm delete-tag">🗑</button>
                </div>
            </li>`;
        this.dom.tagList.insertAdjacentHTML("beforeend", html);
    }

    renderTags(tags) {
        if (!this.dom.tagList) {
            console.error("Tag-Liste wurde nicht gefunden.");
            return;
        }
        this.dom.tagList.innerHTML = "";
        tags.forEach(tag => {
            this.appendTag(tag);
        });
    }
    //Tag-Filter aktualisieren in der Artikel-Übersicht
    updateTagFilter(tags) {
        if (!this.dom.tagFilter) {
            console.error("Tag-Filter wurde nicht gefunden.");
            return;
        }
        this.dom.tagFilter.innerHTML = '<option value="all">Alle</option>';
        tags.forEach(tag => {
            let option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            this.dom.tagFilter.appendChild(option);
        });
    }

    deleteTag(event) {
        let tagElement = event.target.closest("li");
        let tagName = tagElement.querySelector("span").textContent;

        // Check if the tag is assigned to any article
        let isTagAssigned = articleModelInstance.articles.some(article => article.tag === tagName);
        if (isTagAssigned) {
            alert(`Der Tag '${tagName}' ist einem Artikel zugeordnet und kann nicht gelöscht werden.`);
            return;
        }

        if (confirm(`Soll der Tag '${tagName}' wirklich gelöscht werden?`)) {
            tagElement.remove();
            this.updateTagFilter([...document.querySelectorAll("#tag-list .list-group-item span")].map(tag => tag.textContent));
        }
    }

    editTag(event) {
        let tagElement = event.target.closest("li").querySelector("span");
        let oldTagName = tagElement.textContent;
        let newTagName = prompt("Neuen Tag-Namen eingeben:", oldTagName);
        if (newTagName) {
            tagElement.textContent = newTagName;
            this.updateTagFilter([...document.querySelectorAll("#tag-list .list-group-item span")].map(tag => tag.textContent));
            this.updateArticleTags(oldTagName, newTagName);
        }
    }

    updateArticleTags(oldTagName, newTagName) {
        articleModelInstance.articles.forEach(article => {
            if (article.tag === oldTagName) {
                article.tag = newTagName;
            }
        });
    }
}

export const tagViewInstance = new TagView();