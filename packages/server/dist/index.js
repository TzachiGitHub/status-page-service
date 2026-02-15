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
var import_express_rate_limit = __toESM(require("express-rate-limit"));
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

// src/lib/tokenBlacklist.ts
var tokenBlacklist = /* @__PURE__ */ new Set();

// src/middleware/auth.ts
var ROLE_HIERARCHY = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3
};
function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 999;
    if (userLevel < requiredLevel) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }
  const token = header.slice(7);
  try {
    if (tokenBlacklist.has(token)) {
      res.status(401).json({ error: "Token has been revoked" });
      return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }
    const payload = import_jsonwebtoken.default.verify(token, secret);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// src/routes/auth.ts
var loginLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // max 10 attempts per window
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var registerLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 5,
  message: { error: "Too many registration attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var router = (0, import_express.Router)();
var registerSchema = import_zod2.z.object({
  orgName: import_zod2.z.string().min(1),
  name: import_zod2.z.string().min(1),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8, "Password must be at least 8 characters")
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(1)
});
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}
function signToken(payload) {
  return import_jsonwebtoken2.default.sign(payload, getJwtSecret(), { expiresIn: "1h" });
}
router.post("/register", registerLimiter, validate(registerSchema), async (req, res) => {
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
    console.error("Registration error:", err);
    const message = err?.code === "P2002" ? "Organization name already taken" : "Registration failed";
    res.status(500).json({ error: message });
  }
});
router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
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
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
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
    console.error("Fetch user error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});
router.post("/logout", authenticate, (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    tokenBlacklist.add(token);
  }
  res.json({ message: "Logged out successfully" });
});
var auth_default = router;

// src/routes/monitors.ts
var import_express2 = require("express");

// src/services/monitorService.ts
init_prisma();
var import_client2 = require("@prisma/client");
var VALID_MONITOR_STATUSES = ["UP", "DOWN", "DEGRADED", "UNKNOWN"];
var VALID_MONITOR_TYPES = ["HTTP", "TCP", "PING", "DNS", "SSL", "HEARTBEAT"];
function validatePagination(page, limit) {
  let p = page || 1;
  let l = limit || 20;
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 1;
  if (l > 100) l = 100;
  return { page: p, limit: l };
}
async function list(orgId, filters = {}) {
  const { page, limit } = validatePagination(filters.page, filters.limit);
  const where = { orgId };
  if (filters.status) {
    if (!VALID_MONITOR_STATUSES.includes(filters.status)) {
      throw Object.assign(new Error(`Invalid status filter. Must be one of: ${VALID_MONITOR_STATUSES.join(", ")}`), { statusCode: 400, code: "INVALID_FILTER" });
    }
    where.status = filters.status;
  }
  if (filters.type) {
    if (!VALID_MONITOR_TYPES.includes(filters.type)) {
      throw Object.assign(new Error(`Invalid type filter. Must be one of: ${VALID_MONITOR_TYPES.join(", ")}`), { statusCode: 400, code: "INVALID_FILTER" });
    }
    where.type = filters.type;
  }
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
  if (data.type === "HEARTBEAT" && !data.heartbeatToken) {
    const { randomUUID } = await import("crypto");
    data.heartbeatToken = randomUUID();
  }
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
  const { page, limit } = validatePagination(pagination.page, pagination.limit);
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

// src/middleware/pagination.ts
function validatePagination2(req, res, next) {
  const { page, limit } = req.query;
  if (page !== void 0) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1) {
      res.status(400).json({ error: "page must be a positive integer" });
      return;
    }
  }
  if (limit !== void 0) {
    const l = Number(limit);
    if (!Number.isInteger(l) || l < 1 || l > 100) {
      res.status(400).json({ error: "limit must be an integer between 1 and 100" });
      return;
    }
  }
  next();
}

