const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const _ = require("lodash");
const { resolveSrv } = require("dns");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// ========================== Home Page ==========================
app.get("/", (req, res) => {
    res.render("home")
});

// ========================== Pokemon ==========================
app.get("/pokemon", (req, res) => {
    res.render("index", {
        title: "Welcome!"
    });
})

app.post("/pokemon", (req, res) => {
    var query = req.body.pokeName;
    query = query.toLowerCase();
    var speciesQuery = query;
    
    if (query.includes("-")) {
        speciesQuery = query.substring(0, query.indexOf("-"));
    }

    // For meelo!
    if (query === "meelo") {
        res.render("pokemon", {
            name: "Meelo",
            hp: 55,
            atk: 45,
            def: 50,
            spatk: 25,
            spdef: 25,
            spd: 95,
            imgUrl: "meeloWalk.gif",
            dexEntry: "MEELO, also known as the cutest and goodest boi, was adopted on October 12, 2017. He enjoys eating, sleeping, and being held like a baby. Legend says he begins to yell at the first sight of sunlight.",
            types: "Normal, Fire",
            hasForms: false,
            formsList: []
        });
        return;
    }

    const url = `https://pokeapi.co/api/v2/pokemon/${query}/`;
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${speciesQuery}`;

    https.get(url, (res2) => {
        // Catch invalid entry
        if (res2.statusCode === 404) {
            res.render("index", {
                title: "ERROR: Invalid Search. Please try again:"
            });
        }

        else {
            let result = "";
            res2.on("data", (data) => {
                result += data;
            });
            res2.on("end", () => {
                const pokeData = JSON.parse(result);
                // Catch edge case of ? or other cases with an actual result
                if (!pokeData.forms) {
                    res.render("index", {
                        title: "ERROR: Invalid Search. Please try again:"
                    });
                    return;
                }

                // Go through Speecies API next
                https.get(speciesUrl, (res3) => {
                    let result2 = "";
                    res3.on("data", (data2) => {
                        result2 += data2;
                    });
                    res3.on("end", () => {
                        const speciesData = JSON.parse(result2);

                        // Just return the first English entry
                        const findEntry = speciesData.flavor_text_entries.find((entry) => entry.language.name == "en");
                        const dexEntry = findEntry.flavor_text;

                        // Check for forms
                        let hasForms = false;
                        let formsList = [];
                        if (speciesData.varieties.length > 1) {
                            hasForms = true;
                            formsList = speciesData.varieties;
                        }

                        // Data from the pokeData pull
                        // Text
                        const realName = _.capitalize(pokeData.forms[0].name);
                        const types = pokeData.types.map(obj => " " + _.capitalize(obj.type.name) + " ");

                        // Stats
                        const hp = pokeData.stats[0].base_stat;
                        const atk = pokeData.stats[1].base_stat;
                        const def = pokeData.stats[2].base_stat;
                        const spatk = pokeData.stats[3].base_stat;
                        const spdef = pokeData.stats[4].base_stat;
                        const spd = pokeData.stats[5].base_stat;

                        // Sprite
                        const imgUrl = pokeData.sprites.front_default;

                        res.render("pokemon", {
                            name: realName,
                            hp: hp,
                            atk: atk,
                            def: def,
                            spatk: spatk,
                            spdef: spdef,
                            spd: spd,
                            imgUrl: imgUrl,
                            dexEntry: dexEntry,
                            types: types,
                            hasForms: hasForms,
                            formsList: formsList
                        });
                    })
                });
            })
        } 
    })
})

// ========================== Runescape ==========================
app.get("/runescape-scores", (req, res) => {

    res.render("runescores", {
        title: "Enter Runescape Username here:"
    });
})

app.post("/runescape-scores", (req, res) => {

    const rsQuery = req.body.rsName;
    const rsUrl = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${rsQuery}`;

    https.get(rsUrl, (res2) => {

        // Check for invalid searches
        if (res2.statusCode === 404) {
            res.render("runescores", {
                title: "ERROR: Invalid Search. Please try again:"
            })
        }

        // Grab data, note this is a text file instead
        else {
            let statData = "";
            res2.on("data", (data) => {
                statData += data;
            })
            res2.on('end', () => {
                statData = statData.replace(/\n/g, ",")
                statData = statData.split(",");

                res.render("runeplayer", {
                    name: _.capitalize(rsQuery),
                    totalRank: statData[0],
                    totalLvl: statData[1],
                    atkRank: statData[3],
                    atkLvl: statData[4],
                    defRank: statData[6],
                    defLvl: statData[7],
                    strRank: statData[9],
                    strLvl: statData[10],
                    hpRank: statData[12],
                    hpLvl: statData[13],
                    rangeRank: statData[15],
                    rangeLvl: statData[16],
                    prayRank: statData[18],
                    prayLvl: statData[19],
                    mageRank: statData[21],
                    mageLvl: statData[22],
                    cookRank: statData[24],
                    cookLvl: statData[25],
                    wcRank: statData[27],
                    wcLvl: statData[28],
                    fletchRank: statData[30],
                    fletchLvl: statData[31],
                    fishRank: statData[33],
                    fishLvl: statData[34],
                    fireRank: statData[36],
                    fireLvl: statData[37],
                    craftRank: statData[39],
                    craftLvl: statData[40],
                    smithRank: statData[42],
                    smithLvl: statData[43],
                    mineRank: statData[45],
                    mineLvl: statData[46],
                    herbRank: statData[48],
                    herbLvl: statData[49],
                    agilRank: statData[51],
                    agilLvl: statData[52],
                    thieveRank: statData[54],
                    thieveLvl: statData[55],
                    slayRank: statData[57],
                    slayLvl: statData[58],
                    farmRank: statData[60],
                    farmLvl: statData[61],
                    rcRank: statData[63],
                    rcLvl: statData[64],
                    huntRank: statData[66],
                    huntLvl: statData[67],
                    conRank: statData[69],
                    conLvl: statData[70],
                })

            })
        }

    });
})

