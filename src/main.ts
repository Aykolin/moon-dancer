import { mount } from "svelte";
import App from "./App.svelte";
import MascotWindow from "./MascotWindow.svelte";
import "./styles.css";

const isMascotWindow = new URLSearchParams(window.location.search).get("window") === "mascot";
const app = mount(isMascotWindow ? MascotWindow : App, { target: document.getElementById("app")! });

export default app;