// src/validation/monitors.ts
var import_zod3 = require("zod");
var BaseMonitorSchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1).max(255),
  type: import_zod3.z.enum(["HTTP", "TCP", "PING", "DNS", "SSL", "HEARTBEAT"]),
  url: import_zod3.z.string().url().optional(),
  method: import_zod3.z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]).optional(),
  interval: import_zod3.z.number().int().min(10).max(3600).optional(),
  timeout: import_zod3.z.number().int().min(1).max(120).optional(),
  componentId: import_zod3.z.string().uuid().optional().nullable(),
  headers: import_zod3.z.record(import_zod3.z.string(), import_zod3.z.string()).optional(),
  body: import_zod3.z.string().optional(),
  expectedStatus: import_zod3.z.number().int().optional(),
  host: import_zod3.z.string().optional(),
  port: import_zod3.z.number().int().min(1).max(65535).optional(),
  config: import_zod3.z.record(import_zod3.z.string(), import_zod3.z.unknown()).optional(),
  regions: import_zod3.z.array(import_zod3.z.string()).optional(),
  alertAfter: import_zod3.z.number().int().min(1).optional(),
  recoverAfter: import_zod3.z.number().int().min(1).optional()
});
var CreateMonitorSchema = BaseMonitorSchema.superRefine((data, ctx) => {
  if (data.type === "HTTP" && !data.url) {
    ctx.addIssue({ code: import_zod3.z.ZodIssueCode.custom, message: "URL is required for HTTP monitors", path: ["url"] });
  }
  if (data.type === "TCP") {
    if (!data.host) ctx.addIssue({ code: import_zod3.z.ZodIssueCode.custom, message: "Host is required for TCP monitors", path: ["host"] });
    if (!data.port) ctx.addIssue({ code: import_zod3.z.ZodIssueCode.custom, message: "Port is required for TCP monitors", path: ["port"] });
  }
  if (data.type === "PING" && !data.host) {
    ctx.addIssue({ code: import_zod3.z.ZodIssueCode.custom, message: "Host is required for PING monitors", path: ["host"] });
  }
  if (data.type === "DNS" && !data.host) {
    ctx.addIssue({ code: import_zod3.z.ZodIssueCode.custom, message: "Host is required for DNS monitors", path: ["host"] });
  }
  if (data.type === "SSL" && !data.host) {
    ctx.addIssue({ code: import_zod3.z.ZodIssueCode.custom, message: "Host is required for SSL monitors", path: ["host"] });
  }
});
var UpdateMonitorSchema = BaseMonitorSchema.omit({ type: true }).partial();

