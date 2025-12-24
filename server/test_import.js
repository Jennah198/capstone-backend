import { Chapa } from "chapa-nodejs";
import chapaNodejs from "chapa-nodejs";

console.log("Named import Chapa:", Chapa);
console.log("Default import chapaNodejs:", chapaNodejs);

try {
  const c = new Chapa({ secretKey: "test" });
  console.log("Instance initialized:", c);
  console.log("Instance initialize method:", c.initialize);
} catch (e) {
  console.error("Error with named import:", e);
}

try {
  const { Chapa: ChapaFromDefault } = chapaNodejs;
  const c2 = new ChapaFromDefault({ secretKey: "test" });
  console.log("Instance from default import:", c2);
} catch (e) {
  console.error("Error with default import destructuring:", e);
}
