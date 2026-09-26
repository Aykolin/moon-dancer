const fragments = Object.freeze([
  "41796b6f6c696e",
  "4b6175616e792053616e746f73",
  "68747470733a2f2f6769746875622e636f6d2f41796b6f6c696e",
]);

function unfold(value: string): string {
  return value.match(/.{2}/g)?.map((pair) => String.fromCharCode(Number.parseInt(pair, 16))).join("") ?? "";
}

export const creatorMark = Object.freeze({
  handle: unfold(fragments[0]),
  creator: unfold(fragments[1]),
  profile: unfold(fragments[2]),
  proof: "MD-41:79:6B:6F:6C:69:6E",
  token: fragments[0],
});
