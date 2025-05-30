import { UsersModel } from "../models/model";

// GET all clients

app.get("/clients", async (req, res) => {
  try {
    const clients = await UsersModel.findAll({
      where: {
        role: "client",
      },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "role",
      ], // Exclude password for security
    });

    if (!clients || clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No clients found",
      });
    }

    res.status(200).json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching clients",
      error: error.message,
    });
  }
});
