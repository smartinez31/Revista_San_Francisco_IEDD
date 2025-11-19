import { apiRequest } from "./api.js";
import { loadDataFromStorage, saveDataToStorage } from "./storage.js";
import { loadPublicMagazine } from "./magazine.js";
import { showPage } from "./navigation.js";
import { state } from "./state.js";

export async function initApp() {
    try {
        await apiRequest("/health");

        // cargar datos reales
        const articles = await apiRequest("/articles?status=published");
        state.articles = articles.articles || [];

        saveDataToStorage();
    } catch (error) {
        console.log("Modo offline activado");
        loadDataFromStorage();
    }

    loadPublicMagazine();
    showPage("public-magazine-page");
}
