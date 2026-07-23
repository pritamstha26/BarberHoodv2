/**
 * Table capacity management utility.
 * Provides helper functions to manage restaurant table reservations and capacity updates.
 *
 * Table capacity directly impacts:
 * - Maximum concurrent appointments
 * - Seat availability validation
 */

export const updateRestaurantCapacity = async (
  UsersModel,
  restaurateurId,
  newCapacity,
) => {
  if (newCapacity < 1) {
    throw new Error("Capacity must be at least 1 table");
  }
  if (newCapacity > 1000) {
    throw new Error("Capacity cannot exceed 1000 tables");
  }

  const restaurateur = await UsersModel.findOne({
    where: { id: restaurateurId, role: "restaurateurs" },
  });

  if (!restaurateur) {
    throw new Error("Restaurateur not found");
  }

  restaurateur.seat_capacity = newCapacity;
  await restaurateur.save();

  return {
    id: restaurateur.id,
    seat_capacity: restaurateur.seat_capacity,
    message: `Capacity updated to ${newCapacity} tables`,
  };
};

export const getRestaurantCapacity = async (UsersModel, restaurateurId) => {
  const restaurateur = await UsersModel.findOne({
    where: { id: restaurateurId, role: "restaurateurs" },
    attributes: ["id", "seat_capacity", "first_name", "last_name"],
  });

  if (!restaurateur) {
    throw new Error("Restaurateur not found");
  }

  return {
    id: restaurateur.id,
    name: `${restaurateur.first_name} ${restaurateur.last_name}`,
    seat_capacity: restaurateur.seat_capacity || 10,
  };
};
