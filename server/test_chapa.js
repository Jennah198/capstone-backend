import { Chapa } from "chapa-nodejs";
console.log(Chapa);
const chapa = new Chapa({ secretKey: "test" });
console.log(chapa);
console.log(chapa.initialize);