// src/routes/monitors.ts
var router2 = (0, import_express2.Router)();
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}
router2.get("/", validatePagination2, asyncHandler(async (req, res) => {
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
router2.post("/", requireMinRole("EDITOR"), validate(CreateMonitorSchema), asyncHandler(async (req, res) => {
  const result = await create(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router2.patch("/:id", requireMinRole("EDITOR"), validate(UpdateMonitorSchema), asyncHandler(async (req, res) => {
  const result = await update(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router2.delete("/:id", requireMinRole("ADMIN"), asyncHandler(async (req, res) => {
  const result = await remove(req.params.id, req.user.orgId);
  res.json(result);
}));
router2.post("/:id/pause", requireMinRole("EDITOR"), asyncHandler(async (req, res) => {
  const result = await pause(req.params.id, req.user.orgId);
  res.json(result);
}));
router2.post("/:id/resume", requireMinRole("EDITOR"), asyncHandler(async (req, res) => {
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
  const existing = await prisma_default.component.findFirst({ where: { orgId, name: data.name } });
  if (existing) {
    const err = new Error("A component with this name already exists in your organization");
    err.statusCode = 409;
    err.code = "DUPLICATE_NAME";
    throw err;
  }
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
  const existing = await prisma_default.component.findMany({ where: { id: { in: ids }, orgId }, select: { id: true } });
  const existingIds = new Set(existing.map((c) => c.id));
  const missing = ids.filter((id) => !existingIds.has(id));
  if (missing.length > 0) {
    const err = new Error(`Components not found: ${missing.join(", ")}`);
    err.statusCode = 400;
    err.code = "INVALID_IDS";
    throw err;
  }
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
  order: import_zod4.z.number().int().min(0).optional(),
  showOnStatusPage: import_zod4.z.boolean().optional()
});
var UpdateComponentSchema = CreateComponentSchema.partial();
var ReorderComponentsSchema = import_zod4.z.object({
  ids: import_zod4.z.array(import_zod4.z.string().uuid()).min(1)
});
var CreateComponentGroupSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1).max(255),
  order: import_zod4.z.number().int().min(0).optional()
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
router3.post("/", requireMinRole("EDITOR"), validate(CreateComponentSchema), asyncHandler2(async (req, res) => {
  const result = await create2(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router3.patch("/:id", requireMinRole("EDITOR"), validate(UpdateComponentSchema), asyncHandler2(async (req, res) => {
  const result = await update2(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router3.delete("/:id", requireMinRole("ADMIN"), asyncHandler2(async (req, res) => {
  const result = await remove2(req.params.id, req.user.orgId);
  res.json(result);
}));
router3.post("/reorder", requireMinRole("EDITOR"), validate(ReorderComponentsSchema), asyncHandler2(async (req, res) => {
  const result = await reorder(req.body.ids, req.user.orgId);
  res.json(result);
}));
router3.get("/:id/history", asyncHandler2(async (req, res) => {
  let days = req.query.days ? Number(req.query.days) : 30;
  if (isNaN(days) || days < 1) days = 1;
  if (days > 365) days = 365;
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

// src/notifications/dispatcher.ts
init_prisma();

// src/notifications/email.ts
var import_nodemailer = __toESM(require("nodemailer"));
var transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = import_nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : void 0
    });
  }
  return transporter;
}
async function sendEmail(payload) {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.SMTP_FROM || "noreply@statuspage.local",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    });
    return true;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return false;
  }
}

// src/notifications/webhook.ts
var import_node_crypto = __toESM(require("crypto"));
async function sendWebhook(url, payload, secret) {
  try {
    const body = JSON.stringify(payload);
    const headers = { "Content-Type": "application/json" };
    if (secret) {
      const signature = import_node_crypto.default.createHmac("sha256", secret).update(body).digest("hex");
      headers["X-Signature"] = signature;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1e4);
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`[webhook] ${url} returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[webhook] Failed to send:", err);
    return false;
  }
}

// src/notifications/slack.ts
var COLORS = { down: "#e74c3c", recovery: "#27ae60", degraded: "#f39c12", info: "#3498db" };
function formatMonitorAlert(monitor, isDown, detail) {
  const color = isDown ? COLORS.down : COLORS.recovery;
  const emoji = isDown ? "\u{1F534}" : "\u2705";
  const status = isDown ? "DOWN" : "RECOVERED";
  return {
    text: `${emoji} ${monitor.name} is ${status}`,
    attachments: [{
      color,
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `*${emoji} ${monitor.name}* is *${status}*` } },
        { type: "section", fields: [
          { type: "mrkdwn", text: `*Monitor:*
${monitor.name}` },
          { type: "mrkdwn", text: `*URL:*
${monitor.url || "N/A"}` },
          { type: "mrkdwn", text: `*Detail:*
${detail}` }
        ] }
      ]
    }]
  };
}
function formatIncidentUpdate(incident, updateText) {
  const color = incident.severity === "CRITICAL" ? COLORS.down : incident.severity === "MAJOR" ? COLORS.degraded : COLORS.info;
  return {
    text: `\u26A0\uFE0F Incident: ${incident.title}`,
    attachments: [{
      color,
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `*\u26A0\uFE0F ${incident.title}*` } },
        { type: "section", fields: [
          { type: "mrkdwn", text: `*Status:*
${incident.status}` },
          { type: "mrkdwn", text: `*Severity:*
${incident.severity}` }
        ] },
        ...updateText ? [{ type: "section", text: { type: "mrkdwn", text: updateText } }] : []
      ]
    }]
  };
}
async function sendSlack(webhookUrl, message) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1e4);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`[slack] Webhook returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[slack] Failed to send:", err);
    return false;
  }
}

// src/notifications/templates.ts
function wrap(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px}
.header{background:#1a1a2e;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0}
.content{background:#f8f9fa;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px}
.badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff}
.badge-red{background:#e74c3c}.badge-green{background:#27ae60}.badge-yellow{background:#f39c12}.badge-blue{background:#3498db}
.footer{margin-top:24px;font-size:12px;color:#999;text-align:center}
</style></head><body>
<div class="header"><h2 style="margin:0">${title}</h2></div>
<div class="content">${body}</div>
<div class="footer">Sent by Status Page Monitor</div>
</body></html>`;
}
function monitorDownAlert(monitor, error, timestamp) {
  const subject = `\u{1F534} Monitor Down: ${monitor.name}`;
  const html = wrap("Monitor Down", `
    <p><span class="badge badge-red">DOWN</span></p>
    <p><strong>${monitor.name}</strong> is not responding.</p>
    ${monitor.url ? `<p>URL: <code>${monitor.url}</code></p>` : ""}
    <p>Error: ${error}</p>
    <p>Time: ${timestamp}</p>
  `);
  const text = `Monitor Down: ${monitor.name}
${monitor.url || ""}
Error: ${error}
Time: ${timestamp}`;
  return { subject, html, text };
}
function monitorRecoveryAlert(monitor, downtimeDuration) {
  const subject = `\u2705 Monitor Recovered: ${monitor.name}`;
  const html = wrap("Monitor Recovered", `
    <p><span class="badge badge-green">UP</span></p>
    <p><strong>${monitor.name}</strong> is back online.</p>
    ${monitor.url ? `<p>URL: <code>${monitor.url}</code></p>` : ""}
    <p>Downtime: ${downtimeDuration}</p>
  `);
  const text = `Monitor Recovered: ${monitor.name}
${monitor.url || ""}
Downtime: ${downtimeDuration}`;
  return { subject, html, text };
}
function incidentCreated(incident, components, initialUpdate) {
  const subject = `\u26A0\uFE0F Incident: ${incident.title}`;
  const badgeClass = incident.severity === "CRITICAL" ? "badge-red" : incident.severity === "MAJOR" ? "badge-yellow" : "badge-blue";
  const html = wrap("New Incident", `
    <p><span class="badge ${badgeClass}">${incident.severity}</span></p>
    <h3>${incident.title}</h3>
    ${components.length ? `<p>Affected: ${components.join(", ")}</p>` : ""}
    <p>${initialUpdate}</p>
  `);
  const text = `Incident: ${incident.title}
Severity: ${incident.severity}
Affected: ${components.join(", ")}
${initialUpdate}`;
  return { subject, html, text };
}
function incidentUpdated(incident, updateText) {
  const subject = `\u{1F4CB} Incident Update: ${incident.title}`;
  const html = wrap("Incident Update", `
    <p><strong>Status:</strong> ${incident.status}</p>
    <h3>${incident.title}</h3>
    <p>${updateText}</p>
  `);
  const text = `Incident Update: ${incident.title}
Status: ${incident.status}
${updateText}`;
  return { subject, html, text };
}

// src/notifications/dispatcher.ts
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function dispatchToChannel(channel, event) {
  const { type, data } = event;
  switch (channel.type) {
    case "EMAIL": {
      const emailAddr = channel.config.email;
      if (!emailAddr) return false;
      let tpl;
      if (type === "monitor.down") {
        tpl = monitorDownAlert(data.monitor, data.check?.message || "Unknown error", (/* @__PURE__ */ new Date()).toISOString());
      } else if (type === "monitor.recovery") {
        tpl = monitorRecoveryAlert(data.monitor, data.alert?.duration || "unknown");
      } else if (type === "incident.created") {
        tpl = incidentCreated(data.incident, [], data.update?.message || "");
      } else {
        tpl = incidentUpdated(data.incident, data.update?.message || "");
      }
      return sendEmail({ to: emailAddr, ...tpl });
    }
    case "WEBHOOK": {
      const url = channel.config.url;
      const secret = channel.config.secret;
      if (!url) return false;
      const payload = { event: type, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      return sendWebhook(url, payload, secret);
    }
    case "SLACK": {
      const webhookUrl = channel.config.webhookUrl;
      if (!webhookUrl) return false;
      const msg = type.startsWith("monitor.") ? formatMonitorAlert(data.monitor, type === "monitor.down", data.check?.message || "") : formatIncidentUpdate(data.incident, data.update?.message);
      return sendSlack(webhookUrl, msg);
    }
    default:
      console.warn(`[dispatcher] Unknown channel type: ${channel.type}`);
      return false;
  }
}
async function dispatchNotification(orgId, event) {
  try {
    const channels = await prisma_default.notificationChannel.findMany({
      where: { orgId, enabled: true }
    });
    const results = await Promise.allSettled(
      channels.map(async (ch) => {
        const ok = await dispatchToChannel(ch, event);
        if (!ok) {
          await delay(5e3);
          return dispatchToChannel(ch, event);
        }
        return true;
      })
    );
    const failed = results.filter((r) => r.status === "rejected" || r.status === "fulfilled" && !r.value);
    if (failed.length) {
      console.warn(`[dispatcher] ${failed.length}/${channels.length} channel(s) failed for ${event.type}`);
    }
    if (event.type === "incident.created" || event.type === "incident.updated") {
      const subscribers = await prisma_default.subscriber.findMany({
        where: { orgId, confirmed: true, type: "EMAIL" }
      });
      let tpl;
      if (event.type === "incident.created") {
        tpl = incidentCreated(event.data.incident, [], event.data.update?.message || "");
      } else {
        tpl = incidentUpdated(event.data.incident, event.data.update?.message || "");
      }
      await Promise.allSettled(
        subscribers.map(async (sub) => {
          if (!sub.email) return;
          const ok = await sendEmail({ to: sub.email, ...tpl });
          if (!ok) {
            await delay(5e3);
            await sendEmail({ to: sub.email, ...tpl });
          }
        })
      );
    }
  } catch (err) {
    console.error("[dispatcher] Unexpected error:", err);
  }
}

// src/notifications/hooks.ts
async function onIncidentChange(orgId, incident, update6) {
  sseManager.broadcastAll(orgId, {
    type: "incident.updated",
    data: { incident, update: update6 }
  });
  await dispatchNotification(orgId, {
    type: update6 ? "incident.updated" : "incident.created",
    data: { incident, update: update6 }
  });
}

// src/services/incidentService.ts
var NotFoundError4 = class extends Error {
  statusCode = 404;
  code = "RESOURCE_NOT_FOUND";
};
var VALID_INCIDENT_STATUSES = ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];
function validatePagination3(page, limit) {
  let p = page || 1;
  let l = limit || 20;
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 1;
  if (l > 100) l = 100;
  return { page: p, limit: l };
}
async function list4(orgId, filters = {}) {
  const { page, limit } = validatePagination3(filters.page, filters.limit);
  const where = { orgId };
  if (filters.status) {
    if (!VALID_INCIDENT_STATUSES.includes(filters.status)) {
      throw Object.assign(new Error(`Invalid status filter. Must be one of: ${VALID_INCIDENT_STATUSES.join(", ")}`), { statusCode: 400, code: "INVALID_FILTER" });
    }
    where.status = filters.status;
  }
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
  const resolvedAt = incidentData.status === "RESOLVED" ? /* @__PURE__ */ new Date() : void 0;
  const incident = await prisma_default.incident.create({
    data: {
      ...incidentData,
      orgId,
      ...resolvedAt ? { resolvedAt } : {},
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
  if (componentIds?.length) {
    const status = componentStatus || "MAJOR_OUTAGE";
    await prisma_default.component.updateMany({
      where: { id: { in: componentIds } },
      data: { status }
    });
  }
  onIncidentChange(orgId, incident).catch(() => {
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
  const resolvedAt = data.status === "RESOLVED" ? /* @__PURE__ */ new Date() : null;
  const [incidentUpdate] = await prisma_default.$transaction([
    prisma_default.incidentUpdate.create({ data: { incidentId, status: data.status, message: data.message } }),
    prisma_default.incident.update({ where: { id: incidentId }, data: { status: data.status, resolvedAt } })
  ]);
  if (data.status === "RESOLVED") {
    const incidentComponents = await prisma_default.incidentComponent.findMany({
      where: { incidentId },
      select: { componentId: true }
    });
    if (incidentComponents.length > 0) {
      await prisma_default.component.updateMany({
        where: { id: { in: incidentComponents.map((ic) => ic.componentId) } },
        data: { status: "OPERATIONAL" }
      });
    }
  }
  onIncidentChange(orgId, { id: incidentId, status: data.status }, incidentUpdate).catch(() => {
  });
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
router5.get("/", validatePagination2, asyncHandler4(async (req, res) => {
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
router5.post("/", requireMinRole("EDITOR"), validate(CreateIncidentSchema), asyncHandler4(async (req, res) => {
  const result = await create4(req.body, req.user.orgId);
  res.status(201).json(result);
}));
router5.patch("/:id", validate(UpdateIncidentSchema), asyncHandler4(async (req, res) => {
  const result = await update4(req.params.id, req.body, req.user.orgId);
  res.json(result);
}));
router5.delete("/:id", requireMinRole("ADMIN"), asyncHandler4(async (req, res) => {
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
function validatePagination4(page, limit) {
  let p = page || 1;
  let l = limit || 20;
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 1;
  if (l > 100) l = 100;
  return { page: p, limit: l };
}
async function list5(orgId, pagination = {}) {
  const { page, limit } = validatePagination4(pagination.page, pagination.limit);
  const [subscribers, total] = await Promise.all([
    prisma_default.subscriber.findMany({
      where: { orgId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, confirmed: true, orgId: true, createdAt: true, updatedAt: true }
    }),
    prisma_default.subscriber.count({ where: { orgId } })
  ]);
  return { data: subscribers, meta: { total, page, limit } };
}
async function subscribe(email, orgId, type = "EMAIL") {
  const existing = await prisma_default.subscriber.findFirst({ where: { email, orgId } });
  if (existing) return { data: { id: existing.id, email: existing.email, confirmed: existing.confirmed, message: "Already subscribed" } };
  const subscriber = await prisma_default.subscriber.create({ data: { email, orgId, type } });
  return { data: { id: subscriber.id, email: subscriber.email, confirmed: subscriber.confirmed, message: "Confirmation email sent" } };
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
  type: import_zod6.z.enum(["EMAIL", "WEBHOOK", "SLACK"]).optional().default("EMAIL"),
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
  const result = await subscribe(req.body.email, org.id, req.body.type);
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
router6.get("/", authenticate, validatePagination2, asyncHandler5(async (req, res) => {
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
var SlackConfigSchema = import_zod7.z.object({
  webhookUrl: import_zod7.z.string().url().refine((url) => url.startsWith("https://"), { message: "Webhook URL must use HTTPS" })
});
var WebhookConfigSchema = import_zod7.z.object({
  url: import_zod7.z.string().url().refine((url) => url.startsWith("https://") || url.startsWith("http://"), { message: "URL must use HTTP or HTTPS" }).refine((url) => !url.startsWith("javascript:"), { message: "Invalid URL scheme" })
});
var EmailConfigSchema = import_zod7.z.object({
  addresses: import_zod7.z.array(import_zod7.z.string().email()).min(1, "At least one email address is required")
});
var SmsConfigSchema = import_zod7.z.object({
  phoneNumbers: import_zod7.z.array(import_zod7.z.string().min(1)).min(1, "At least one phone number is required")
});
var CreateNotificationChannelSchema = import_zod7.z.object({
  name: import_zod7.z.string().min(1).max(255),
  type: import_zod7.z.enum(["EMAIL", "SLACK", "WEBHOOK", "SMS"]),
  config: import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()),
  enabled: import_zod7.z.boolean().optional()
}).superRefine((data, ctx) => {
  let result;
  switch (data.type) {
    case "SLACK":
      result = SlackConfigSchema.safeParse(data.config);
      break;
    case "WEBHOOK":
      result = WebhookConfigSchema.safeParse(data.config);
      break;
    case "EMAIL":
      result = EmailConfigSchema.safeParse(data.config);
      break;
    case "SMS":
      result = SmsConfigSchema.safeParse(data.config);
      break;
  }
  if (result && !result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: import_zod7.z.ZodIssueCode.custom,
        path: ["config", ...issue.path],
        message: issue.message
      });
    }
  }
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
  expiresAt: import_zod8.z.string().datetime().optional().refine(
    (val) => {
      if (!val) return true;
      return new Date(val) > /* @__PURE__ */ new Date();
    },
    { message: "Expiration date must be in the future" }
  )
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
    prisma_default.component.findMany({ where: { orgId: org.id, showOnStatusPage: true }, orderBy: { order: "asc" }, include: { group: true } }),
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
  const components = await prisma_default.component.findMany({ where: { orgId: org.id, showOnStatusPage: true }, orderBy: { order: "asc" } });
  const since = new Date(Date.now() - days * 864e5);
  const uptimeData = await Promise.all(
    components.map(async (component) => {
      const monitors = await prisma_default.monitor.findMany({ where: { componentId: component.id } });
      if (monitors.length === 0) return { componentId: component.id, name: component.name, uptime: null, noData: true };
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
  customCss: import_zod9.z.string().max(5e4, "Custom CSS must be under 50KB").optional().nullable(),
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
  let days = req.query.days ? Number(req.query.days) : 90;
  if (isNaN(days) || days < 1) days = 1;
  if (days > 365) days = 365;
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
  if (err?.constructor?.name === "PrismaClientKnownRequestError" || err?.code?.startsWith?.("P")) {
    if (err.code === "P2003") {
      res.status(422).json({ error: "Referenced resource not found" });
      return;
    }
    if (err.code === "P2002") {
      const target = err.meta?.target;
      res.status(409).json({ error: `Unique constraint violation${target ? ` on ${target}` : ""}` });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
  }
  if (err?.constructor?.name === "PrismaClientValidationError") {
    res.status(400).json({ error: "Invalid request data" });
    return;
  }
  res.status(500).json({
    error: "Internal server error",
    ...process.env.NODE_ENV === "development" ? { message: err.message } : {}
  });
}

// src/middleware/sanitize.ts
var import_xss = __toESM(require("xss"));
function sanitizeValue(value) {
  if (typeof value === "string") {
    return (0, import_xss.default)(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
}
function sanitizeObject(obj) {
  const result = {};
  for (const [key2, val] of Object.entries(obj)) {
    result[key2] = sanitizeValue(val);
  }
  return result;
}
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// src/index.ts
init_prisma();
var app = (0, import_express13.default)();
var PORT = parseInt(process.env.PORT || "3030", 10);
var allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()) : [];
app.use((0, import_cors.default)({
  origin: allowedOrigins.length > 0 ? allowedOrigins : void 0,
  credentials: true
}));
app.use(import_express13.default.json({ limit: "1mb" }));
app.use(sanitizeBody);
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
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});
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
//# sourceMappingURL=index.js.map