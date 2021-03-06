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

// ========================== Mario Kart ==========================

const mkCourses = [
    "https://mario.wiki.gallery/images/0/09/MK8_Mario_Kart_Stadium_Course_Icon.png",
    "https://mario.wiki.gallery/images/4/40/MK8_Water_Park_Course_Icon.png",
    "https://mario.wiki.gallery/images/a/ad/MK8_Sweet_Sweet_Canyon_Course_Icon.png",
    "https://mario.wiki.gallery/images/e/e8/MK8_Thwomp_Ruins_Course_Icon.png",
    "https://mario.wiki.gallery/images/2/28/MK8_Mario_Circuit_Course_Icon.png",
    "https://mario.wiki.gallery/images/2/2a/MK8_Toad_Harbor_Course_Icon.png",
    "https://mario.wiki.gallery/images/6/68/MK8_Twisted_Mansion_Course_Icon.png",
    "https://mario.wiki.gallery/images/2/2a/MK8_Shy_Guy_Falls_Course_Icon.png",
    "https://mario.wiki.gallery/images/9/99/MK8_Sunshine_Airport_Course_Icon.png",
    "https://mario.wiki.gallery/images/f/fc/MK8_Dolphin_Shoals_Course_Icon.png",
    "https://mario.wiki.gallery/images/1/14/MK8_Electrodrome_Course_Icon.png",
    "https://mario.wiki.gallery/images/3/38/MK8_Mount_Wario_Course_Icon.png",
    "https://mario.wiki.gallery/images/8/81/MK8_Cloudtop_Cruise_Course_Icon.png",
    "https://mario.wiki.gallery/images/d/d3/MK8_Bone-Dry_Dunes_Course_Icon.png",
    "https://mario.wiki.gallery/images/2/2b/MK8_Bowser%27s_Castle_Course_Icon.png",
    "https://mario.wiki.gallery/images/7/77/MK8_Rainbow_Road_Course_Icon.png",
    "https://mario.wiki.gallery/images/9/97/MK8_Wii_Moo_Moo_Meadows_Course_Icon.png",
    "https://mario.wiki.gallery/images/f/f7/MK8_GBA_Mario_Circuit_Course_Icon.png",
    "https://mario.wiki.gallery/images/9/9e/MK8_DS_Cheep_Cheep_Beach_Course_Icon.png",
    "https://mario.wiki.gallery/images/5/55/MK8_N64_Toad%27s_Turnpike_Course_Icon.png",
    "https://mario.wiki.gallery/images/6/64/MK8_GCN_Dry_Dry_Desert_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/b1/MK8_SNES_Donut_Plains_3_Course_Icon.png",
    "https://mario.wiki.gallery/images/8/8a/MK8_N64_Royal_Raceway_Course_Icon.png",
    "https://mario.wiki.gallery/images/3/35/MK8_3DS_DK_Jungle_Course_Icon.png",
    "https://mario.wiki.gallery/images/1/1a/MK8_DS_Wario_Stadium_Course_Icon.png",
    "https://mario.wiki.gallery/images/3/3f/MK8_GCN_Sherbet_Land_Course_Icon.png",
    "https://mario.wiki.gallery/images/9/94/MK8_3DS_Music_Park_Course_Icon.png",
    "https://mario.wiki.gallery/images/a/a4/MK8_N64_Yoshi_Valley_Course_Icon.png",
    "https://mario.wiki.gallery/images/0/0b/MK8_DS_Tick-Tock_Clock_Course_Icon.png",
    "https://mario.wiki.gallery/images/d/d1/MK8_3DS_Piranha_Plant_Slide_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/b2/MK8_Wii_Grumble_Volcano_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/b9/MK8_N64_Rainbow_Road_Course_Icon.png",
    "https://mario.wiki.gallery/images/7/7c/MK8_DLC_GCN_Yoshi_Circuit_Course_Icon.png",
    "https://mario.wiki.gallery/images/f/fd/MK8_DLC_Excitebike_Arena_Course_Icon.png",
    "https://mario.wiki.gallery/images/2/21/MK8_DLC_Dragon_Driftway_Course_Icon.png",
    "https://mario.wiki.gallery/images/a/a3/MK8_DLC_Mute_City_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/b4/MK8_DLC_Wii_Wario%27s_Gold_Mine_Course_Icon.png",
    "https://mario.wiki.gallery/images/4/4b/MK8_DLC_SNES_Rainbow_Road_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/b0/MK8_DLC_Ice_Ice_Outpost_Course_Icon.png",
    "https://mario.wiki.gallery/images/2/2e/MK8_DLC_Hyrule_Circuit_Course_Icon.png",
    "https://mario.wiki.gallery/images/c/c2/MK8_DLC_GCN_Baby_Park_Course_Icon.png",
    "https://mario.wiki.gallery/images/5/5c/MK8_DLC_Cheese_Land_Course_Icon.png",
    "https://mario.wiki.gallery/images/7/78/MK8_DLC_Wild_Woods_Course_Icon.png",
    "https://mario.wiki.gallery/images/8/84/MK8_DLC_Animal_Crossing_Course_Icon.png",
    "https://mario.wiki.gallery/images/8/89/MK8_DLC_3DS_Neo_Bowser_City_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/ba/MK8_DLC_GBA_Ribbon_Road_Course_Icon.png",
    "https://mario.wiki.gallery/images/8/8d/MK8_DLC_Super_Bell_Subway_Course_Icon.png",
    "https://mario.wiki.gallery/images/a/ab/MK8_DLC_Big_Blue_Course_Icon.png",
    "https://mario.wiki.gallery/images/b/bb/MK8D_Tour_Paris_Promenade_Course_Icon.png",
    "https://mario.wiki.gallery/images/3/3b/MK8D_3DS_Toad_Circuit_Course_Icon.png",
    "https://mario.wiki.gallery/images/7/74/MK8D_N64_Choco_Mountain_Course_Icon.png",
    "https://mario.wiki.gallery/images/9/98/MK8D_Wii_Coconut_Mall_Course_Icon.png",
    "https://mario.wiki.gallery/images/8/81/MK8D_Tour_Tokyo_Blur_Course_Icon.png",
    "https://mario.wiki.gallery/images/7/7e/MK8D_DS_Shroom_Ridge_Course_Icon.png",
    "https://mario.wiki.gallery/images/0/09/MK8D_GBA_Sky_Garden_Course_Icon.png",
    "https://mario.wiki.gallery/images/0/09/MK8D_Tour_Ninja_Hideaway_Course_Icon.png",
];

