"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesWorkerController = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-helpers/lib");
//#endregion
let ProcessesWorkerController = class ProcessesWorkerController extends lib_2.TaonBaseCliWorkerController {
};
exports.ProcessesWorkerController = ProcessesWorkerController;
exports.ProcessesWorkerController = ProcessesWorkerController = __decorate([
    (0, lib_1.TaonController)({
        className: 'ProcessesWorkerController',
    })
], ProcessesWorkerController);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.worker.controller.js.map