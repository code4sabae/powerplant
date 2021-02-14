import { CSV } from "https://code4sabae.github.io/js/CSV.js";

const fn = "P03-13/GML/P03-13-g.xml";
const xml = await Deno.readTextFile(fn);

const ppnames = {
  "ksj:NewEnergyCertificates": "新電力証明書", // ?
  "ksj:GreenEnergyCertification": "グリーン電力証明書", // ?
  "ksj:PondInformation": "池情報", // ?

  "ksj:BiomassPowerStation": "バイオマス",
  "ksj:GeneralHydroelectricPowerPlant": "一般水力",
  "ksj:GeothermalPowerPlant": "地熱",
  "ksj:NuclearPowerPlant": "原子力",
  "ksj:PhotovoltaicPowerPlant": "太陽光",
  "ksj:PowerPlantComplex": "複合型",
  "ksj:PumpedStorageHydroelectricPlant": "揚水式",
  "ksj:ThermalPowerPlant": "火力",
  "ksj:WindPowerPlant": "風力"
};

const lines = xml.split("\n").map(s => s.trim());
const poss = {};
const plants = [];
let pos = null;
let plant = null;
let planttag = null;
const planttags = {};
for (const line of lines) {
  /*
<gml:Point gml:id="p090001">
	<gml:pos>43.10934373 141.28214513</gml:pos>
  */
  if (line.startsWith("<gml:Point gml:id=\"")) {
    const id = line.substring("<gml:Point gml:id=\"".length, line.lastIndexOf("\""));
    //console.log(id, line);
    poss[id] = pos = {};
  }
  if (line.startsWith("<gml:pos>")) {
    const n = line.indexOf(" ");
    const m = line.indexOf("<", "<gml:pos>".length);
    pos["schema:latitude"] = line.substring("<gml:pos>".length, n);
    pos["schema:longitude"] = line.substring(n + 1, m);
    //console.log(lat, lng, line);
  }
  /*
<ksj:BiomassPowerStation gml:id="fc09_0001">
	<ksj:position xlink:href="#p090001"/>
	<ksj:nameOfOwner>札幌市</ksj:nameOfOwner>
	<ksj:nameOfPlant>発寒清掃工場</ksj:nameOfPlant>
	<ksj:address>北海道札幌市西区発寒１５条１４丁目</ksj:address>
	<ksj:underConstruction>1</ksj:underConstruction>
	<ksj:dateOfStartingOperation>
		<gml:TimeInstant gml:id="ti09_00011">
			<gml:timePosition>1992-11-20</gml:timePosition>
		</gml:TimeInstant>
	</ksj:dateOfStartingOperation>
	<ksj:generatingPower>-1.0</ksj:generatingPower>
	<ksj:certification xlink:href="#fi2_1_1"/>
	<ksj:certification xlink:href="#fi3_1_1"/>
	<ksj:type>-2</ksj:type>
</ksj:BiomassPowerStation>
  */
 if (line.startsWith("<ksj:")) {
    const ns = line.indexOf(" ");
    const n = ns < 0 ? line.indexOf(">") : ns;
    const tag = line.substring(1, n);

    if (!plant) {
      if (tag == "ksj:Dataset") {
        continue;
      }
      const id = line.substring(("<" + tag + " gml:id=\"").length, line.lastIndexOf("\""));
      plant = {};
      plants.push(plant);
      plant["schema:identifier"] = id;
      plant["rdf:type"] = tag;
      plant["schema:category"] = ppnames[tag];
      planttag = tag;

      if (!planttags[planttag]) {
        planttags[planttag] = 1;
      } else {
        planttags[planttag]++;
      }
    } else {
      if (line.startsWith("<" + tag + ">") && line.endsWith("</" + tag + ">")) {
        const body = line.substring(1 + tag.length + 1, line.length - tag.length - 3);
        //console.log(body);
        plant[tag] = body;
      } else {
        const idr = line.indexOf("xlink:href=\"#");
        if (idr >= 0) {
          const id = line.substring(idr + "xlink:href=\"#".length, line.lastIndexOf("\""));
          //console.log("xlink:href", id);
          if (tag == "ksj:position") {
            const p = poss[id];
            Object.assign(plant, p);
          } else {
            plant[tag] = id.substring(2);
          }
        }
      }
    }
  }
  if (line.startsWith("</" + planttag + ">")) {
    plant = null;
  }
}
console.log(poss);

//console.log(plants, plants.length);
console.log(plants.length);
const ps = plants.filter(p => p["schema:latitude"]);
console.log(ps.length);
const psnot = plants.filter(p => !p["schema:latitude"]);
//console.log(psnot); // 位置情報なしデータ
console.log(planttags);

await Deno.writeTextFile("powerplant_jp_2013.csv", CSV.encode(CSV.fromJSON(ps)));
