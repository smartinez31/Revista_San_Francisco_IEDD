import { state } from "./state.js";

export function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");

    const selected = document.getElementById(pageId);
    if (selected) selected.style.display = "block";

    state.currentPage = pageId;
}
