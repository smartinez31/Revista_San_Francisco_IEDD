import { state } from "./state.js";
import { showPage } from "./navigation.js";

export function logout() {
    state.currentUser = null;
    showPage("public-magazine-page");
}
