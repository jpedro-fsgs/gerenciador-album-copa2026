import stickers from "./stickers.json" with { type: "json" };
import input from "./inputs/input_jp.json" with { type: "json" };

const allStickers = stickers.stickers
    .filter((s) => s.info.needed_for_completion)
    .map((s) => `${s.label} - ${s.group_uid}`);

const swapStickers = input.stacks.swap
    .sort((a, b) => a - b)
    .map((s) => stickers.stickers.find((a) => a.id === s))
    .map((s) => `${s?.label} - ${s?.group_uid}`);

const myStickers = input.stacks.album
    .sort((a, b) => a[0] - b[0])
    .map((s) => stickers.stickers.find((a) => a.id === s[0]))
    .map((s) => `${s?.label} - ${s?.group_uid}`);

console.log("\nMinhas Figurinhas para troca:\n");
console.log(swapStickers.join("\n"));

console.log("\nFigurinhas que não tenho:\n");
console.log(allStickers.filter((s) => !myStickers.includes(s)).join("\n"));
