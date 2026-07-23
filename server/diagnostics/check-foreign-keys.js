import sequelize from "../config/db.js";
import { RestaurateurService } from "../models/RestaurateurServices.js";
import AppointmentModel from "../models/appointmentModel.js";
import { UsersModel } from "../models/model.js";

/**
 * Diagnostic script to check Foreign Key Constraint violations
 * Run: node server/diagnostics/check-foreign-keys.js
 */

async function checkForeignKeyConstraints() {
  console.log("\n📊 FOREIGN KEY CONSTRAINT DIAGNOSTIC\n");
  console.log("=".repeat(60));

  try {
    // 1. Check RestaurateurService
    console.log("\n1️⃣  RESTAURATEUR SERVICES");
    console.log("-".repeat(60));

    const serviceCount = await RestaurateurService.count();
    console.log(`   Total Services: ${serviceCount}`);

    if (serviceCount === 0) {
      console.log("   ⚠️  WARNING: No services found!");
      console.log("   📝 Create services before booking appointments\n");
    } else {
      const services = await RestaurateurService.findAll({
        attributes: ["id", "name", "price", "duration"],
        raw: true,
        order: [["id", "ASC"]],
      });
      console.log("\n   📋 Service List:");
      services.forEach((s) => {
        console.log(
          `      ID: ${s.id.toString().padEnd(4)} | ${s.name.padEnd(20)} | $${s.price.toString().padEnd(4)} | ${s.duration}min`,
        );
      });
    }

    // 2. Check Appointments
    console.log("\n2️⃣  APPOINTMENTS");
    console.log("-".repeat(60));

    const appointmentCount = await AppointmentModel.count();
    console.log(`   Total Appointments: ${appointmentCount}`);

    if (appointmentCount > 0) {
      const appointments = await AppointmentModel.findAll({
        attributes: ["id", "serviceId", "clientId", "restaurateurId", "status"],
        raw: true,
        order: [["id", "ASC"]],
      });

      console.log("\n   📋 Appointment List:");
      appointments.forEach((a) => {
        console.log(
          `      ID: ${a.id} | Service: ${a.serviceId} | Client: ${a.clientId} | Restaurateur: ${a.restaurateurId} | Status: ${a.status}`,
        );
      });
    }

    // 3. Check for Orphaned Service IDs
    console.log("\n3️⃣  ORPHANED REFERENCES (Critical)");
    console.log("-".repeat(60));

    const orphanedServices = await sequelize.query(
      `SELECT DISTINCT "serviceId" FROM "AppointmentModels" 
       WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")`,
    );

    if (orphanedServices[0].length > 0) {
      console.log("   🚨 FOUND ORPHANED SERVICE IDs:");
      orphanedServices[0].forEach((row) => {
        console.log(`      Service ID: ${row.serviceId} (DOES NOT EXIST)`);
      });
      console.log("\n   ⚠️  THESE WILL CAUSE FK CONSTRAINT VIOLATIONS");
      console.log("   💡 Solution:");
      console.log("      A) Delete appointments with these service IDs");
      console.log("      B) Create the missing services");
    } else {
      console.log("   ✅ No orphaned service IDs found");
    }

    // 4. Check for Orphaned Restaurateur IDs
    console.log("\n4️⃣  ORPHANED RESTAURATEUR REFERENCES");
    console.log("-".repeat(60));

    const orphanedRestaurateurs = await sequelize.query(
      `SELECT DISTINCT "restaurateurId" FROM "AppointmentModels" 
       WHERE "restaurateurId" IS NOT NULL 
       AND "restaurateurId" NOT IN (SELECT id FROM "UsersModels" WHERE role='restaurateurs')`,
    );

    if (orphanedRestaurateurs[0].length > 0) {
      console.log("   🚨 FOUND ORPHANED RESTAURATEUR IDs:");
      orphanedRestaurateurs[0].forEach((row) => {
        console.log(
          `      Restaurateur ID: ${row.restaurateurId} (DOES NOT EXIST)`,
        );
      });
    } else {
      console.log("   ✅ No orphaned restaurateur IDs found");
    }

    // 5. Check Users (Restaurateurs)
    console.log("\n5️⃣  RESTAURATEUR USERS");
    console.log("-".repeat(60));

    const restaurateurs = await UsersModel.findAll({
      where: { role: "restaurateurs" },
      attributes: ["id", "first_name", "last_name", "seat_capacity"],
      raw: true,
      order: [["id", "ASC"]],
    });

    console.log(`   Total Restaurateurs: ${restaurateurs.length}`);
    if (restaurateurs.length > 0) {
      console.log("\n   📋 Restaurateur List:");
      restaurateurs.forEach((r) => {
        console.log(
          `      ID: ${r.id.toString().padEnd(4)} | ${r.first_name} ${r.last_name} | Capacity: ${r.seat_capacity || 10}`,
        );
      });
    }

    // 6. Summary
    console.log("\n6️⃣  SUMMARY");
    console.log("-".repeat(60));

    const issues = [];

    if (serviceCount === 0) {
      issues.push("No services found - appointments cannot be created");
    }

    if (orphanedServices[0].length > 0) {
      issues.push(
        `${orphanedServices[0].length} orphaned service references found`,
      );
    }

    if (orphanedRestaurateurs[0].length > 0) {
      issues.push(
        `${orphanedRestaurateurs[0].length} orphaned restaurateur references found`,
      );
    }

    if (issues.length === 0) {
      console.log("   ✅ NO ISSUES FOUND - System looks healthy!");
      console.log("\n   You can safely create appointments.");
    } else {
      console.log(`   ❌ Found ${issues.length} issue(s):\n`);
      issues.forEach((issue, i) => {
        console.log(`      ${i + 1}. ${issue}`);
      });
      console.log("\n   See FOREIGN_KEY_FIX.md for solutions");
    }

    console.log("\n" + "=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Error during diagnostic:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run diagnostic
checkForeignKeyConstraints();
