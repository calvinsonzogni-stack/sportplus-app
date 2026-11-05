// ════════════════════════════════════════════════
//  SPORT+ — donnees-avatars.js
//  Catalogue de la boutique : avatars, tenues, raretés et prix.
//  Sans effet de bord : lu par les pages, par le service worker (images à
//  garder hors ligne) et par tools/avatars/generer.js (dessin des SVG).
//
//  Avatars : style « avataaars » de DiceBear (Pablo Stanley), libre pour
//  usage personnel et commercial. Les options d'apparence et de tenue
//  ci-dessous sont celles de ce style.
//
//  Ajouter / modifier un avatar ou une tenue : éditer ce fichier, puis
//  régénérer les images (voir tools/avatars/README.md).
// ════════════════════════════════════════════════

const RARETES = {
  commun:     { label: "Commun",     prixAvatar: 150,  prixTenue: 100 },
  rare:       { label: "Rare",       prixAvatar: 400,  prixTenue: 200 },
  epique:     { label: "Épique",     prixAvatar: 800,  prixTenue: 400 },
  legendaire: { label: "Légendaire", prixAvatar: 1500, prixTenue: 800 },
};

// Chaque avatar inclut sa tenue « base ». Les autres tenues s'achètent
// une fois l'avatar débloqué, au prix de leur rareté.
const AVATARS = [
  {
    id: "recrue", nom: "La Recrue", rarete: "commun", offert: true,
    apparence: { top: ["shortFlat"], hairColor: ["2c1b18"], skinColor: ["edb98a"], eyes: ["default"], eyebrows: ["defaultNatural"], mouth: ["smile"] },
    tenues: [
      { id: "base",   nom: "T-shirt gris",   rarete: "commun",     options: { clothing: ["shirtCrewNeck"], clothesColor: ["929598"] } },
      { id: "rouge",  nom: "Hoodie rouge",   rarete: "rare",       options: { clothing: ["hoodie"], clothesColor: ["e10600"] } },
      { id: "crane",  nom: "Tête de mort",   rarete: "epique",     options: { clothing: ["graphicShirt"], clothesColor: ["1a1a1a"], clothingGraphic: ["skull"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
      { id: "or",     nom: "Blazer doré",    rarete: "legendaire", options: { clothing: ["blazerAndShirt"], clothesColor: ["ffb800"], accessories: ["wayfarers"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "coach", nom: "Le Coach", rarete: "commun",
    apparence: { top: ["theCaesar"], hairColor: ["4a312c"], skinColor: ["d08b5b"], eyes: ["default"], eyebrows: ["defaultNatural"], mouth: ["smile"], facialHair: ["beardLight"], facialHairColor: ["4a312c"], facialHairProbability: 100 },
    tenues: [
      { id: "base",   nom: "Col roulé",      rarete: "commun",     options: { clothing: ["collarAndSweater"], clothesColor: ["3c4f5c"] } },
      { id: "rouge",  nom: "Survêt rouge",   rarete: "rare",       options: { clothing: ["hoodie"], clothesColor: ["c40500"] } },
      { id: "vip",    nom: "Coach VIP",      rarete: "epique",     options: { clothing: ["blazerAndSweater"], clothesColor: ["1a1a1a"], accessories: ["prescription02"], accessoriesProbability: 100 } },
      { id: "or",     nom: "Coach d'or",     rarete: "legendaire", options: { clothing: ["blazerAndShirt"], clothesColor: ["ffb800"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "sprinteuse", nom: "La Sprinteuse", rarete: "commun",
    apparence: { top: ["straight01"], hairColor: ["b58143"], skinColor: ["ffdbb4"], eyes: ["happy"], eyebrows: ["defaultNatural"], mouth: ["smile"] },
    tenues: [
      { id: "base",    nom: "Débardeur",      rarete: "commun",     options: { clothing: ["shirtScoopNeck"], clothesColor: ["5199e4"] } },
      { id: "rouge",   nom: "Maillot rouge",  rarete: "rare",       options: { clothing: ["shirtVNeck"], clothesColor: ["e10600"] } },
      { id: "diamant", nom: "Diamant",        rarete: "epique",     options: { clothing: ["graphicShirt"], clothesColor: ["262626"], clothingGraphic: ["diamond"], accessories: ["round"], accessoriesProbability: 100 } },
      { id: "or",      nom: "Médaille d'or",  rarete: "legendaire", options: { clothing: ["shirtScoopNeck"], clothesColor: ["ffb800"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "colosse", nom: "Le Colosse", rarete: "rare",
    apparence: { top: ["shavedSides"], hairColor: ["2c1b18"], skinColor: ["614335"], eyes: ["default"], eyebrows: ["flatNatural"], mouth: ["serious"], facialHair: ["beardMajestic"], facialHairColor: ["2c1b18"], facialHairProbability: 100 },
    tenues: [
      { id: "base",   nom: "Marcel",         rarete: "rare",       options: { clothing: ["shirtScoopNeck"], clothesColor: ["5a5a5a"] } },
      { id: "rouge",  nom: "Hoodie bordeaux", rarete: "rare",      options: { clothing: ["hoodie"], clothesColor: ["7a0a0a"] } },
      { id: "ours",   nom: "L'Ours",         rarete: "epique",     options: { clothing: ["graphicShirt"], clothesColor: ["1a1a1a"], clothingGraphic: ["bear"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
      { id: "or",     nom: "Titan",          rarete: "legendaire", options: { clothing: ["blazerAndShirt"], clothesColor: ["ffb800"], accessories: ["kurt"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "boxeuse", nom: "La Boxeuse", rarete: "rare",
    apparence: { top: ["bun"], hairColor: ["2c1b18"], skinColor: ["ae5d29"], eyes: ["default"], eyebrows: ["angryNatural"], mouth: ["twinkle"] },
    tenues: [
      { id: "base",   nom: "Sweat gris",     rarete: "rare",       options: { clothing: ["collarAndSweater"], clothesColor: ["929598"] } },
      { id: "rouge",  nom: "Rouge combat",   rarete: "rare",       options: { clothing: ["hoodie"], clothesColor: ["e10600"] } },
      { id: "crane",  nom: "Crâne",          rarete: "epique",     options: { clothing: ["graphicShirt"], clothesColor: ["1a1a1a"], clothingGraphic: ["skullOutline"], accessories: ["wayfarers"], accessoriesProbability: 100 } },
      { id: "or",     nom: "Ceinture d'or",  rarete: "legendaire", options: { clothing: ["blazerAndSweater"], clothesColor: ["ffb800"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "zen", nom: "Le Zen", rarete: "epique",
    apparence: { top: ["dreads01"], hairColor: ["4a312c"], skinColor: ["d08b5b"], eyes: ["happy"], eyebrows: ["defaultNatural"], mouth: ["smile"] },
    tenues: [
      { id: "base",   nom: "Lin blanc",      rarete: "epique",     options: { clothing: ["shirtVNeck"], clothesColor: ["e6e6e6"] } },
      { id: "rouge",  nom: "Rouge zen",      rarete: "rare",       options: { clothing: ["shirtCrewNeck"], clothesColor: ["c40500"] } },
      { id: "nuit",   nom: "Bonnet de nuit", rarete: "epique",     options: { clothing: ["hoodie"], clothesColor: ["1a1a1a"], top: ["winterHat03"], hatColor: ["e10600"] } },
      { id: "or",     nom: "Illuminé",       rarete: "legendaire", options: { clothing: ["blazerAndShirt"], clothesColor: ["ffb800"], accessories: ["round"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "championne", nom: "La Championne", rarete: "epique",
    apparence: { top: ["curly"], hairColor: ["2c1b18"], skinColor: ["614335"], eyes: ["default"], eyebrows: ["raisedExcitedNatural"], mouth: ["smile"] },
    tenues: [
      { id: "base",   nom: "Brassière noire", rarete: "epique",    options: { clothing: ["shirtScoopNeck"], clothesColor: ["262626"] } },
      { id: "rouge",  nom: "Tenue rouge",    rarete: "rare",       options: { clothing: ["hoodie"], clothesColor: ["e10600"] } },
      { id: "resist", nom: "Résistance",     rarete: "epique",     options: { clothing: ["graphicShirt"], clothesColor: ["1a1a1a"], clothingGraphic: ["resist"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
      { id: "or",     nom: "Reine d'or",     rarete: "legendaire", options: { clothing: ["blazerAndShirt"], clothesColor: ["ffb800"], accessories: ["wayfarers"], accessoriesProbability: 100 } },
    ],
  },
  {
    id: "legende", nom: "La Légende", rarete: "legendaire",
    apparence: { top: ["shortWaved"], hairColor: ["e8e1e1"], skinColor: ["ae5d29"], eyes: ["wink"], eyebrows: ["defaultNatural"], mouth: ["smile"], facialHair: ["beardMedium"], facialHairColor: ["e8e1e1"], facialHairProbability: 100 },
    tenues: [
      { id: "base",   nom: "Vétéran",        rarete: "legendaire", options: { clothing: ["collarAndSweater"], clothesColor: ["1a1a1a"] } },
      { id: "rouge",  nom: "Rouge vif",      rarete: "rare",       options: { clothing: ["blazerAndSweater"], clothesColor: ["e10600"] } },
      { id: "ombre",  nom: "L'Ombre",        rarete: "epique",     options: { clothing: ["hoodie"], clothesColor: ["0a0a0a"], accessories: ["sunglasses"], accessoriesProbability: 100 } },
      { id: "or",     nom: "Immortel",       rarete: "legendaire", options: { clothing: ["blazerAndShirt"], clothesColor: ["ffb800"], accessories: ["kurt"], accessoriesProbability: 100 } },
    ],
  },
];

function imageAvatar(persoId, tenueId) {
  return `assets/avatars/${persoId}-${tenueId}.svg`;
}
