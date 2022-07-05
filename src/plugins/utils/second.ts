import { writable } from "svelte/store";

export let second = writable(Date.now())
setInterval(() => (second.set(Date.now())), 1000)