import pocketbase from "pocketbase";

console.log("PocketBase URL:", process.env.NEXT_PUBLIC_POCKETBASE_URL);
const pb = new pocketbase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export default pb;