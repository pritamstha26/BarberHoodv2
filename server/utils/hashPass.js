import bcrypt from "bcrypt";

    const hashedPassword = await bcrypt.hash("superadmin", 10);
    console.log("Hashed password for superadmin:", hashedPassword);
