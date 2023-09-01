"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var diner_utilities_1 = require("diner-utilities");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.default = new diner_utilities_1.Database(process.env.SUPABASE_URL, process.env.SUPABASE_KEY).client;