// TODO: Make the DLC Courses toggleable
app.get("/mario-kart", (req, res) => {
    const num = Math.floor(Math.random()*(mkCourses.length));
    res.render("mariokart", {
        imgUrl: mkCourses[num]
    });
})

app.post("/mario-kart", (req, res) => {
    const num = Math.floor(Math.random()*(mkCourses.length));
    res.render("mariokart", {
        imgUrl: mkCourses[num]
    });
})

// ========================== Valorant ==========================

const maps = [
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/ascent.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/ascentA.png"
    },
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/bind.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/bindA.png"
    },
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/breeze.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/breezeA.png"
    },
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/fracture.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/fractureA.png"
    },
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/haven.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/havenA.png"
    },
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/ucebox.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/iceboxA.png"
    },
    {
        title: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/split.png",
        map: "https://raw.githubusercontent.com/rlemon17/gamehub/main/public/photos/splitA.png"
    }
]

app.get("/val-maps", (req, res) => {
    res.render("valmaps", {
        choice: maps[0]
    });
})

app.get("/val-maps/:index", (req, res) => {
    const index = req.params.index;

    res.render("valmaps", {
        choice: maps[index]
    });

})

const valUrl = "https://raw.githubusercontent.com/rlemon17/valcallouts/main/image";
const quizzes = [
    // Array of all maps
    {
        map: "Ascent",
        callouts: [
            // Array of all callouts for this map
            {
                name: "B Lobby",
                pics: [
                    // Array of images for each callout
                    valUrl+"69.png",
                    valUrl+"198.png",
                    valUrl+"290.png"
                ]
            },
            {
                name: "B Main",
                pics: [
                    valUrl+"168.png",
                    valUrl+"165.png"
                ]
            },
            {
                name: "Mid Market",
                pics: [
                    valUrl+"299.png",
                    valUrl+"61.png"
                ]
            },
            {
                name: "Mid Pizza",
                pics: [
                    valUrl+"192.png",
                    valUrl+"260.png"
                ]
            },
            {
                name: "Mid Bottom",
                pics: [
                    valUrl+"45.png",
                    valUrl+"140.png"
                ]
            },
            {
                name: "Mid Courtyard",
                pics: [
                    valUrl+"67.png",
                    valUrl+"255.png",
                    valUrl+"12.png"
                ]
            },
            {
                name: "Mid Link/Tiles",
                pics: [
                    valUrl+"158.png",
                    valUrl+"203.png"
                ]
            },
            {
                name: "Mid Catwalk/Cat",
                pics: [
                    valUrl+"246.png",
                    valUrl+"51.png"
                ]
            },
            {
                name: "Mid Top",
                pics: [
                    valUrl+"114.png",
                    valUrl+"132.png"
                ]
            },
            {
                name: "A Lobby/Gelato",
                pics: [
                    valUrl+"122.png",
                    valUrl+"8.png"
                ]
            },
            {
                name: "A Main",
                pics: [
                    valUrl+"15.png",
                    valUrl+"41.png"
                ]
            },
            {
                name: "A Wine",
                pics: [
                    valUrl+"308.png"
                ]
            },
            {
                name: "Mid Cubby",
                pics: [
                    valUrl+"295.png",
                    valUrl+"171.png"
                ]
            },
            {
                name: "A Link/Tree",
                pics: [
                    valUrl+"245.png",
                    valUrl+"275.png",
                    valUrl+"173.png"
                ]
            },
            {
                name: "A Garden",
                pics: [
                    valUrl+"301.png",
                    valUrl+"272.png"
                ]
            },
            {
                name: "A Window/Glass",
                pics: [
                    valUrl+"159.png",
                    valUrl+"156.png"
                ]
            },
            {
                name: "A Rafters",
                pics: [
                    valUrl+"211.png",
                    valUrl+"185.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"163.png",
                    valUrl+"137.png"
                ]
            },
            {
                name: "B Site",
                pics: [
                    valUrl+"239.png",
                    valUrl+"194.png"
                ]
            }
        ]
    },
    {
        map: "Bind",
        callouts: [
            {
                name: "Cave",
                pics: [
                    valUrl+"9.png",
                    valUrl+"94.png"
                ]
            },
            {
                name: "B Link/Market",
                pics: [
                    valUrl+"11.png",
                    valUrl+"90.png"
                ]
            },
            {
                name: "A Link/Market",
                pics: [
                    valUrl+"144.png",
                    valUrl+"102.png"
                ]
            },
            {
                name: "B Fountain/Lobby",
                pics: [
                    valUrl+"125.png",
                    valUrl+"131.png"
                ]
            },
            {
                name: "B Long/Portal",
                pics: [
                    valUrl+"24.png",
                    valUrl+"100.png"
                ]
            },
            {
                name: "Garden",
                pics: [
                    valUrl+"215.png",
                    valUrl+"127.png"
                ]
            },
            {
                name: "B Site",
                pics: [
                    valUrl+"59.png",
                    valUrl+"234.png"
                ]
            },
            {
                name: "Window/Hookah",
                pics: [
                    valUrl+"199.png",
                    valUrl+"126.png"
                ]
            },
            {
                name: "B Short",
                pics: [
                    valUrl+"13.png",
                    valUrl+"38.png",
                    valUrl+"18.png"
                ]
            },
            {
                name: "A Short",
                pics: [
                    valUrl+"218.png",
                    valUrl+"153.png"
                ]
            },
            {
                name: "A Short Cubby",
                pics: [
                    valUrl+"115.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"116.png",
                    valUrl+"204.png"
                ]
            },
            {
                name: "Lamps/U Hall",
                pics: [
                    valUrl+"169.png",
                    valUrl+"91.png"
                ]
            },
            {
                name: "Vent",
                pics: [
                    valUrl+"244.png",
                    valUrl+"43.png"
                ]
            },
            {
                name: "Tower/Heaven",
                pics: [
                    valUrl+"82.png",
                    valUrl+"113.png"
                ]
            },
            {
                name: "B Hall",
                pics: [
                    valUrl+"30.png",
                    valUrl+"230.png"
                ]
            },
            {
                name: "B Elbow",
                pics: [
                    valUrl+"26.png",
                    valUrl+"68.png"
                ]
            },
            {
                name: "Showers/Bath",
                pics: [
                    valUrl+"88.png",
                    valUrl+"237.png"
                ]
            },
            {
                name: "A Lobby",
                pics: [
                    valUrl+"180.png",
                    valUrl+"96.png"
                ]
            }
        ]
    },
    {
        map: "Breeze",
        callouts: [
            {
                name: "Snake",
                pics: [
                    valUrl+"259.png",
                    valUrl+"2.png"
                ]
            },
            {
                name: "B Window",
                pics: [
                    valUrl+"117.png",
                    valUrl+"93.png"
                ]
            },
            {
                name: "B Main",
                pics: [
                    valUrl+"58.png",
                    valUrl+"196.png"
                ]
            },
            {
                name: "Mid Cannon",
                pics: [
                    valUrl+"130.png",
                    valUrl+"75.png"
                ]
            },
            {
                name: "Mid Bottom",
                pics: [
                    valUrl+"109.png",
                    valUrl+"297.png",
                    valUrl+"72.png"
                ]
            },
            {
                name: "B Elbow",
                pics: [
                    valUrl+"188.png",
                    valUrl+"252.png",
                    valUrl+"284.png"
                ]
            },
            {
                name: "Mid Pillar",
                pics: [
                    valUrl+"279.png",
                    valUrl+"288.png"
                ]
            },
            {
                name: "Mid Top",
                pics: [
                    valUrl+"57.png",
                    valUrl+"247.png",
                    valUrl+"111.png"
                ]
            },
            {
                name: "B Tunnel",
                pics: [
                    valUrl+"289.png",
                    valUrl+"258.png"
                ]
            },
            {
                name: "B Site - Back",
                pics: [
                    valUrl+"200.png",
                    valUrl+"233.png"
                ]
            },
            {
                name: "B Site - Wall",
                pics: [
                    valUrl+"27.png",
                    valUrl+"145.png"
                ]
            },
            {
                name: "Arches",
                pics: [
                    valUrl+"206.png",
                    valUrl+"313.png"
                ]
            },
            {
                name: "Mid Nest",
                pics: [
                    valUrl+"261.png",
                    valUrl+"160.png"
                ]
            },
            {
                name: "A Lobby",
                pics: [
                    valUrl+"28.png",
                    valUrl+"118.png",
                    valUrl+"77.png"
                ]
            },
            {
                name: "Cave",
                pics: [
                    valUrl+"64.png",
                    valUrl+"157.png"
                ]
            },
            {
                name: "A Shop/Stairs",
                pics: [
                    valUrl+"311.png",
                    valUrl+"219.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"277.png",
                    valUrl+"5.png"
                ]
            },
            {
                name: "A Bridge",
                pics: [
                    valUrl+"307.png",
                    valUrl+"33.png"
                ]
            },
            {
                name: "A Hall",
                pics: [
                    valUrl+"212.png",
                    valUrl+"14.png",
                    valUrl+"296.png"
                ]
            },
            {
                name: "Stairs/A Switch",
                pics: [
                    valUrl+"97.png",
                    valUrl+"177.png"
                ]
            },
            {
                name: "Mid Wood Doors",
                pics: [
                    valUrl+"190.png",
                    valUrl+"248.png"
                ]
            }
        ]
    },
    {
        map: "Fracture",
        callouts: [
            {
                name: "A Gate",
                pics: [
                    valUrl+"210.png",
                    valUrl+"104.png"
                ]
            },
            {
                name: "A Dish",
                pics: [
                    valUrl+"119.png",
                    valUrl+"280.png"
                ]
            },
            {
                name: "A Drop",
                pics: [
                    valUrl+"243.png",
                    valUrl+"152.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"78.png",
                    valUrl+"133.png",
                    valUrl+"187.png"
                ]
            },
            {
                name: "A Main",
                pics: [
                    valUrl+"4.png",
                    valUrl+"172.png"
                ]
            },
            {
                name: "A Hall",
                pics: [
                    valUrl+"112.png",
                    valUrl+"135.png"
                ]
            },
            {
                name: "A Door",
                pics: [
                    valUrl+"282.png",
                    valUrl+"21.png"
                ]
            },
            {
                name: "A Rope/Lift",
                pics: [
                    valUrl+"149.png",
                    valUrl+"232.png",
                    valUrl+"29.png"
                ]
            },
            {
                name: "A Link, Vents",
                pics: [
                    valUrl+"48.png",
                    valUrl+"267.png"
                ]
            },
            {
                name: "Defender/CT Spawn",
                pics: [
                    valUrl+"305.png",
                    valUrl+"56.png"
                ]
            },
            {
                name: "B Canteen",
                pics: [
                    valUrl+"83.png",
                    valUrl+"141.png"
                ]
            },
            {
                name: "B Link/Pump",
                pics: [
                    valUrl+"235.png",
                    valUrl+"179.png"
                ]
            },
            {
                name: "B Generator",
                pics: [
                    valUrl+"302.png",
                    valUrl+"17.png"
                ]
            },
            {
                name: "B Site",
                pics: [
                    valUrl+"228.png",
                    valUrl+"86.png",
                    valUrl+"182.png"
                ]
            },
            {
                name: "B Tree",
                pics: [
                    valUrl+"225.png",
                    valUrl+"285.png",
                    valUrl+"251.png"
                ]
            },
            {
                name: "B Tunnel",
                pics: [
                    valUrl+"52.png",
                    valUrl+"202.png"
                ]
            },
            {
                name: "B Main",
                pics: [
                    valUrl+"80.png",
                    valUrl+"220.png"
                ]
            },
            {
                name: "B Tower/Heaven",
                pics: [
                    valUrl+"283.png",
                    valUrl+"208.png",
                    valUrl+"31.png"
                ]
            },
            {
                name: "B Arcade",
                pics: [
                    valUrl+"175.png",
                    valUrl+"50.png"
                ]
            },
            {
                name: "B Bench",
                pics: [
                    valUrl+"42.png",
                    valUrl+"256.png"
                ]
            },
            {
                name: "Attacker/T Bridge",
                pics: [
                    valUrl+"183.png",
                    valUrl+"89.png"
                ]
            },
            {
                name: "Attacker/T Spawn",
                pics: [
                    valUrl+"161.png",
                    valUrl+"269.png"
                ]
            }
        ]
    },
    {
        map: "Haven",
        callouts: [
            {
                name: "C Lobby",
                pics: [
                    valUrl+"262.png",
                    valUrl+"263.png"
                ]
            },
            {
                name: "C Long",
                pics: [
                    valUrl+"189.png",
                    valUrl+"1.png"
                ]
            },
            {
                name: "C Cubby",
                pics: [
                    valUrl+"92.png"
                ]
            },
            {
                name: "C Site - Logs",
                pics: [
                    valUrl+"134.png"
                ]
            },
            {
                name: "C Site - Platform",
                pics: [
                    valUrl+"6.png"
                ]
            },
            {
                name: "C Link",
                pics: [
                    valUrl+"231.png",
                    valUrl+"265.png",
                    valUrl+"71.png"
                ]
            },
            {
                name: "C Window",
                pics: [
                    valUrl+"241.png",
                    valUrl+"214.png"
                ]
            },
            {
                name: "Connector/Garage Tunnel",
                pics: [
                    valUrl+"270.png",
                    valUrl+"3.png"
                ]
            },
            {
                name: "Garage",
                pics: [
                    valUrl+"129.png",
                    valUrl+"222.png"
                ]
            },
            {
                name: "Mid Doors",
                pics: [
                    valUrl+"46.png",
                    valUrl+"32.png"
                ]
            },
            {
                name: "Mid Courtyard",
                pics: [
                    valUrl+"36.png",
                    valUrl+"201.png",
                    valUrl+"151.png"
                ]
            },
            {
                name: "Mid Window",
                pics: [
                    valUrl+"298.png",
                    valUrl+"281.png"
                ]
            },
            {
                name: "B Site",
                pics: [
                    valUrl+"184.png",
                    valUrl+"264.png",
                    valUrl+"300.png"
                ]
            },
            {
                name: "(B Site) Backsite",
                pics: [
                    valUrl+"304.png"
                ]
            },
            {
                name: "Garden",
                pics: [
                    valUrl+"44.png",
                    valUrl+"40.png"
                ]
            },
            {
                name: "A Lobby",
                pics: [
                    valUrl+"37.png",
                    valUrl+"205.png"
                ]
            },
            {
                name: "A Short/Sewer",
                pics: [
                    valUrl+"312.png",
                    valUrl+"216.png"
                ]
            },
            {
                name: "A Long",
                pics: [
                    valUrl+"238.png",
                    valUrl+"139.png"
                ]
            },
            {
                name: "A Ramp",
                pics: [
                    valUrl+"150.png",
                    valUrl+"226.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"39.png",
                    valUrl+"87.png"
                ]
            },
            {
                name: "A Site - Hell/Bottom",
                pics: [
                    valUrl+"66.png"
                ]
            },
            {
                name: "A Site - Heaven",
                pics: [
                    valUrl+"278.png",
                    valUrl+"10.png"
                ]
            },
            {
                name: "Heaven Stairs",
                pics: [
                    valUrl+"35.png",
                    valUrl+"110.png"
                ]
            },
            {
                name: "A Tunnel",
                pics: [
                    valUrl+"191.png",
                    valUrl+"34.png"
                ]
            },
            {
                name: "A Site - Towers/Cubby",
                pics: [
                    valUrl+"76.png"
                ]
            },
            {
                name: "A Link",
                pics: [
                    valUrl+"257.png",
                    valUrl+"227.png"
                ]
            }
        ]
    },
    {
        map: "Icebox",
        callouts: [
            {
                name: "B Garage",
                pics: [
                    valUrl+"197.png",
                    valUrl+"99.png"
                ]
            },
            {
                name: "B Green",
                pics: [
                    valUrl+"142.png",
                    valUrl+"23.png"
                ]
            },
            {
                name: "B Yellow",
                pics: [
                    valUrl+"274.png",
                    valUrl+"207.png"
                ]
            },
            {
                name: "B Site",
                pics: [
                    valUrl+"79.png",
                    valUrl+"147.png"
                ]
            },
            {
                name: "B Snowman",
                pics: [
                    valUrl+"249.png",
                    valUrl+"167.png"
                ]
            },
            {
                name: "B Back",
                pics: [
                    valUrl+"268.png",
                    valUrl+"303.png"
                ]
            },
            {
                name: "B Hut",
                pics: [
                    valUrl+"162.png",
                    valUrl+"128.png"
                ]
            },
            {
                name: "Snowpile/B Hall (Outside)",
                pics: [
                    valUrl+"224.png",
                    valUrl+"124.png"
                ]
            },
            {
                name: "Kitchen/B Hall (Inside)",
                pics: [
                    valUrl+"315.png",
                    valUrl+"316.png"
                ]
            },
            {
                name: "B Orange",
                pics: [
                    valUrl+"213.png",
                    valUrl+"276.png"
                ]
            },
            {
                name: "B Kitchen",
                pics: [
                    valUrl+"209.png",
                    valUrl+"236.png",
                    valUrl+"63.png"
                ]
            },
            {
                name: "Tube",
                pics: [
                    valUrl+"181.png",
                    valUrl+"250.png"
                ]
            },
            {
                name: "Mid/Blue",
                pics: [
                    valUrl+"105.png",
                    valUrl+"193.png"
                ]
            },
            {
                name: "Mid Boiler",
                pics: [
                    valUrl+"74.png",
                    valUrl+"240.png"
                ]
            },
            {
                name: "Mid Pallet",
                pics: [
                    valUrl+"19.png",
                    valUrl+"101.png"
                ]
            },
            {
                name: "A Rafters",
                pics: [
                    valUrl+"273.png",
                    valUrl+"121.png",
                    valUrl+"84.png"
                ]
            },
            {
                name: "A Screen",
                pics: [
                    valUrl+"294.png",
                    valUrl+"186.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"146.png",
                    valUrl+"310.png",
                    valUrl+"7.png"
                ]
            },
            {
                name: "A Pipes",
                pics: [
                    valUrl+"170.png",
                    valUrl+"166.png",
                    valUrl+"49.png"
                ]
            },
            {
                name: "A Nest",
                pics: [
                    valUrl+"229.png",
                    valUrl+"148.png"
                ]
            },
            {
                name: "A Belt",
                pics: [
                    valUrl+"103.png",
                    valUrl+"314.png",
                    valUrl+"317.png"
                ]
            }
        ]
    },
    {
        name: "Split",
        callouts: [
            {
                name: "B Lobby",
                pics: [
                    valUrl+"55.png",
                    valUrl+"65.png"
                ]
            },
            {
                name: "B Main/Garage",
                pics: [
                    valUrl+"22.png",
                    valUrl+"138.png"
                ]
            },
            {
                name: "B Site",
                pics: [
                    valUrl+"98.png",
                    valUrl+"174.png",
                    valUrl+"123.png"
                ]
            },
            {
                name: "(B Site) - Backsite",
                pics: [
                    valUrl+"178.png"
                ]
            },
            {
                name: "B Rafters/Catwalk",
                pics: [
                    valUrl+"266.png",
                    valUrl+"292.png"
                ]
            },
            {
                name: "B Heaven/Tower",
                pics: [
                    valUrl+"293.png",
                    valUrl+"155.png"
                ]
            },
            {
                name: "B Stairs",
                pics: [
                    valUrl+"254.png",
                    valUrl+"136.png"
                ]
            },
            {
                name: "B Alley",
                pics: [
                    valUrl+"95.png",
                    valUrl+"20.png",
                    valUrl+"176.png"
                ]
            },
            {
                name: "Mid Mail",
                pics: [
                    valUrl+"107.png",
                    valUrl+"54.png"
                ]
            },
            {
                name: "Top Mid",
                pics: [
                    valUrl+"108.png",
                    valUrl+"143.png"
                ]
            },
            {
                name: "Bottom Mid",
                pics: [
                    valUrl+"47.png",
                    valUrl+"73.png"
                ]
            },
            {
                name: "B Link/Ramen/Market",
                pics: [
                    valUrl+"106.png",
                    valUrl+"195.png"
                ]
            },
            {
                name: "A Sewer",
                pics: [
                    valUrl+"81.png",
                    valUrl+"16.png"
                ]
            },
            {
                name: "A Lobby",
                pics: [
                    valUrl+"60.png",
                    valUrl+"242.png"
                ]
            },
            {
                name: "A Main",
                pics: [
                    valUrl+"286.png",
                    valUrl+"271.png",
                    valUrl+"25.png"
                ]
            },
            {
                name: "A Ramp",
                pics: [
                    valUrl+"217.png",
                    valUrl+"53.png"
                ]
            },
            {
                name: "A Heaven/Tower",
                pics: [
                    valUrl+"253.png",
                    valUrl+"85.png"
                ]
            },
            {
                name: "Mid Vent",
                pics: [
                    valUrl+"306.png",
                    valUrl+"221.png"
                ]
            },
            {
                name: "A Rafters",
                pics: [
                    valUrl+"62.png",
                    valUrl+"291.png"
                ]
            },
            {
                name: "A Site",
                pics: [
                    valUrl+"309.png",
                    valUrl+"164.png"
                ]
            },
            {
                name: "A Elbow",
                pics: [
                    valUrl+"70.png",
                    valUrl+"120.png"
                ]
            },
            {
                name: "A Screens",
                pics: [
                    valUrl+"154.png",
                    valUrl+"223.png"
                ]
            }
        ]
    }
]

app.get("/val-quiz", (req, res) => {
    res.render("valquiz");
})

app.get("/val-quiz/:index", (req, res) => {
    const index = req.params.index;

    res.render("valquiznum", {
        map: quizzes[index].map,
        calloutArray: quizzes[index].callouts
    });
})

app.listen(process.env.PORT);