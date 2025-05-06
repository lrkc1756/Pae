const defaultData = {
  energyTypes: [
      { name: "Fossil", factor: 1000 },
      { name: "Nuclear", factor: 5 },
      { name: "Renewable", factor: 0 }
  ],
  wasteTypes: [
      "slag",
      "metal spatter",
      "electrode stubs",
      "metal dust",
      "toxic fumes",
      "residue",
      "waste coolant",
      "shavings",
      "iron oxide dust",
      "VOCs",
      "microplastics",
      "resin vapors",
      "fiber waste",
      "solvent vapors",
      "cured residue",
      "oil mist",
      "wire scraps",
      "plastic packaging",
      "glass shards",
      "metal fragments",
      "waste oil"
  ],
  projects: {
        "Example Project": {
            "welding": {
                "materials":{
                    "materials": [
                    {
                        "name": "welding rod",
                        "wasteFactor": 0.12,
                        "wasteType": ["slag", "metal spatter"],
                        "unit": "kg/kg"
                    },
                    {
                        "name": "electrodes",
                        "wasteFactor": 0.075,
                        "wasteType": ["electrode stubs", "metal dust"],
                        "unit": "kg/kg"
                    },
                    {
                        "name": "fluxes",
                        "wasteFactor": 0.25,
                        "wasteType": ["toxic fumes", "residue"],
                        "unit": "kg/kg"
                    },
                    {
                        "name": "coolants",
                        "wasteFactor": 0.03,
                        "wasteType": ["waste coolant"],
                        "unit": "kg/kg"
                    }
                ],
                "rawMaterials": [
                    {
                        "name": "aluminium",
                        "wasteFactor": 0.07,
                        "wasteType": ["metal dust", "shavings"],
                        "unit": "kg/kg"
                    },
                    {
                        "name": "steel",
                        "wasteFactor": 0.07,
                        "wasteType": ["iron oxide dust", "slag"],
                        "unit": "kg/kg"
                    }
                ],
                "additionalMaterials": [
                    {
                        "name": "adhesives",
                        "wasteFactor": 0.02,
                        "wasteType": ["VOCs"],
                        "unit": "kg/kg"
                    }
                ]
            },
            "process": {
                "floor assembly": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "side parts": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "rear vehicle": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "front vehicle": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "roof structure": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "door frames": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "final assembly": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
            }
        },
            "drying": {
                "materials":{
                    "rawMaterials": [
                        {
                            "name": "plastics",
                            "wasteFactor": 0.035,
                            "wasteType": ["VOCs", "microplastics"],
                            "unit": "kg/kg"
                        },
                        {
                            "name": "composite materials",
                            "wasteFactor": 0.045,
                            "wasteType": ["resin vapors", "fiber waste"],
                            "unit": "kg/kg"
                        }
                    ],
                    "additionalMaterials": [
                        {
                            "name": "adhesives",
                            "wasteFactor": 0.075,
                            "wasteType": ["solvent vapors"],
                            "unit": "kg/kg"
                        },
                        {
                            "name": "seals",
                            "wasteFactor": 0.03,
                            "wasteType": ["cured residue"],
                            "unit": "kg/kg"
                        },
                        {
                            "name": "lubricants",
                            "wasteFactor": 0.02,
                            "wasteType": ["oil mist"],
                            "unit": "kg/kg"
                        }
                    ]
                },
                "process": {
                    "preheating": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "interim drying": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "prime coat drying": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "topcoat drying": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "clear drying": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "final drying": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
                "cooling": {
                    energyType: "",
                    energy: 0,
                    materials: "",
                    materialsQuantity: 0,
                    rawMaterials: "",
                    rawMaterialsQuantity: 0,
                    additionalMaterials: "",
                    additionalMaterialsQuantity: 0
                },
            }
            },
            "assembly of a car door": {
                "materials":{
                    "rawMaterials": [
                        {
                            "name": "electrical components",
                            "wasteFactor": 0.015,
                            "wasteType": ["wire scraps", "plastic packaging"],
                            "unit": "kg/kg"
                        },
                        {
                            "name": "glass",
                            "wasteFactor": 0.08,
                            "wasteType": ["glass shards"],
                            "unit": "kg/kg"
                        }
                    ],
                    "additionalMaterials": [
                        {
                            "name": "screws",
                            "wasteFactor": 0.015,
                            "wasteType": ["metal fragments"],
                            "unit": "kg/kg"
                        },
                        {
                            "name": "seals",
                            "wasteFactor": 0.03,
                            "wasteType": ["cured residue"],
                            "unit": "kg/kg"
                        },
                        {
                            "name": "lubricants",
                            "wasteFactor": 0.015,
                            "wasteType": ["waste oil"],
                            "unit": "kg/kg"
                        },
                    ],
                },
                "process": {
                    "positioning and fixing": {
                        energyType: "",
                        energy: 0,
                        materials: "",
                        materialsQuantity: 0,
                        rawMaterials: "",
                        rawMaterialsQuantity: 0,
                        additionalMaterials: "",
                        additionalMaterialsQuantity: 0
                    },
                    "welding in assembly": {
                        energyType: "",
                        energy: 0,
                        materials: "",
                        materialsQuantity: 0,
                        rawMaterials: "",
                        rawMaterialsQuantity: 0,
                        additionalMaterials: "",
                        additionalMaterialsQuantity: 0
                    },
                    "bonding": {
                        energyType: "",
                        energy: 0,
                        materials: "",
                        materialsQuantity: 0,
                        rawMaterials: "",
                        rawMaterialsQuantity: 0,
                        additionalMaterials: "",
                        additionalMaterialsQuantity: 0
                    },
                    "mechanical fastening": {
                        energyType: "",
                        energy: 0,
                        materials: "",
                        materialsQuantity: 0,
                        rawMaterials: "",
                        rawMaterialsQuantity: 0,
                        additionalMaterials: "",
                        additionalMaterialsQuantity: 0
                    },
                    "sealing installation": {
                        energyType: "",
                        energy: 0,
                        materials: "",
                        materialsQuantity: 0,
                        rawMaterials: "",
                        rawMaterialsQuantity: 0,
                        additionalMaterials: "",
                        additionalMaterialsQuantity: 0
                    },
                    "installation of electrical components": {
                        energyType: "",
                        energy: 0,
                        materials: "",
                        materialsQuantity: 0,
                        rawMaterials: "",
                        rawMaterialsQuantity: 0,
                        additionalMaterials: "",
                        additionalMaterialsQuantity: 0
                    }
                }
            },  

        }
    }
};

let userData = {
    energyTypes: [...defaultData.energyTypes],
    wasteTypes: [...defaultData.wasteTypes],
    projects: JSON.parse(JSON.stringify(defaultData.projects)) // 对projects深拷贝
  };
  
  const DataManager = {
    load: function() {
      const savedData = localStorage.getItem('lcaUserData');
      if (savedData) {
        userData = JSON.parse(savedData);
      }
      return userData;
    },
  
    save: function() {
      localStorage.setItem('lcaUserData', JSON.stringify(userData));
    },
  
    getDefaultData: function() {
      return JSON.parse(JSON.stringify(defaultData));
    },
  
    getUserData: function() {
      return userData;
    }
  };
  
// Load user data when the script is executed
window.userData = userData;
window.defaultData = defaultData;
window.DataManager = DataManager