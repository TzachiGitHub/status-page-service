"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/prisma.ts
var prisma_exports = {};
__export(prisma_exports, {
  default: () => prisma_default
});
var import_client, prisma, prisma_default;
var init_prisma = __esm({
  "src/lib/prisma.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    prisma = new import_client.PrismaClient();
    prisma_default = prisma;
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_config = require("dotenv/config");
var import_express13 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_path = __toESM(require("path"));

// src/routes/auth.ts
var import_express = require("express");
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_zod2 = require("zod");
init_prisma();

// src/middleware/validate.ts
var import_zod = require("zod");
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof import_zod.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: err.errors.map((e) => ({ path: e.path.join("."), message: e.message }))
        });
        return;
      }
      next(err);
    }
  };
}

// src/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "secret");
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// src/routes/auth.ts
var router = (0, import_express.Router)();
var registerSchema = import_zod2.z.object({
  orgName: import_zod2.z.string().min(1),
  name: import_zod2.z.string().min(1),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(6)
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(1)
});
function signToken(payload) {
  return import_jsonwebtoken2.default.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
}
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { orgName, name, email, password } = req.body;
    const existing = await prisma_default.member.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const org = await prisma_default.organization.create({
      data: {
        name: orgName,
        slug,
        members: {
          create: { email, password: hashedPassword, name, role: "OWNER" }
        }
      },
      include: { members: true }
    });
    const member = org.members[0];
    const token = signToken({ userId: member.id, orgId: org.id, role: member.role });
    res.status(201).json({
      token,
      user: { id: member.id, email: member.email, name: member.name, role: member.role },
      organization: { id: org.id, name: org.name, slug: org.slug }
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", message: err.message });
  }
});
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = await prisma_default.member.findUnique({ where: { email }, include: { organization: true } });
    if (!member) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await import_bcryptjs.default.compare(password, member.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ userId: member.id, orgId: member.orgId, role: member.role });
    res.json({
      token,
      user: { id: member.id, email: member.email, name: member.name, role: member.role },
      organization: { id: member.organization.id, name: member.organization.name, slug: member.organization.slug }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", message: err.message });
  }
});
router.get("/me", authenticate, async (req, res) => {
  try {
    const member = await prisma_default.member.findUnique({
      where: { id: req.user.userId },
      include: { organization: true }
    });
    if (!member) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      user: { id: member.id, email: member.email, name: member.name, role: member.role },
      organization: { id: member.organization.id, name: member.organization.name, slug: member.organization.slug }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user", message: err.message });
  }
});
var auth_default = router;

// src/routes/monitors.ts
var import_express2 = require("express");

// src/services/monitorService.ts
init_prisma();
var import_client2 = require("@prisma/client");
async function list(orgId, filters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where = { orgId };
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  const [monitors, total] = await Promise.all([
    prisma_default.monitor.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, include: { component: true } }),
    prisma_default.monitor.count({ where })
  ]);
  return { data: monitors, meta: { total, page, limit } };
}
async function getById(id, orgId) {
  const monitor = await prisma_default.monitor.findFirst({ where: { id, orgId }, include: { component: true } });
  if (!monitor) throw new NotFoundError("Monitor not found");
  return { data: monitor };
}
async function create(data, orgId) {
  const monitor = await prisma_default.monitor.create({ data: { ...data, orgId } });
  return { data: monitor };
}
async function update(id, data, orgId) {
  await ensureExists(id, orgId);
  const monitor = await prisma_default.monitor.update({ where: { id }, data });
  return { data: monitor };
}
async function remove(id, orgId) {
  await ensureExists(id, orgId);
  await prisma_default.monitor.delete({ where: { id } });
  return { data: { id } };
}
async function pause(id, orgId) {
  await ensureExists(id, orgId);
  const monitor = await prisma_default.monitor.update({ where: { id }, data: { enabled: false } });
  return { data: monitor };
}
async function resume(id, orgId) {
  await ensureExists(id, orgId);
  const monitor = await prisma_default.monitor.update({ where: { id }, data: { enabled: true } });
  return { data: monitor };
}
async function getChecks(id, orgId, pagination = {}) {
  await ensureExists(id, orgId);
  const page = pagination.page || 1;
  const limit = pagination.limit || 50;
  const [checks, total] = await Promise.all([
    prisma_default.monitorCheck.findMany({ where: { monitorId: id }, skip: (page - 1) * limit, take: limit, orderBy: { checkedAt: "desc" } }),
    prisma_default.monitorCheck.count({ where: { monitorId: id } })
  ]);
  return { data: checks, meta: { total, page, limit } };
}
async function getUptimeStats(id) {
  const ranges = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
  const stats = {};
  for (const [key2, days] of Object.entries(ranges)) {
    const since = new Date(Date.now() - days * 864e5);
    const [total, up] = await Promise.all([
      prisma_default.monitorCheck.count({ where: { monitorId: id, checkedAt: { gte: since } } }),
      prisma_default.monitorCheck.count({ where: { monitorId: id, checkedAt: { gte: since }, status: import_client2.MonitorStatus.UP } })
    ]);
    stats[key2] = total > 0 ? Math.round(up / total * 1e4) / 100 : 100;
  }
  return { data: stats };
}
async function getResponseTimes(id, range = "24h") {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 1;
  const since = new Date(Date.now() - days * 864e5);
  const checks = await prisma_default.monitorCheck.findMany({
    where: { monitorId: id, checkedAt: { gte: since }, responseTime: { not: null } },
    select: { checkedAt: true, responseTime: true },
    orderBy: { checkedAt: "asc" }
  });
  return { data: checks };
}
var NotFoundError = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function ensureExists(id, orgId) {
  const m = await prisma_default.monitor.findFirst({ where: { id, orgId } });
  if (!m) throw new NotFoundError("Monitor not found");
  return m;
}