app.get("/runescape-money", (req, res) => {

    const root = "https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=";

    let mortMyreFungusPrice = 0;
    let goblinWirePrice = 0;
    let mahogLogPrice = 0;
    let mahogPlankPrice = 0;
    let natureRunePrice = 0;
    let astralRunePrice = 0;
    let clayPrice = 0;
    let softClayPrice = 0;

    const mortMyreFungusPromise = new Promise((resolve, reject) => {
        https.get(root+"2970", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                mortMyreFungusPrice = itemData.item.current.price;
                resolve(mortMyreFungusPrice)
            });
        })
    })

    const goblinWirePromise = new Promise((resolve, reject) => {
        https.get(root+"10981", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                goblinWirePrice = itemData.item.current.price;
                resolve(goblinWirePrice)
            });
        })
    })

    const mahogLogPromise = new Promise((resolve, reject) => {
        https.get(root+"6332", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                mahogLogPrice = itemData.item.current.price;
                resolve(mahogLogPrice)
            });
        })
    })

    const mahogPlankPromise = new Promise((resolve, reject) => {
        https.get(root+"8782", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                mahogPlankPrice = itemData.item.current.price;
                resolve(mahogPlankPrice)
            });
        })
    })

    const natureRunePromise = new Promise((resolve, reject) => {
        https.get(root+"561", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                natureRunePrice = itemData.item.current.price;
                resolve(natureRunePrice)
            });
        })
    })

    const astralRunePromise = new Promise((resolve, reject) => {
        https.get(root+"9075", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                astralRunePrice = itemData.item.current.price;
                resolve(astralRunePrice)
            });
        })
    })

    const clayPromise = new Promise((resolve, reject) => {
        https.get(root+"434", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                clayPrice = itemData.item.current.price;
                resolve(clayPrice)
            });
        })
    })

    const softClayPromise = new Promise((resolve, reject) => {
        https.get(root+"1761", (res2) => {
            let itemData = "";
            res2.on("data", (data) => {
                itemData += data;
            })
            res2.on('end', () => {
                itemData = JSON.parse(itemData);
                softClayPrice = itemData.item.current.price;
                resolve(softClayPrice)
            });
        })
    })

    Promise.all([
        mortMyreFungusPromise, 
        goblinWirePromise,
        mahogLogPromise,
        mahogPlankPromise,
        natureRunePromise,
        astralRunePromise,
        clayPromise,
        softClayPromise
    ]).then(() => {

        res.render("runehome", {
            mortMyreFungus: mortMyreFungusPrice,
            goblinWire: goblinWirePrice,
            mahogLog: mahogLogPrice,
            mahogPlank: mahogPlankPrice,
            natureRune: natureRunePrice,
            astralRune: astralRunePrice,
            clay: clayPrice,
            softClay: softClayPrice
        });
    })

})

app.listen(3000);