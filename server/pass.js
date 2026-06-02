import bcrypt from "bcrypt";

const passwordToHash = "superadmin"; // Replace this with your desired password
const saltRounds = 10;

const generateHash = async () => {
  const hash = await bcrypt.hash(passwordToHash, saltRounds);
  console.log("Your Hashed Password:");
  console.log(hash);
};

generateHash();
