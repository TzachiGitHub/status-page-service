"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// prisma/seed.ts
var import_client = require("@prisma/client");
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_crypto = __toESM(require("crypto"));
var uuid = () => import_crypto.default.randomUUID();
var prisma = new import_client.PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe("TRUNCATE TABLE organizations CASCADE");
  const hashedPassword = await import_bcryptjs.default.hash("admin123", 10);
  const org = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
      members: {
        create: {
          email: "admin@example.com",
          password: hashedPassword,
          name: "Admin User",
          role: "OWNER"
        }
      }
    },
    include: { members: true }
  });
  console.log("Created org:", org.name);
  const coreGroup = await prisma.componentGroup.create({
    data: { name: "Core Services", order: 0, orgId: org.id }
  });
  const extGroup = await prisma.componentGroup.create({
    data: { name: "External Services", order: 1, orgId: org.id }
  });
  const [api, webapp, database, cdn, email] = await Promise.all([
    prisma.component.create({ data: { name: "API", order: 0, orgId: org.id, groupId: coreGroup.id } }),
    prisma.component.create({ data: { name: "Web App", order: 1, orgId: org.id, groupId: coreGroup.id } }),
    prisma.component.create({ data: { name: "Database", order: 2, orgId: org.id, groupId: coreGroup.id } }),
    prisma.component.create({ data: { name: "CDN", order: 0, orgId: org.id, groupId: extGroup.id } }),
    prisma.component.create({ data: { name: "Email", order: 1, orgId: org.id, groupId: extGroup.id } })
  ]);
  console.log("Created 5 components in 2 groups");
  await Promise.all([
    prisma.monitor.create({
      data: { name: "HTTP Check", type: "HTTP", url: "https://httpbin.org/status/200", interval: 60, orgId: org.id, componentId: api.id, expectedStatus: 200 }
    }),
    prisma.monitor.create({
      data: { name: "Slow Endpoint", type: "HTTP", url: "https://httpbin.org/delay/2", interval: 120, timeout: 10, orgId: org.id, componentId: webapp.id }
    }),
    prisma.monitor.create({
      data: { name: "SSL Check", type: "SSL", url: "https://httpbin.org", interval: 3600, orgId: org.id }
    }),
    prisma.monitor.create({
      data: { name: "Heartbeat", type: "HEARTBEAT", interval: 300, orgId: org.id }
    })
  ]);
  console.log("Created 4 monitors");
  const resolvedIncident = await prisma.incident.create({
    data: {
      title: "Database connectivity issues",
      status: "RESOLVED",
      severity: "MAJOR",
      orgId: org.id,
      resolvedAt: /* @__PURE__ */ new Date(),
      updates: {
        create: [
          { status: "INVESTIGATING", message: "We are investigating database connectivity issues.", createdAt: new Date(Date.now() - 36e5) },
          { status: "IDENTIFIED", message: "Root cause identified: connection pool exhaustion.", createdAt: new Date(Date.now() - 18e5) },
          { status: "RESOLVED", message: "Connection pool settings adjusted. All systems operational.", createdAt: /* @__PURE__ */ new Date() }
        ]
      },
      components: {
        create: [{ componentId: database.id, status: "MAJOR_OUTAGE" }]
      }
    }
  });
  const activeIncident = await prisma.incident.create({
    data: {
      title: "Elevated API response times",
      status: "MONITORING",
      severity: "MINOR",
      orgId: org.id,
      updates: {
        create: [
          { status: "INVESTIGATING", message: "We are seeing elevated response times on the API.", createdAt: new Date(Date.now() - 6e5) },
          { status: "MONITORING", message: "A fix has been deployed. Monitoring the situation.", createdAt: /* @__PURE__ */ new Date() }
        ]
      },
      components: {
        create: [{ componentId: api.id, status: "DEGRADED_PERFORMANCE" }]
      }
    }
  });
  console.log("Created 2 incidents");
  await prisma.statusPageConfig.create({
    data: {
      orgId: org.id,
      title: "Acme Corp Status",
      description: "Real-time status and uptime for Acme Corp services."
    }
  });
  await prisma.apiKey.create({
    data: {
      name: "Default API Key",
      key: `sp_${uuid().replace(/-/g, "")}`,
      orgId: org.id
    }
  });
  console.log("Seed complete!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
