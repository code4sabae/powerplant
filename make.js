import { CSV } from "https://code4sabae.github.io/js/CSV.js";

const fn = "P03-07/P03-07.xml";
//const fn = "P03-13/P03-13.xml"; // format違う
const xml = await Deno.readTextFile(fn);

const lines = xml.split("\n").map(s => s.trim());
const poss = {};
const plants = [];
let pos = null;
let plant = null;
for (const line of lines) {
  if (line.startsWith("<jps:GM_Point id=\"")) {
    const id = line.substring(18, line.lastIndexOf("\""));
    //console.log(id, line);
    poss[id] = pos = {};
  }
  if (line.startsWith("<DirectPosition.coordinate>")) {
    const n = line.indexOf(" ");
    const m = line.indexOf("<", 27);
    pos["schema:latitude"] = line.substring(27, n);
    pos["schema:longitude"] = line.substring(n + 1, m);
    //console.log(lat, lng, line);
  }
  if (line.startsWith("<ksj:FC")) {
    const id = line.substring(14, line.lastIndexOf("\""));
    plant = {};
    plants.push(plant);
    plant["schema:identifier"] = id;
  } else if (plant) {
    if (line.startsWith("<ksj:")) {
      const ns = line.indexOf(" ");
      const n = ns < 0 ? line.indexOf(">") : ns;
      const tag = line.substring(1, n);
      //console.log(tag);
      if (line.startsWith("<" + tag + ">") && line.endsWith("</" + tag + ">")) {
        const body = line.substring(1 + tag.length + 1, line.length - tag.length - 3);
        console.log(body);
        plant[tag] = body;
      } else {
        const idr = line.indexOf("idref=");
        if (idr >= 0) {
          const id = line.substring(idr + 7, line.lastIndexOf("\""));
          console.log("idref", id);
          if (tag == "ksj:POS") {
            const p = poss[id];
            Object.assign(plant, p);
          } else {
            plant[tag] = id.substring(2);
          }
        }
      }
    }
  }
  if (line.startsWith("</ksj:FC")) {
    plant = null;
  }
}
console.log(plants, plants.length);
const ps = plants.filter(p => p["schema:latitude"]);
console.log(ps.length);

await Deno.writeTextFile("powerplant_jp_2007.csv", CSV.encode(CSV.fromJSON(ps)));
