const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Worker = require('../models/Worker');
const Product = require('../models/Product');
const WarehouseLocation = require('../models/WarehouseLocation');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Task = require('../models/Task');
const Exception = require('../models/Exception');
const RestockRequest = require('../models/RestockRequest');
const ActivityLog = require('../models/ActivityLog');

const { calculatePriorityScore } = require('../services/priorityEngine');
const { triggerTaskAssignment } = require('../services/taskAssignmentEngine');

// Helper CSV parser function (zero-dependency or csv-parser fallback)
const parseCSV = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle simple CSV splitting while respecting quoted strings
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

const seed = async () => {
  try {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_warehouse';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    
    // Connect with a quick 4s timeout
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log('Database connected for seeding...');
  } catch (err) {
    console.warn(`[Seeder] Could not connect to MongoDB instance (${err.message}).`);
    console.warn(`[Seeder] Please set MONGODB_URI in backend/.env to your MongoDB Atlas connection string when deploying.`);
    console.log('Validating CSV Data Parsing locally:');
    
    const seedDir = path.join(__dirname, '../../../seed-data');
    console.log(`- products.csv: ${parseCSV(path.join(seedDir, 'products.csv')).length} rows parsed.`);
    console.log(`- orders.csv: ${parseCSV(path.join(seedDir, 'orders.csv')).length} rows parsed.`);
    console.log(`- order_items.csv: ${parseCSV(path.join(seedDir, 'order_items.csv')).length} rows parsed.`);
    console.log(`- workers.csv: ${parseCSV(path.join(seedDir, 'workers.csv')).length} rows parsed.`);
    console.log(`- tasks.csv: ${parseCSV(path.join(seedDir, 'tasks.csv')).length} rows parsed.`);
    console.log(`- exceptions.csv: ${parseCSV(path.join(seedDir, 'exceptions.csv')).length} rows parsed.`);
    console.log(`- restock_requests.csv: ${parseCSV(path.join(seedDir, 'restock_requests.csv')).length} rows parsed.`);
    console.log(`- warehouse_locations.csv: ${parseCSV(path.join(seedDir, 'warehouse_locations.csv')).length} rows parsed.`);
    console.log(`- activity_history.csv: ${parseCSV(path.join(seedDir, 'activity_history.csv')).length} rows parsed.`);
    process.exit(0);
  }

    // Clear existing collections
    await User.deleteMany({});
    await Worker.deleteMany({});
    await Product.deleteMany({});
    await WarehouseLocation.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Task.deleteMany({});
    await Exception.deleteMany({});
    await RestockRequest.deleteMany({});
    await ActivityLog.deleteMany({});

    const seedDir = path.join(__dirname, '../../../seed-data');

    // 1. Seed Users
    const usersData = parseCSV(path.join(seedDir, 'users.csv'));
    const userDocs = [];
    const passwordHash = await bcrypt.hash('admin123', 10);
    for (const u of usersData) {
      userDocs.push({
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash,
        role: u.role,
      });
    }
    const createdUsers = await User.insertMany(userDocs);
    console.log(`Seeded ${createdUsers.length} Management Users.`);

    // 2. Seed Workers
    const workersData = parseCSV(path.join(seedDir, 'workers.csv'));
    const workerDocs = [];
    const workerPasswordHash = await bcrypt.hash('worker123', 10);
    for (const w of workersData) {
      workerDocs.push({
        name: w.name,
        email: w.email.toLowerCase(),
        passwordHash: workerPasswordHash,
        role: w.role,
        status: w.status || 'IDLE',
        completedTasksCount: parseInt(w.completedTasksCount) || 0,
      });
    }
    const createdWorkers = await Worker.insertMany(workerDocs);
    console.log(`Seeded ${createdWorkers.length} Workers.`);

    // 3. Seed Warehouse Locations
    const locsData = parseCSV(path.join(seedDir, 'warehouse_locations.csv'));
    const locDocs = locsData.map((l) => ({
      zone: l.zone,
      rack: l.rack,
      bin: l.bin,
      capacity: parseInt(l.capacity) || 100,
      currentOccupancy: parseInt(l.currentOccupancy) || 0,
      status: l.status || 'ACTIVE',
    }));
    await WarehouseLocation.insertMany(locDocs);
    console.log(`Seeded ${locDocs.length} Warehouse Locations.`);

    // 4. Seed Products
    const productsData = parseCSV(path.join(seedDir, 'products.csv'));
    const productDocs = productsData.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category || 'General',
      quantityInStock: parseInt(p.quantityInStock) || 0,
      quantityReserved: parseInt(p.quantityReserved) || 0,
      quantityDamaged: parseInt(p.quantityDamaged) || 0,
      reorderThreshold: parseInt(p.reorderThreshold) || 10,
      minStockLevel: parseInt(p.minStockLevel) || 5,
      location: {
        zone: p.zone || 'Zone A',
        rack: p.rack || 'Rack 01',
        bin: p.bin || 'Bin 01',
      },
    }));
    const createdProducts = await Product.insertMany(productDocs);
    console.log(`Seeded ${createdProducts.length} Products.`);

    const productMapBySku = {};
    createdProducts.forEach((p) => (productMapBySku[p.sku] = p));

    // 5. Seed Orders
    const ordersData = parseCSV(path.join(seedDir, 'orders.csv'));
    const orderDocs = [];
    for (const o of ordersData) {
      const transitDays = parseInt(o.estimatedTransitDays) || 1;
      const calc = calculatePriorityScore(o.deliveryDeadline, transitDays);

      orderDocs.push({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        destinationCity: o.destinationCity,
        estimatedTransitDays: transitDays,
        deliveryDeadline: new Date(o.deliveryDeadline),
        priority: o.priority || calc.priority,
        priorityScore: parseInt(o.priorityScore) || calc.priorityScore,
        status: o.status || 'CREATED',
      });
    }
    const createdOrders = await Order.insertMany(orderDocs);
    console.log(`Seeded ${createdOrders.length} Orders.`);

    const orderMapByNumber = {};
    createdOrders.forEach((o) => (orderMapByNumber[o.orderNumber] = o));

    // 6. Seed Order Items
    const itemsData = parseCSV(path.join(seedDir, 'order_items.csv'));
    const itemDocs = [];
    for (const item of itemsData) {
      const orderObj = orderMapByNumber[item.orderNumber];
      const prodObj = productMapBySku[item.sku];

      if (orderObj && prodObj) {
        itemDocs.push({
          orderId: orderObj._id,
          productId: prodObj._id,
          requestedQuantity: parseInt(item.requestedQuantity) || 1,
          allocatedQuantity: parseInt(item.allocatedQuantity) || 0,
          status: item.status || 'PENDING',
        });
      }
    }
    await OrderItem.insertMany(itemDocs);
    console.log(`Seeded ${itemDocs.length} Order Items.`);

    // 7. Seed Worker Map for Tasks
    const workerMapByEmail = {};
    createdWorkers.forEach((w) => (workerMapByEmail[w.email.toLowerCase()] = w));

    // 8. Seed Tasks
    const tasksData = parseCSV(path.join(seedDir, 'tasks.csv'));
    const taskDocs = [];
    for (const t of tasksData) {
      const orderObj = orderMapByNumber[t.orderNumber];
      const assignedWorker = t.assignedWorkerEmail ? workerMapByEmail[t.assignedWorkerEmail.toLowerCase()] : null;

      if (orderObj) {
        taskDocs.push({
          taskNumber: t.taskNumber,
          orderId: orderObj._id,
          stage: t.stage,
          assignedWorkerId: assignedWorker ? assignedWorker._id : null,
          status: t.status || 'PENDING',
          priority: t.priority || orderObj.priority,
          priorityScore: orderObj.priorityScore,
          locationInfo: {
            zone: t.zone || 'Zone A',
            rack: t.rack || 'Rack 01',
            bin: t.bin || 'Bin 01',
          },
        });
      }
    }
    const createdTasks = await Task.insertMany(taskDocs);
    console.log(`Seeded ${createdTasks.length} Tasks.`);

    const taskMapByNumber = {};
    createdTasks.forEach((t) => (taskMapByNumber[t.taskNumber] = t));

    // 9. Seed Exceptions
    const exceptionsData = parseCSV(path.join(seedDir, 'exceptions.csv'));
    const exceptionDocs = [];
    for (const e of exceptionsData) {
      const orderObj = orderMapByNumber[e.orderNumber];
      const taskObj = taskMapByNumber[e.taskNumber];
      const workerObj = e.reportedByWorkerEmail ? workerMapByEmail[e.reportedByWorkerEmail.toLowerCase()] : null;

      if (orderObj) {
        exceptionDocs.push({
          exceptionNumber: e.exceptionNumber,
          orderId: orderObj._id,
          taskId: taskObj ? taskObj._id : null,
          reportedByWorkerId: workerObj ? workerObj._id : null,
          type: e.type,
          description: e.description,
          status: e.status || 'OPEN',
          resolutionNotes: e.resolutionNotes || '',
        });
      }
    }
    await Exception.insertMany(exceptionDocs);
    console.log(`Seeded ${exceptionDocs.length} Exceptions.`);

    // 10. Seed Restock Requests
    const userMapByEmail = {};
    createdUsers.forEach((u) => (userMapByEmail[u.email.toLowerCase()] = u));

    const restockData = parseCSV(path.join(seedDir, 'restock_requests.csv'));
    const restockDocs = [];
    for (const r of restockData) {
      const prodObj = productMapBySku[r.sku];
      const reqUser = userMapByEmail[r.requestedByEmail?.toLowerCase()];
      const confUser = r.confirmedByEmail ? userMapByEmail[r.confirmedByEmail.toLowerCase()] : null;

      if (prodObj) {
        restockDocs.push({
          requestNumber: r.requestNumber,
          productId: prodObj._id,
          requestedQuantity: parseInt(r.requestedQuantity) || 10,
          status: r.status || 'REQUESTED',
          requestedByUserId: reqUser ? reqUser._id : createdUsers[0]._id,
          confirmedByAdminId: confUser ? confUser._id : null,
        });
      }
    }
    await RestockRequest.insertMany(restockDocs);
    console.log(`Seeded ${restockDocs.length} Restock Requests.`);

    // 11. Seed Activity History
    const activityData = parseCSV(path.join(seedDir, 'activity_history.csv'));
    const activityDocs = [];
    for (const a of activityData) {
      const orderObj = orderMapByNumber[a.orderNumber];
      activityDocs.push({
        orderId: orderObj ? orderObj._id : null,
        action: a.action,
        performedBy: {
          name: a.performedByName || 'System',
          role: a.performedByRole || 'SYSTEM',
        },
        details: a.details || '',
        timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
      });
    }
    await ActivityLog.insertMany(activityDocs);
    console.log(`Seeded ${activityDocs.length} Activity Logs.`);

    // Trigger Rule Engine for Initial Task Assignments
    await triggerTaskAssignment();
    console.log('Automated Task Assignment Engine executed post-seed.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
