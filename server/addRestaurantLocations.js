import sequelize from "./config/db.js";
import { UsersModel } from "./models/model.js";

async function addLocationsToRestaurateurs() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // Define some test locations in Kathmandu
    const locations = [
      {
        id: 1,
        latitude: 27.7172,
        longitude: 85.324,
        location_name: "Kathmandu Center",
      },
      {
        id: 3,
        latitude: 27.72,
        longitude: 85.33,
        location_name: "Thamel Area",
      },
      {
        id: 5,
        latitude: 27.715,
        longitude: 85.32,
        location_name: "Pasan Pur",
      },
    ];

    for (const location of locations) {
      await UsersModel.update(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          location_name: location.location_name,
        },
        { where: { id: location.id } },
      );
      console.log(
        `✓ Updated restaurateur ${location.id} with location: ${location.location_name}`,
      );
    }

    console.log("All restaurateurs updated with locations!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addLocationsToRestaurateurs();