// src/validation/monitors.ts
var import_zod3 = require("zod");
var CreateMonitorSchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1).max(255),
  type: import_zod3.z.enum(["HTTP", "TCP", "PING", "DNS", "SSL", "HEARTBEAT"]),
  url: import_zod3.z.string().optional(),
  method: import_zod3.z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]).optional(),
  interval: import_zod3.z.number().int().min(10).max(3600).optional(),
  timeout: import_zod3.z.number().int().min(1).max(120).optional(),
  componentId: import_zod3.z.string().uuid().optional(),
  headers: import_zod3.z.record(import_zod3.z.string(), import_zod3.z.string()).optional(),
  body: import_zod3.z.string().optional(),
  expectedStatus: import_zod3.z.number().int().optional()
});
var UpdateMonitorSchema = CreateMonitorSchema.partial();

// src/routes/monitors.ts
var router2 = (0, import_express2.Router)();
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router2.get("/", asyncHandler(async (req, res) => {
  const { page, limit, status, type } = req.query;
  const result = await list(req.user.orgId, {
    page: page ? Number(page) : void 0,
    limit: limit ? Number(limit) : void 0,
    status,
    type
  });
  res.json(result);
}));
router2.get("/:id", asyncHandler(async (req, res) => {
  const result = await getById(req.params.id, req.user.orgId);
  res.json(result);
}));
router2.post("/", validate(CreateMonitorSchema), asyncHandler(async (req, res) => {
  const result = await create(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router2.patch("/:id", validate(UpdateMonitorSchema), asyncHandler(async (req, res) => {
  const result = await update(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router2.delete("/:id", asyncHandler(async (req, res) => {
  const result = await remove(req.params.id, req.user.orgId);
  res.json(result);
}));
router2.post("/:id/pause", asyncHandler(async (req, res) => {
  const result = await pause(req.params.id, req.user.orgId);
  res.json(result);
}));
router2.post("/:id/resume", asyncHandler(async (req, res) => {
  const result = await resume(req.params.id, req.user.orgId);
  res.json(result);
}));
router2.get("/:id/checks", asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await getChecks(req.params.id, req.user.orgId, {
    page: page ? Number(page) : void 0,
    limit: limit ? Number(limit) : void 0
  });
  res.json(result);
}));
router2.get("/:id/uptime", asyncHandler(async (req, res) => {
  const result = await getUptimeStats(req.params.id);
  res.json(result);
}));
router2.get("/:id/response-times", asyncHandler(async (req, res) => {
  const result = await getResponseTimes(req.params.id, req.query.range);
  res.json(result);
}));
var monitors_default = router2;

// src/routes/components.ts
var import_express3 = require("express");

// src/services/componentService.ts
init_prisma();
var NotFoundError2 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function list2(orgId) {
  const components = await prisma_default.component.findMany({
    where: { orgId },
    orderBy: { order: "asc" },
    include: { group: true }
  });
  return { data: components };
}
async function create2(data, orgId) {
  const component = await prisma_default.component.create({ data: { ...data, orgId } });
  return { data: component };
}
async function getById2(id, orgId) {
  const c = await prisma_default.component.findFirst({ where: { id, orgId }, include: { group: true } });
  if (!c) throw new NotFoundError2("Component not found");
  return { data: c };
}
async function update2(id, data, orgId) {
  const c = await prisma_default.component.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError2("Component not found");
  const component = await prisma_default.component.update({ where: { id }, data });
  return { data: component };
}
async function remove2(id, orgId) {
  const c = await prisma_default.component.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError2("Component not found");
  await prisma_default.component.delete({ where: { id } });
  return { data: { id } };
}
async function reorder(ids, orgId) {
  const updates = ids.map(
    (id, index) => prisma_default.component.updateMany({ where: { id, orgId }, data: { order: index } })
  );
  await prisma_default.$transaction(updates);
  return { data: { success: true } };
}
async function getStatusHistory(id, days = 30) {
  const since = new Date(Date.now() - days * 864e5);
  const history = await prisma_default.incidentComponent.findMany({
    where: { componentId: id, incident: { createdAt: { gte: since } } },
    include: { incident: { select: { title: true, createdAt: true, resolvedAt: true, status: true } } },
    orderBy: { incident: { createdAt: "desc" } }
  });
  return { data: history };
}

// src/validation/components.ts
var import_zod4 = require("zod");
var CreateComponentSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1).max(255),
  description: import_zod4.z.string().optional(),
  status: import_zod4.z.enum(["OPERATIONAL", "DEGRADED_PERFORMANCE", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNDER_MAINTENANCE"]).optional(),
  groupId: import_zod4.z.string().uuid().optional().nullable(),
  order: import_zod4.z.number().int().optional()
});
var UpdateComponentSchema = CreateComponentSchema.partial();
var ReorderComponentsSchema = import_zod4.z.object({
  ids: import_zod4.z.array(import_zod4.z.string().uuid()).min(1)
});
var CreateComponentGroupSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1).max(255),
  order: import_zod4.z.number().int().optional()
});
var UpdateComponentGroupSchema = CreateComponentGroupSchema.partial();

// src/routes/components.ts
var router3 = (0, import_express3.Router)();
function asyncHandler2(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router3.get("/", asyncHandler2(async (req, res) => {
  const result = await list2(req.user.orgId);
  res.json(result);
}));
router3.get("/:id", asyncHandler2(async (req, res) => {
  const result = await getById2(req.params.id, req.user.orgId);
  res.json(result);
}));
router3.post("/", validate(CreateComponentSchema), asyncHandler2(async (req, res) => {
  const result = await create2(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router3.patch("/:id", validate(UpdateComponentSchema), asyncHandler2(async (req, res) => {
  const result = await update2(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router3.delete("/:id", asyncHandler2(async (req, res) => {
  const result = await remove2(req.params.id, req.user.orgId);
  res.json(result);
}));
router3.post("/reorder", validate(ReorderComponentsSchema), asyncHandler2(async (req, res) => {
  const result = await reorder(req.body.ids, req.user.orgId);
  res.json(result);
}));
router3.get("/:id/history", asyncHandler2(async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const result = await getStatusHistory(req.params.id, days);
  res.json(result);
}));
var components_default = router3;

// src/routes/componentGroups.ts
var import_express4 = require("express");

// src/services/componentGroupService.ts
init_prisma();
var NotFoundError3 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function list3(orgId) {
  const groups = await prisma_default.componentGroup.findMany({
    where: { orgId },
    orderBy: { order: "asc" },
    include: { components: { orderBy: { order: "asc" } } }
  });
  return { data: groups };
}
async function create3(data, orgId) {
  const group = await prisma_default.componentGroup.create({ data: { ...data, orgId } });
  return { data: group };
}
async function getById3(id, orgId) {
  const g = await prisma_default.componentGroup.findFirst({ where: { id, orgId }, include: { components: true } });
  if (!g) throw new NotFoundError3("Component group not found");
  return { data: g };
}
async function update3(id, data, orgId) {
  const g = await prisma_default.componentGroup.findFirst({ where: { id, orgId } });
  if (!g) throw new NotFoundError3("Component group not found");
  const group = await prisma_default.componentGroup.update({ where: { id }, data });
  return { data: group };
}
async function remove3(id, orgId) {
  const g = await prisma_default.componentGroup.findFirst({ where: { id, orgId } });
  if (!g) throw new NotFoundError3("Component group not found");
  await prisma_default.componentGroup.delete({ where: { id } });
  return { data: { id } };
}

// src/routes/componentGroups.ts
var router4 = (0, import_express4.Router)();
function asyncHandler3(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router4.get("/", asyncHandler3(async (req, res) => {
  const result = await list3(req.user.orgId);
  res.json(result);
}));
router4.get("/:id", asyncHandler3(async (req, res) => {
  const result = await getById3(req.params.id, req.user.orgId);
  res.json(result);
}));
router4.post("/", validate(CreateComponentGroupSchema), asyncHandler3(async (req, res) => {
  const result = await create3(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router4.patch("/:id", validate(UpdateComponentGroupSchema), asyncHandler3(async (req, res) => {
  const result = await update3(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router4.delete("/:id", asyncHandler3(async (req, res) => {
  const result = await remove3(req.params.id, req.user.orgId);
  res.json(result);
}));
var componentGroups_default = router4;

// src/routes/incidents.ts
var import_express5 = require("express");

// src/services/incidentService.ts
init_prisma();
var NotFoundError4 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function list4(orgId, filters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where = { orgId };
  if (filters.status) where.status = filters.status;
  const [incidents, total] = await Promise.all([
    prisma_default.incident.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { updates: { orderBy: { createdAt: "desc" }, take: 1 }, components: { include: { component: true } } }
    }),
    prisma_default.incident.count({ where })
  ]);
  return { data: incidents, meta: { total, page, limit } };
}
async function getById4(id, orgId) {
  const incident = await prisma_default.incident.findFirst({
    where: { id, orgId },
    include: { updates: { orderBy: { createdAt: "desc" } }, components: { include: { component: true } } }
  });
  if (!incident) throw new NotFoundError4("Incident not found");
  return { data: incident };
}
async function create4(data, orgId) {
  const { componentIds, componentStatus, message, ...incidentData } = data;
  const incident = await prisma_default.incident.create({
    data: {
      ...incidentData,
      orgId,
      updates: { create: { status: incidentData.status || "INVESTIGATING", message } },
      ...componentIds?.length ? {
        components: {
          create: componentIds.map((componentId) => ({
            componentId,
            status: componentStatus || "MAJOR_OUTAGE"
          }))
        }
      } : {}
    },
    include: { updates: true, components: { include: { component: true } } }
  });
  return { data: incident };
}
async function update4(id, data, orgId) {
  const existing = await prisma_default.incident.findFirst({ where: { id, orgId } });
  if (!existing) throw new NotFoundError4("Incident not found");
  const resolvedAt = data.status === "RESOLVED" ? /* @__PURE__ */ new Date() : void 0;
  const incident = await prisma_default.incident.update({ where: { id }, data: { ...data, ...resolvedAt ? { resolvedAt } : {} } });
  return { data: incident };
}
async function remove4(id, orgId) {
  const existing = await prisma_default.incident.findFirst({ where: { id, orgId } });
  if (!existing) throw new NotFoundError4("Incident not found");
  await prisma_default.incident.delete({ where: { id } });
  return { data: { id } };
}
async function addUpdate(incidentId, data, orgId) {
  const incident = await prisma_default.incident.findFirst({ where: { id: incidentId, orgId } });
  if (!incident) throw new NotFoundError4("Incident not found");
  const resolvedAt = data.status === "RESOLVED" ? /* @__PURE__ */ new Date() : void 0;
  const [incidentUpdate] = await prisma_default.$transaction([
    prisma_default.incidentUpdate.create({ data: { incidentId, status: data.status, message: data.message } }),
    prisma_default.incident.update({ where: { id: incidentId }, data: { status: data.status, ...resolvedAt ? { resolvedAt } : {} } })
  ]);
  return { data: incidentUpdate };
}

// src/validation/incidents.ts
var import_zod5 = require("zod");
var CreateIncidentSchema = import_zod5.z.object({
  title: import_zod5.z.string().min(1).max(500),
  status: import_zod5.z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]).optional(),
  severity: import_zod5.z.enum(["MINOR", "MAJOR", "CRITICAL"]).optional(),
  message: import_zod5.z.string().min(1),
  componentIds: import_zod5.z.array(import_zod5.z.string().uuid()).optional(),
  componentStatus: import_zod5.z.enum(["OPERATIONAL", "DEGRADED_PERFORMANCE", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNDER_MAINTENANCE"]).optional()
});
var UpdateIncidentSchema = import_zod5.z.object({
  title: import_zod5.z.string().min(1).max(500).optional(),
  status: import_zod5.z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]).optional(),
  severity: import_zod5.z.enum(["MINOR", "MAJOR", "CRITICAL"]).optional()
});
var AddIncidentUpdateSchema = import_zod5.z.object({
  status: import_zod5.z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  message: import_zod5.z.string().min(1)
});

// src/routes/incidents.ts
var router5 = (0, import_express5.Router)();
function asyncHandler4(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router5.get("/", asyncHandler4(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await list4(req.user.orgId, {
    page: page ? Number(page) : void 0,
    limit: limit ? Number(limit) : void 0,
    status
  });
  res.json(result);
}));
router5.get("/:id", asyncHandler4(async (req, res) => {
  const result = await getById4(req.params.id, req.user.orgId);
  res.json(result);
}));
router5.post("/", validate(CreateIncidentSchema), asyncHandler4(async (req, res) => {
  const result = await create4(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router5.patch("/:id", validate(UpdateIncidentSchema), asyncHandler4(async (req, res) => {
  const result = await update4(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router5.delete("/:id", asyncHandler4(async (req, res) => {
  const result = await remove4(req.params.id, req.user.orgId);
  res.json(result);
}));
router5.post("/:id/updates", validate(AddIncidentUpdateSchema), asyncHandler4(async (req, res) => {
  const result = await addUpdate(req.params.id, req.body, req.user.orgId);
  res.status(201).json(result);
}));
var incidents_default = router5;

// src/routes/subscribers.ts
var import_express6 = require("express");

// src/services/subscriberService.ts
init_prisma();
var NotFoundError5 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function list5(orgId, pagination = {}) {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const [subscribers, total] = await Promise.all([
    prisma_default.subscriber.findMany({ where: { orgId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    prisma_default.subscriber.count({ where: { orgId } })
  ]);
  return { data: subscribers, meta: { total, page, limit } };
}
async function subscribe(email, orgId) {
  const existing = await prisma_default.subscriber.findFirst({ where: { email, orgId } });
  if (existing) return { data: existing };
  const subscriber = await prisma_default.subscriber.create({ data: { email, orgId } });
  return { data: subscriber };
}
async function confirm(token) {
  const subscriber = await prisma_default.subscriber.findUnique({ where: { token } });
  if (!subscriber) throw new NotFoundError5("Invalid confirmation token");
  const updated = await prisma_default.subscriber.update({ where: { token }, data: { confirmed: true } });
  return { data: updated };
}
async function unsubscribe(token) {
  const subscriber = await prisma_default.subscriber.findUnique({ where: { token } });
  if (!subscriber) throw new NotFoundError5("Invalid unsubscribe token");
  await prisma_default.subscriber.delete({ where: { token } });
  return { data: { success: true } };
}
async function remove5(id, orgId) {
  const s = await prisma_default.subscriber.findFirst({ where: { id, orgId } });
  if (!s) throw new NotFoundError5("Subscriber not found");
  await prisma_default.subscriber.delete({ where: { id } });
  return { data: { id } };
}

// src/validation/subscribers.ts
var import_zod6 = require("zod");
var SubscribeSchema = import_zod6.z.object({
  email: import_zod6.z.string().email(),
  componentIds: import_zod6.z.array(import_zod6.z.string().uuid()).optional()
});

// src/routes/subscribers.ts
var router6 = (0, import_express6.Router)();
function asyncHandler5(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router6.post("/:orgSlug/subscribe", validate(SubscribeSchema), asyncHandler5(async (req, res) => {
  const { default: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
  const org = await prisma2.organization.findUnique({ where: { slug: req.params.orgSlug } });
  if (!org) {
    res.status(404).json({ error: { code: "RESOURCE_NOT_FOUND", message: "Organization not found" } });
    return;
  }
  const result = await subscribe(req.body.email, org.id);
  res.status(201).json(result);
}));
router6.get("/confirm/:token", asyncHandler5(async (req, res) => {
  const result = await confirm(req.params.token);
  res.json(result);
}));
router6.get("/unsubscribe/:token", asyncHandler5(async (req, res) => {
  const result = await unsubscribe(req.params.token);
  res.json(result);
}));
router6.get("/", authenticate, asyncHandler5(async (req, res) => {
  const { page, limit } = req.query;
  const result = await list5(req.user.orgId, {
    page: page ? Number(page) : void 0,
    limit: limit ? Number(limit) : void 0
  });
  res.json(result);
}));
router6.delete("/:id", authenticate, asyncHandler5(async (req, res) => {
  const result = await remove5(req.params.id, req.user.orgId);
  res.json(result);
}));
var subscribers_default = router6;

// src/routes/notificationChannels.ts
var import_express7 = require("express");

// src/services/notificationChannelService.ts
init_prisma();
var NotFoundError6 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function list6(orgId) {
  const channels = await prisma_default.notificationChannel.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
  return { data: channels };
}
async function create5(data, orgId) {
  const channel = await prisma_default.notificationChannel.create({ data: { ...data, orgId } });
  return { data: channel };
}
async function getById5(id, orgId) {
  const c = await prisma_default.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError6("Notification channel not found");
  return { data: c };
}
async function update5(id, data, orgId) {
  const c = await prisma_default.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError6("Notification channel not found");
  const channel = await prisma_default.notificationChannel.update({ where: { id }, data });
  return { data: channel };
}
async function remove6(id, orgId) {
  const c = await prisma_default.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError6("Notification channel not found");
  await prisma_default.notificationChannel.delete({ where: { id } });
  return { data: { id } };
}
async function test(id, orgId) {
  const c = await prisma_default.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError6("Notification channel not found");
  return { data: { success: true, message: "Test notification sent" } };
}

// src/validation/notificationChannels.ts
var import_zod7 = require("zod");
var CreateNotificationChannelSchema = import_zod7.z.object({
  name: import_zod7.z.string().min(1).max(255),
  type: import_zod7.z.enum(["EMAIL", "SLACK", "WEBHOOK", "SMS"]),
  config: import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()),
  enabled: import_zod7.z.boolean().optional()
});
var UpdateNotificationChannelSchema = CreateNotificationChannelSchema.partial();

// src/routes/notificationChannels.ts
var router7 = (0, import_express7.Router)();
function asyncHandler6(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router7.get("/", asyncHandler6(async (req, res) => {
  const result = await list6(req.user.orgId);
  res.json(result);
}));
router7.get("/:id", asyncHandler6(async (req, res) => {
  const result = await getById5(req.params.id, req.user.orgId);
  res.json(result);
}));
router7.post("/", validate(CreateNotificationChannelSchema), asyncHandler6(async (req, res) => {
  const result = await create5(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router7.patch("/:id", validate(UpdateNotificationChannelSchema), asyncHandler6(async (req, res) => {
  const result = await update5(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router7.delete("/:id", asyncHandler6(async (req, res) => {
  const result = await remove6(req.params.id, req.user.orgId);
  res.json(result);
}));
router7.post("/:id/test", asyncHandler6(async (req, res) => {
  const result = await test(req.params.id, req.user.orgId);
  res.json(result);
}));
var notificationChannels_default = router7;

// src/routes/apiKeys.ts
var import_express8 = require("express");

// src/services/apiKeyService.ts
init_prisma();
var import_crypto = __toESM(require("crypto"));
var NotFoundError7 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function list7(orgId) {
  const keys = await prisma_default.apiKey.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, key: true, expiresAt: true, lastUsedAt: true, createdAt: true }
  });
  const masked = keys.map((k) => ({ ...k, key: "..." + k.key.slice(-8) }));
  return { data: masked };
}
async function create6(data, orgId) {
  const key2 = `sp_${import_crypto.default.randomBytes(32).toString("hex")}`;
  const apiKey = await prisma_default.apiKey.create({
    data: { name: data.name, key: key2, orgId, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }
  });
  return { data: apiKey };
}
async function revoke(id, orgId) {
  const k = await prisma_default.apiKey.findFirst({ where: { id, orgId } });
  if (!k) throw new NotFoundError7("API key not found");
  await prisma_default.apiKey.delete({ where: { id } });
  return { data: { id } };
}

// src/validation/apiKeys.ts
var import_zod8 = require("zod");
var CreateApiKeySchema = import_zod8.z.object({
  name: import_zod8.z.string().min(1).max(255),
  expiresAt: import_zod8.z.string().datetime().optional()
});

// src/routes/apiKeys.ts
var router8 = (0, import_express8.Router)();
function asyncHandler7(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
function requireAdmin(req, res, next) {
  if (!req.user || !["OWNER", "ADMIN"].includes(req.user.role)) {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Only OWNER and ADMIN can manage API keys" } });
    return;
  }
  next();
}
router8.use(requireAdmin);
router8.get("/", asyncHandler7(async (req, res) => {
  const result = await list7(req.user.orgId);
  res.json(result);
}));
router8.post("/", validate(CreateApiKeySchema), asyncHandler7(async (req, res) => {
  const result = await create6(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router8.delete("/:id", asyncHandler7(async (req, res) => {
  const result = await revoke(req.params.id, req.user.orgId);
  res.json(result);
}));
var apiKeys_default = router8;

// src/routes/statusPage.ts
var import_express9 = require("express");

// src/services/statusPageService.ts
init_prisma();
var import_client3 = require("@prisma/client");
var NotFoundError8 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
async function getConfig(orgId) {
  const config = await prisma_default.statusPageConfig.findUnique({ where: { orgId } });
  return { data: config };
}
async function updateConfig(orgId, data) {
  const config = await prisma_default.statusPageConfig.upsert({
    where: { orgId },
    update: data,
    create: { ...data, orgId, title: data.title || "Status Page" }
  });
  return { data: config };
}
async function getOrgBySlug(slug) {
  const org = await prisma_default.organization.findUnique({ where: { slug } });
  if (!org) throw new NotFoundError8("Status page not found");
  return org;
}
async function getPublicStatus(slug) {
  const org = await getOrgBySlug(slug);
  const [config, components, groups] = await Promise.all([
    prisma_default.statusPageConfig.findUnique({ where: { orgId: org.id } }),
    prisma_default.component.findMany({ where: { orgId: org.id }, orderBy: { order: "asc" }, include: { group: true } }),
    prisma_default.componentGroup.findMany({ where: { orgId: org.id }, orderBy: { order: "asc" } })
  ]);
  const allOperational = components.every((c) => c.status === "OPERATIONAL");
  const hasMajor = components.some((c) => c.status === "MAJOR_OUTAGE");
  const overallStatus = hasMajor ? "major_outage" : allOperational ? "operational" : "degraded";
  return {
    data: {
      name: org.name,
      config,
      overallStatus,
      components,
      groups
    }
  };
}
async function getPublicIncidents(slug) {
  const org = await getOrgBySlug(slug);
  const incidents = await prisma_default.incident.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { updates: { orderBy: { createdAt: "desc" } }, components: { include: { component: true } } }
  });
  return { data: incidents };
}
async function getPublicUptime(slug, days = 90) {
  const org = await getOrgBySlug(slug);
  const components = await prisma_default.component.findMany({ where: { orgId: org.id }, orderBy: { order: "asc" } });
  const since = new Date(Date.now() - days * 864e5);
  const uptimeData = await Promise.all(
    components.map(async (component) => {
      const monitors = await prisma_default.monitor.findMany({ where: { componentId: component.id } });
      if (monitors.length === 0) return { componentId: component.id, name: component.name, uptime: 100 };
      const monitorIds = monitors.map((m) => m.id);
      const [total, up] = await Promise.all([
        prisma_default.monitorCheck.count({ where: { monitorId: { in: monitorIds }, checkedAt: { gte: since } } }),
        prisma_default.monitorCheck.count({ where: { monitorId: { in: monitorIds }, checkedAt: { gte: since }, status: import_client3.MonitorStatus.UP } })
      ]);
      return { componentId: component.id, name: component.name, uptime: total > 0 ? Math.round(up / total * 1e4) / 100 : 100 };
    })
  );
  return { data: uptimeData };
}
async function getPublicMetrics(slug) {
  const org = await getOrgBySlug(slug);
  const monitors = await prisma_default.monitor.findMany({ where: { orgId: org.id, enabled: true }, include: { component: true } });
  const since = new Date(Date.now() - 864e5);
  const metrics = await Promise.all(
    monitors.map(async (monitor) => {
      const checks = await prisma_default.monitorCheck.findMany({
        where: { monitorId: monitor.id, checkedAt: { gte: since }, responseTime: { not: null } },
        select: { checkedAt: true, responseTime: true },
        orderBy: { checkedAt: "asc" }
      });
      return { monitorId: monitor.id, name: monitor.name, component: monitor.component?.name, data: checks };
    })
  );
  return { data: metrics };
}

// src/validation/statusPage.ts
var import_zod9 = require("zod");
var UpdateStatusPageConfigSchema = import_zod9.z.object({
  title: import_zod9.z.string().min(1).max(255).optional(),
  description: import_zod9.z.string().optional(),
  logoUrl: import_zod9.z.string().url().optional().nullable(),
  faviconUrl: import_zod9.z.string().url().optional().nullable(),
  customDomain: import_zod9.z.string().optional().nullable(),
  customCss: import_zod9.z.string().optional().nullable(),
  showUptime: import_zod9.z.boolean().optional(),
  showResponseTime: import_zod9.z.boolean().optional()
});

// src/routes/statusPage.ts
var router9 = (0, import_express9.Router)();
function asyncHandler8(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router9.get("/config", authenticate, asyncHandler8(async (req, res) => {
  const result = await getConfig(req.user.orgId);
  res.json(result);
}));
router9.patch("/config", authenticate, validate(UpdateStatusPageConfigSchema), asyncHandler8(async (req, res) => {
  const result = await updateConfig(req.user.orgId, req.body);
  res.json(result);
}));
var statusPage_default = router9;

// src/routes/public.ts
var import_express10 = require("express");
var router10 = (0, import_express10.Router)();
function asyncHandler9(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router10.get("/:slug/status", asyncHandler9(async (req, res) => {
  const result = await getPublicStatus(req.params.slug);
  res.json(result);
}));
router10.get("/:slug/incidents", asyncHandler9(async (req, res) => {
  const result = await getPublicIncidents(req.params.slug);
  res.json(result);
}));
router10.get("/:slug/uptime", asyncHandler9(async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 90;
  const result = await getPublicUptime(req.params.slug, days);
  res.json(result);
}));
router10.get("/:slug/metrics", asyncHandler9(async (req, res) => {
  const result = await getPublicMetrics(req.params.slug);
  res.json(result);
}));
var public_default = router10;

// src/sse/routes.ts
var import_express11 = require("express");
init_prisma();

// src/sse/manager.ts
function key(orgId, type) {
  return `${orgId}:${type}`;
}
var SSEManager = class {
  connections = /* @__PURE__ */ new Map();
  addConnection(orgId, type, res) {
    const k = key(orgId, type);
    if (!this.connections.has(k)) {
      this.connections.set(k, /* @__PURE__ */ new Set());
    }
    this.connections.get(k).add(res);
  }
  removeConnection(orgId, type, res) {
    const k = key(orgId, type);
    const set = this.connections.get(k);
    if (set) {
      set.delete(res);
      if (set.size === 0) this.connections.delete(k);
    }
  }
  broadcast(orgId, type, event) {
    const k = key(orgId, type);
    const set = this.connections.get(k);
    if (!set) return;
    const payload = `event: ${event.type}
data: ${JSON.stringify(event.data)}

`;
    for (const res of set) {
      try {
        res.write(payload);
      } catch {
        set.delete(res);
      }
    }
  }
  broadcastAll(orgId, event) {
    this.broadcast(orgId, "dashboard", event);
    this.broadcast(orgId, "public", event);
  }
  getConnectionCount(orgId) {
    let count = 0;
    for (const type of ["dashboard", "public"]) {
      const set = this.connections.get(key(orgId, type));
      if (set) count += set.size;
    }
    return count;
  }
};
var sseManager = new SSEManager();

// src/sse/routes.ts
var router11 = (0, import_express11.Router)();
function setupSSE(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.write(":ok\n\n");
  const heartbeat = setInterval(() => {
    try {
      res.write(":ping\n\n");
    } catch {
    }
  }, 3e4);
  return heartbeat;
}
router11.get("/api/sse/dashboard", authenticate, (req, res) => {
  const orgId = req.user.orgId;
  const heartbeat = setupSSE(res);
  sseManager.addConnection(orgId, "dashboard", res);
  req.on("close", () => {
    clearInterval(heartbeat);
    sseManager.removeConnection(orgId, "dashboard", res);
  });
});
router11.get("/api/public/:slug/sse", async (req, res) => {
  const org = await prisma_default.organization.findUnique({ where: { slug: req.params.slug } });
  if (!org) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const heartbeat = setupSSE(res);
  sseManager.addConnection(org.id, "public", res);
  req.on("close", () => {
    clearInterval(heartbeat);
    sseManager.removeConnection(org.id, "public", res);
  });
});
var routes_default = router11;

// src/routes/heartbeat.ts
var import_express12 = require("express");
function createHeartbeatRouter(prisma2) {
  const router12 = (0, import_express12.Router)();
  async function handleHeartbeat(req, res) {
    const { token } = req.params;
    try {
      const monitor = await prisma2.monitor.findUnique({
        where: { heartbeatToken: token }
      });
      if (!monitor) {
        return res.status(404).json({ error: "Monitor not found" });
      }
      if (monitor.type !== "HEARTBEAT") {
        return res.status(400).json({ error: "Monitor is not a heartbeat type" });
      }
      const now = /* @__PURE__ */ new Date();
      await prisma2.monitor.update({
        where: { id: monitor.id },
        data: { lastCheckedAt: now, currentStatus: "UP" }
      });
      await prisma2.monitorCheck.create({
        data: {
          monitorId: monitor.id,
          status: "UP",
          responseTime: 0,
          region: "heartbeat"
        }
      });
      return res.json({ ok: true, msg: "Heartbeat recorded" });
    } catch (err) {
      console.error("[Heartbeat] Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  router12.post("/:token", handleHeartbeat);
  router12.get("/:token", handleHeartbeat);
  return router12;
}

// src/middleware/errorHandler.ts
function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : void 0
  });
}

// src/index.ts
init_prisma();
var app = (0, import_express13.default)();
var PORT = parseInt(process.env.PORT || "3030", 10);
app.use((0, import_cors.default)());
app.use(import_express13.default.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/api/auth", auth_default);
app.use("/api/monitors", authenticate, monitors_default);
app.use("/api/components", authenticate, components_default);
app.use("/api/component-groups", authenticate, componentGroups_default);
app.use("/api/incidents", authenticate, incidents_default);
app.use("/api/subscribers", subscribers_default);
app.use("/api/notification-channels", authenticate, notificationChannels_default);
app.use("/api/api-keys", authenticate, apiKeys_default);
app.use("/api/status-page", statusPage_default);
app.use("/api/public", public_default);
app.use(routes_default);
app.use("/api/heartbeat", createHeartbeatRouter(prisma_default));
app.use("/status", import_express13.default.static(import_path.default.join(__dirname, "../public/status-page")));
app.get("/status/*", (_req, res) => {
  const indexPath = import_path.default.join(__dirname, "../public/status-page/index.html");
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).end();
  });
});
app.use(import_express13.default.static(import_path.default.join(__dirname, "../public/dashboard")));
app.use((err, _req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ error: { code: err.code || "ERROR", message: err.message } });
    return;
  }
  next(err);
});
app.use(errorHandler);
app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/status")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const indexPath = import_path.default.join(__dirname, "../public/dashboard/index.html");
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).end();
  });
});
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`\u{1F680} Status Page server running on http://localhost:${PORT}`);
  });
}
var index_default = app;
