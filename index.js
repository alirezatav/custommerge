const fs = require("fs");
const argv = require("yargs").argv;
const yaml = require("js-yaml");
/// A O B P ( CURRENT - BASE - OTHER - FILEPATH )
const base = argv._[1];
const ours = argv._[2];
const theirs = argv._[0];

const baseContent = fs.readFileSync(base);
const oursContent = fs.readFileSync(ours);
const theirsContent = fs.readFileSync(theirs);

let ours_indexmd = yamlToJson(oursContent);
let theirs_indexmd = yamlToJson(theirsContent);
var outputYaml = "";
var outputJson = { ...ours_indexmd };

// Helpers
start()

// Helpers
function writeContent(c) {
  log("Result => " + c);
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
  if (theirs_indexmd.children) {
    let ordered = modifyOrder(ours_indexmd.children, theirs_indexmd.children);
    if (ordered) outputJson.children = ordered;
  }
  if (theirs_indexmd.categories) {
    let ordered = modifyOrder(
      ours_indexmd.categories,
      theirs_indexmd.categories
    );
    if (ordered) outputJson.categories = ordered;
  }
  if (theirs_indexmd.tags) {
    let ordered = modifyOrder(ours_indexmd.tags, theirs_indexmd.tags);
    if (ordered) outputJson.tags = ordered;
  }
}
function modifyOrder(ourList, theirList) {
  if (!Array.isArray(ourList) || !Array.isArray(theirList)) return;
  let our_children = [...ourList];
  let their_children = [...theirList];

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

  return [...new Set(our_children)];
}
function yamlToJson(c) {
  let content = c + "";
  content = content.replace("---", "");
  content = content.replace("---", "");
  try {
    return yaml.load(content);
  } catch (error) {
    log("error : yamlToJson -- " + error);
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
    log("error : jsonToYaml -- " + error);
  }
}
function log(d) {
  fs.appendFileSync(
    "../../merge-logs.txt",
    "\n" + new Date().toTimeString() + " : \n - " + d
  );
}
function start() {
  try {
    modifyFields();
    jsonToYaml(outputJson);
    writeContent(outputYaml);
    process.exit(0);
  } catch (error) {
    log("Merge Error : " + error);
    process.exit(1);
  }
}
