const fs = require("fs");
const argv = require("yargs").argv;
const yaml = require("js-yaml");

// const base = argv._[1];
// const ours = argv._[2];
// const theirs = argv._[3];
// A O B P
// CURRENT -  AJDAD   -  OTHER  -FILENAME
const base = argv._[1];
const ours = argv._[2];
const theirs = argv._[0];
fs.writeFileSync("000000-100-args.json", JSON.stringify(argv));
const filename = argv._[3];
const baseContent = fs.readFileSync(base);
const oursContent = fs.readFileSync(ours);
const theirsContent = fs.readFileSync(theirs);

fs.writeFileSync("000-baseContent.txt", baseContent);
fs.writeFileSync("001-oursContent.txt", oursContent);
fs.writeFileSync("002-theirsContent.txt", theirsContent);

let ours_indexmd = yamlToJson(oursContent);
let theirs_indexmd = yamlToJson(theirsContent);
var outputYaml = "";
var outputJson = { ...ours_indexmd };

modifyFields();
modifyParts();
jsonToYaml(outputJson);
writeContent(outputYaml);
log(" *FINISH * ");
process.exit(0);

function writeContent(c) {
  log(c);

  fs.writeFileSync(theirs, c);
}
function modifyFields() {
  if (theirs_indexmd.title) {
    if (ours_indexmd.title) {
      if (!ours_indexmd.title.en && theirs_indexmd.title.en) {
        outputJson.title.en = theirs_indexmd.title.en;
      }
      if (!ours_indexmd.title.fa && theirs_indexmd.title.fa) {
        outputJson.title.fa = theirs_indexmd.title.fa;
      }
    } else {
      outputJson.title = theirs_indexmd.title;
    }
  }
  if (theirs_indexmd.description) {
    if (ours_indexmd.description) {
      if (!ours_indexmd.description.en && theirs_indexmd.description.en) {
        outputJson.description.en = theirs_indexmd.description.en;
      }
      if (!ours_indexmd.description.fa && theirs_indexmd.description.fa) {
        outputJson.description.fa = theirs_indexmd.description.fa;
      }
    } else {
      outputJson.description = theirs_indexmd.description;
    }
  }
  if (theirs_indexmd.layout) {
    if (!ours_indexmd.layout) {
      outputJson.layout = theirs_indexmd.layout;
    }
  }
  if (theirs_indexmd.type) {
    if (!ours_indexmd.type) {
      outputJson.type = theirs_indexmd.type;
    }
  }
  if (theirs_indexmd["child-type"]) {
    if (!ours_indexmd["child-type"]) {
      outputJson["child-type"] = theirs_indexmd["child-type"];
    }
  }
  if (theirs_indexmd.categories) {
    if (!ours_indexmd.categories) {
      outputJson.categories = theirs_indexmd.categories;
    }
  }
}
function modifyParts() {
  if (!ours_indexmd.children || !theirs_indexmd.children) return;
  let our_children = [...ours_indexmd.children];
  let their_children = [...theirs_indexmd.children];

  their_children.forEach((c, i) => {
    if (!our_children.includes(c)) {
      if (their_children[i - 1]) {
        let index = our_children.indexOf(their_children[i - 1]);
        our_children.splice(index + 1, 0, c);
      } else {
        our_children.splice(0, 0, c);
      }
    }
  });

  outputJson.children = [...our_children];
}
function yamlToJson(c) {
  let content = c + "";
  content = content.replace("---", "");
  content = content.replace("---", "");
  try {
    return yaml.safeLoad(content);
  } catch (error) {
    log("yamlToJson -- " + error);
  }
}
function jsonToYaml(data) {
  try {
    let output = yaml.safeDump(data, {
      noArrayIndent: true,
      indent: 0,
      lineWidth: -1,
      styles: {
        "!!null": "",
      },
    });
    outputYaml = "---\n" + output + "\n---";
    return outputYaml;
  } catch (error) {
    log("jsonToYaml -- " + error);
  }
}
function log(d) {
  fs.appendFileSync("000-LOGSd.txt", "\n - " + d + new Date().toTimeString());
}
