import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const xml = await Deno.readTextFile("P03-07/P03-07.xml");
const doc = new DOMParser().parseFromString(xml, "text/html");

const p = doc.querySelector("exchangeMetadata"); // なぜかエラー
console.log(p);
/*

return;

console.log(p.textContent); // "Hello from Deno!"
console.log(p.childNodes[1].textContent); // "Deno!"

p.innerHTML = "DOM in <b>Deno</b> is pretty cool";
console.log(p.children[0].outerHTML); // "<b>Deno</b>"
*/