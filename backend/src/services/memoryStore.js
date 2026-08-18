const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const parseCSV = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i];
    const values = [];
    let insideQuotes = false;
    let entry = '';
    for (let char of currentline) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    values.push(entry.trim());
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        let val = values[index].replace(/^"|"$/g, '');
        obj[header] = val;
      });
      results.push(obj);
    }
  }
  return results;
};

const store = {
  users: [],
  workers: [],
  products: [],
  locations: [],
  orders: [],
  orderItems: [],
  tasks: [],
  exceptions: [],
  restockRequests: [],
  activityLogs: [],
};

let isInitialized = false;

const initMemoryStore = async () => {
  if (isInitialized) return;
  const seedDir = path.join(__dirname, '../../../seed-data');
  const adminHash = await bcrypt.hash('admin123', 10);
  const workerHash = await bcrypt.hash('worker123', 10);

  // Users
  const usersCsv = parseCSV(path.join(seedDir, 'users.csv'));
  store.users = usersCsv.map((u, idx) => ({
    _id: `user_${idx + 1}`,
    name: u.name,
    email: u.email.toLowerCase(),
    passwordHash: adminHash,
    role: u.role,
    createdAt: new Date(),
  }));

  // Workers
  const workersCsv = parseCSV(path.join(seedDir, 'workers.csv'));
  store.workers = workersCsv.map((w, idx) => ({
    _id: `worker_${idx + 1}`,
    name: w.name,
    email: w.email.toLowerCase(),
    passwordHash: workerHash,
    role: w.role,
    status: w.status || 'IDLE',
    activeTaskId: null,
    completedTasksCount: parseInt(w.completedTasksCount) || 0,
  }));

  // Products
  const productsCsv = parseCSV(path.join(seedDir, 'products.csv'));
  store.products = productsCsv.map((p, idx) => ({
    _id: `prod_${idx + 1}`,
    sku: p.sku,
    name: p.name,
    category: p.category || 'General',
    quantityInStock: parseInt(p.quantityInStock) || 0,
    quantityReserved: parseInt(p.quantityReserved) || 0,
    quantityDamaged: parseInt(p.quantityDamaged) || 0,
    reorderThreshold: parseInt(p.reorderThreshold) || 10,
    minStockLevel: parseInt(p.minStockLevel) || 5,
    location: { zone: p.zone || 'Zone A', rack: p.rack || 'Rack 01', bin: p.bin || 'Bin 01' },
  }));

  const prodMapBySku = {};
  store.products.forEach((p) => (prodMapBySku[p.sku] = p));

  // Locations
  const locCsv = parseCSV(path.join(seedDir, 'warehouse_locations.csv'));
  store.locations = locCsv.map((l, idx) => ({
    _id: `loc_${idx + 1}`,
    zone: l.zone,
    rack: l.rack,
    bin: l.bin,
    capacity: parseInt(l.capacity) || 100,
    currentOccupancy: parseInt(l.currentOccupancy) || 0,
    status: l.status || 'ACTIVE',
  }));

  // Orders
  const ordersCsv = parseCSV(path.join(seedDir, 'orders.csv'));
  const baseDate = new Date();
  const subHours = (h) => new Date(baseDate.getTime() - h * 3600000);

  store.orders = ordersCsv.map((o, idx) => {
    let traceability = {};
    if (['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(o.status)) {
      traceability.picker = { workerId: 'worker_1', name: 'Suresh Reddy', timestamp: subHours(4) };
    }
    if (['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(o.status)) {
      traceability.packer = { workerId: 'worker_3', name: 'Priya Naidu', timestamp: subHours(3) };
    }
    if (['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(o.status)) {
      traceability.qc = { workerId: 'worker_5', name: 'Meena Devi', timestamp: subHours(2), status: 'QC_PASSED' };
    }
    if (['DISPATCHED'].includes(o.status)) {
      traceability.dispatcher = { workerId: 'worker_6', name: 'Arjun Singh', timestamp: subHours(1) };
    }

    return {
      _id: `ord_${idx + 1}`,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      destinationCity: o.destinationCity,
      estimatedTransitDays: parseInt(o.estimatedTransitDays) || 1,
      deliveryDeadline: new Date(o.deliveryDeadline),
      priority: o.priority || 'NORMAL',
      priorityScore: parseInt(o.priorityScore) || 50,
      warehouseName: 'Central Fulfillment Hub - Zone A',
      status: o.status || 'CREATED',
      shortageDetails: { isShortage: false, missingSku: '', quantityNeeded: 0 },
      stageTimestamps: {
        pickedAt: traceability.picker ? traceability.picker.timestamp : null,
        packedAt: traceability.packer ? traceability.packer.timestamp : null,
        qcPassedAt: traceability.qc ? traceability.qc.timestamp : null,
        dispatchedAt: traceability.dispatcher ? traceability.dispatcher.timestamp : null,
      },
      traceability,
      createdAt: subHours(6),
    };
  });

  const ordMapByNumber = {};
  store.orders.forEach((o) => (ordMapByNumber[o.orderNumber] = o));

  // Order Items
  const itemsCsv = parseCSV(path.join(seedDir, 'order_items.csv'));
  store.orderItems = itemsCsv.map((i, idx) => {
    const o = ordMapByNumber[i.orderNumber];
    const p = prodMapBySku[i.sku];
    return {
      _id: `item_${idx + 1}`,
      orderId: o ? o._id : null,
      productId: p ? p._id : null,
      productObj: p,
      requestedQuantity: parseInt(i.requestedQuantity) || 1,
      allocatedQuantity: parseInt(i.allocatedQuantity) || 0,
      status: i.status || 'PENDING',
    };
  });

  // Tasks
  const tasksCsv = parseCSV(path.join(seedDir, 'tasks.csv'));
  const workerMapByEmail = {};
  store.workers.forEach((w) => (workerMapByEmail[w.email.toLowerCase()] = w));

  store.tasks = tasksCsv.map((t, idx) => {
    const o = ordMapByNumber[t.orderNumber];
    const w = t.assignedWorkerEmail ? workerMapByEmail[t.assignedWorkerEmail.toLowerCase()] : null;

    const taskObj = {
      _id: `task_${idx + 1}`,
      taskNumber: t.taskNumber,
      orderId: o ? o._id : null,
      orderObj: o,
      stage: t.stage,
      assignedWorkerId: w ? w._id : null,
      assignedWorkerObj: w,
      status: t.status || 'PENDING',
      priority: t.priority || 'NORMAL',
      priorityScore: o ? o.priorityScore : 50,
      locationInfo: { zone: t.zone || 'Zone A', rack: t.rack || 'Rack 01', bin: t.bin || 'Bin 01' },
      startedAt: t.status === 'IN_PROGRESS' ? new Date() : null,
    };

    if (w && t.status === 'IN_PROGRESS') {
      w.status = 'BUSY';
      w.activeTaskId = taskObj._id;
    }
    return taskObj;
  });

  // Exceptions
  const expCsv = parseCSV(path.join(seedDir, 'exceptions.csv'));
  const taskMapByNumber = {};
  store.tasks.forEach((t) => (taskMapByNumber[t.taskNumber] = t));

  store.exceptions = expCsv.map((e, idx) => {
    const o = ordMapByNumber[e.orderNumber];
    const t = taskMapByNumber[e.taskNumber];
    const w = e.reportedByWorkerEmail ? workerMapByEmail[e.reportedByWorkerEmail.toLowerCase()] : null;
    return {
      _id: `exp_${idx + 1}`,
      exceptionNumber: e.exceptionNumber,
      orderId: o ? o._id : null,
      orderObj: o,
      taskId: t ? t._id : null,
      taskObj: t,
      reportedByWorkerId: w ? w._id : null,
      reportedByWorkerObj: w,
      type: e.type,
      description: e.description,
      status: e.status || 'OPEN',
      resolutionNotes: e.resolutionNotes || '',
      createdAt: new Date(),
    };
  });

  // Restock Requests
  const restockCsv = parseCSV(path.join(seedDir, 'restock_requests.csv'));
  store.restockRequests = restockCsv.map((r, idx) => {
    const p = prodMapBySku[r.sku];
    return {
      _id: `rst_${idx + 1}`,
      requestNumber: r.requestNumber,
      productId: p ? p._id : null,
      productObj: p,
      requestedQuantity: parseInt(r.requestedQuantity) || 10,
      status: r.status || 'REQUESTED',
      requestedByUserId: store.users[0]._id,
      createdAt: new Date(),
    };
  });

  // Activity Logs
  const actCsv = parseCSV(path.join(seedDir, 'activity_history.csv'));
  store.activityLogs = actCsv.map((a, idx) => {
    const o = ordMapByNumber[a.orderNumber];
    return {
      _id: `act_${idx + 1}`,
      orderId: o ? o._id : null,
      action: a.action,
      performedBy: { name: a.performedByName || 'System', role: a.performedByRole || 'SYSTEM' },
      details: a.details || '',
      timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
    };
  });

  isInitialized = true;
  console.log('MemoryStore initialized with CSV data for offline fallback!');
};

module.exports = { store, initMemoryStore };
