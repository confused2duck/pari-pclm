/* PARI · Mock data — synthetic, matches spec §3 tables. Swap for Laravel API later. */
(function () {
  const org = { id: 'org_1', name: 'Ramchandra Industrial Group', plan: 'Enterprise', region: 'IN' };

  const plants = [
    { id: 'plt_1', name: 'Jamshedpur Steel Works',   code: 'JSW-01', state: 'JH', crane_count: 42 },
    { id: 'plt_2', name: 'Pune Fabrication Plant',   code: 'PFP-02', state: 'MH', crane_count: 18 },
    { id: 'plt_3', name: 'Vizag Port Facility',      code: 'VZG-03', state: 'AP', crane_count: 26 }
  ];
  const currentPlant = plants[0];

  const kpis = {
    pmCompliance: 87, openActions: 34, breakdowns30d: 12,
    downtimeHours: 148, repeatFailures: 4, productionLossINR: 1420000
  };

  const breakdownTrend = [
    { w: 'W-11', v: 6 }, { w: 'W-10', v: 7 }, { w: 'W-9',  v: 5 },
    { w: 'W-8',  v: 9 }, { w: 'W-7',  v: 4 }, { w: 'W-6',  v: 6 },
    { w: 'W-5',  v: 3 }, { w: 'W-4',  v: 5 }, { w: 'W-3',  v: 4 },
    { w: 'W-2',  v: 2 }, { w: 'W-1',  v: 3 }, { w: 'W-0',  v: 2 }
  ];
  const pmTrend = [
    { w: 'W-11', v: 78 }, { w: 'W-10', v: 80 }, { w: 'W-9',  v: 79 },
    { w: 'W-8',  v: 82 }, { w: 'W-7',  v: 81 }, { w: 'W-6',  v: 84 },
    { w: 'W-5',  v: 85 }, { w: 'W-4',  v: 84 }, { w: 'W-3',  v: 86 },
    { w: 'W-2',  v: 87 }, { w: 'W-1',  v: 88 }, { w: 'W-0',  v: 87 }
  ];

  const cranes = [
    { id:'crn_101', asset_number:'JSW-EOT-14', name:'Ladle Handling Crane #14',      crane_type:'EOT',         capacity_t:120, span_m:24.5, lift_m:22, duty_class:'M7', manufacturer:'Kone',        model:'XN500',   status:'operational', score:78, plant_id:'plt_1', pm_compliance:84, open_actions:3,  last_inspection:'2026-09-08', mtbf_h:620  },
    { id:'crn_102', asset_number:'JSW-GLT-07', name:'Slab Yard Goliath #7',          crane_type:'Goliath',     capacity_t:250, span_m:42,   lift_m:18, duty_class:'M6', manufacturer:'Konecranes',  model:'CXT-DG',  status:'operational', score:92, plant_id:'plt_1', pm_compliance:96, open_actions:0,  last_inspection:'2026-09-10', mtbf_h:940  },
    { id:'crn_103', asset_number:'JSW-EOT-22', name:'Coil Transport Crane #22',      crane_type:'EOT',         capacity_t:40,  span_m:18,   lift_m:12, duty_class:'M5', manufacturer:'ElectroMech', model:'EM-CC40', status:'attention',   score:62, plant_id:'plt_1', pm_compliance:68, open_actions:8,  last_inspection:'2026-08-28', mtbf_h:310  },
    { id:'crn_104', asset_number:'JSW-JIB-03', name:'Workshop Jib Crane #3',         crane_type:'Jib',         capacity_t:5,   span_m:4,    lift_m:6,  duty_class:'M4', manufacturer:'ABUS',        model:'VS-B',    status:'operational', score:88, plant_id:'plt_1', pm_compliance:91, open_actions:1,  last_inspection:'2026-09-05', mtbf_h:1200 },
    { id:'crn_105', asset_number:'JSW-SG-11',  name:'Semi-Goliath Yard #11',         crane_type:'Semi-Goliath',capacity_t:60,  span_m:28,   lift_m:14, duty_class:'M6', manufacturer:'Demag',       model:'ZKKE',    status:'operational', score:81, plant_id:'plt_1', pm_compliance:88, open_actions:2,  last_inspection:'2026-09-11', mtbf_h:760  },
    { id:'crn_106', asset_number:'JSW-MR-02',  name:'Foundry Monorail #2',           crane_type:'Monorail',    capacity_t:10,  span_m:60,   lift_m:8,  duty_class:'M5', manufacturer:'Stahl',       model:'ST-Line', status:'attention',   score:54, plant_id:'plt_1', pm_compliance:61, open_actions:6,  last_inspection:'2026-08-15', mtbf_h:240  },
    { id:'crn_107', asset_number:'JSW-EOT-05', name:'Rolling Mill EOT #5',           crane_type:'EOT',         capacity_t:80,  span_m:20,   lift_m:15, duty_class:'M8', manufacturer:'Kone',        model:'XN800',   status:'critical',    score:41, plant_id:'plt_1', pm_compliance:52, open_actions:11, last_inspection:'2026-08-02', mtbf_h:110  },
    { id:'crn_108', asset_number:'JSW-EOT-19', name:'Reheat Furnace Crane #19',      crane_type:'EOT',         capacity_t:100, span_m:22,   lift_m:18, duty_class:'M7', manufacturer:'Konecranes',  model:'CXT-D',   status:'operational', score:85, plant_id:'plt_1', pm_compliance:89, open_actions:2,  last_inspection:'2026-09-09', mtbf_h:820  }
  ];

  const inspections = [
    { id:'insp_9021', crane_id:'crn_103', checklist:'Monthly PM Checklist v3', technician:'Vikram Rao',   scheduled_date:'2026-09-10', completed_date:'2026-09-10', status:'completed', result:'pass_with_findings',
      findings:[
        { item:'Brake lining thickness',  response:'measurement', value:'4.2 mm', severity:'major', comment:'Below 5mm threshold — replace within 7 days.' },
        { item:'Wire rope visual',        response:'fail',        severity:'minor', comment:'Local kink at 3.2m from hook block.' },
        { item:'Limit switch operation',  response:'pass' }
      ]},
    { id:'insp_9018', crane_id:'crn_103', checklist:'Weekly Safety Walk',      technician:'Anjali Kumar', scheduled_date:'2026-09-03', completed_date:'2026-09-03', status:'completed', result:'pass',
      findings:[
        { item:'Emergency stop',              response:'pass' },
        { item:'Load block condition',        response:'pass' },
        { item:'Runway alignment marks',      response:'observation', comment:'Two markers faded — repaint next cycle.' }
      ]},
    { id:'insp_9012', crane_id:'crn_103', checklist:'Quarterly Structural',    technician:'D. Menon (TPI)', scheduled_date:'2026-08-28', completed_date:'2026-08-28', status:'completed', result:'pass_with_findings',
      findings:[
        { item:'End truck wheel wear',   response:'measurement', value:'2.1 mm loss', severity:'minor' },
        { item:'Girder weld inspection', response:'pass' },
        { item:'Bumper condition',       response:'fail', severity:'major', comment:'Rubber bumper degraded — replace.' }
      ]},
    { id:'insp_9026', crane_id:'crn_103', checklist:'Daily Pre-Use',           technician:'Ravi Shankar', scheduled_date:'2026-09-14', completed_date:null, status:'pending',   result:null, findings:[] },
    { id:'insp_9027', crane_id:'crn_103', checklist:'Annual Load Test',        technician:'To be assigned', scheduled_date:'2026-10-05', completed_date:null, status:'scheduled', result:null, findings:[] }
  ];

  const pmTasks = [
    { id:'pm_501', crane_id:'crn_103', title:'Brake system inspection & adjustment',   component:'Hoist / Brake assembly', frequency:'Monthly',   due_date:'2026-09-05', status:'overdue',  tech:'Vikram Rao'      },
    { id:'pm_502', crane_id:'crn_103', title:'Wire rope lubrication & inspection',      component:'Hoist / Wire rope',      frequency:'Weekly',    due_date:'2026-09-15', status:'due',      tech:'Anjali Kumar'    },
    { id:'pm_503', crane_id:'crn_103', title:'End truck wheel gauge check',             component:'Trolley / End truck',    frequency:'Quarterly', due_date:'2026-09-22', status:'upcoming', tech:'D. Menon'        },
    { id:'pm_504', crane_id:'crn_103', title:'Motor thermal imaging',                   component:'Hoist / Main motor',     frequency:'Quarterly', due_date:'2026-09-28', status:'upcoming', tech:'Sanjay Iyer'     },
    { id:'pm_505', crane_id:'crn_103', title:'Statutory annual load test coordination', component:'Crane / Whole unit',     frequency:'Annual',    due_date:'2026-10-05', status:'upcoming', tech:'TPI: Prime Cert' },
    { id:'pm_506', crane_id:'crn_103', title:'Limit switch functional test',            component:'Trolley / Long travel',  frequency:'Monthly',   due_date:'2026-08-22', status:'done',     tech:'Ravi Shankar'    },
    { id:'pm_507', crane_id:'crn_103', title:'Runway rail alignment survey',            component:'Runway',                 frequency:'Bi-annual', due_date:'2026-08-10', status:'done',     tech:'D. Menon'        }
  ];

  const breakdowns = [
    { id:'brk_311', crane_id:'crn_103', datetime_reported:'2026-09-08T14:22:00', symptom:'Hoist brake slipped during load descent', failure_type:'mechanical', component:'Brake coil', downtime_min:220, root_cause:'Brake lining worn beyond threshold', root_cause_method:'5-why', status:'closed' },
    { id:'brk_294', crane_id:'crn_103', datetime_reported:'2026-07-18T09:12:00', symptom:'Hoist brake overheated after continuous cycles', failure_type:'mechanical', component:'Brake coil', downtime_min:90, root_cause:'Brake coil resistance high', root_cause_method:'5-why', status:'closed' },
    { id:'brk_268', crane_id:'crn_103', datetime_reported:'2026-05-22T16:40:00', symptom:'Brake noise reported by operator', failure_type:'mechanical', component:'Brake coil', downtime_min:40, root_cause:'Loose brake pad retainer', root_cause_method:'5-why', status:'closed' }
  ];

  const repeatFlags = [
    { id:'rf_71', component:'Brake coil (crn_103)', failures_120d:3, total_downtime_min:350, est_loss_inr:420000, flagged_at:'2026-09-09', assigned_to:'Reliability Manager' }
  ];

  const activity = [
    { icon:'inspection', title:'Monthly inspection completed',                                     meta:'JSW-EOT-22 · Vikram Rao · 2 hrs ago',                          tone:'ok' },
    { icon:'flag',       title:'Repeat-failure flag raised: Brake coil (JSW-EOT-22)',              meta:'3 failures in 120 days · ₹4.2L est. loss · 4 hrs ago',        tone:'danger' },
    { icon:'pm',         title:'PM task overdue: Brake system inspection',                          meta:'JSW-EOT-22 · 9 days · assigned to Vikram Rao',                tone:'warn' },
    { icon:'cert',       title:'Load test certificate uploaded',                                   meta:'JSW-GLT-07 · valid until 2027-03-10 · 1 day ago',              tone:'ok' },
    { icon:'breakdown',  title:'Breakdown reported: Hoist limit switch',                            meta:'JSW-EOT-19 · 3 hrs downtime · yesterday',                     tone:'danger' },
    { icon:'inspection', title:'Daily walk completed',                                             meta:'JSW-JIB-03 · Anjali Kumar · yesterday',                        tone:'ok' },
    { icon:'user',       title:'Technician assigned to statutory inspection',                       meta:'JSW-EOT-14 · TPI: Prime Cert · 2 days ago',                   tone:'info' }
  ];

  const statutoryAlerts = [
    { crane:'JSW-EOT-14', reg:'Factories Act §29 · Annual Load Test',   due:'2026-09-24', days_left:10,  agency:'Prime Cert TPI' },
    { crane:'JSW-EOT-05', reg:'IS 807 · Structural Recertification',    due:'2026-10-18', days_left:34,  agency:'Prime Cert TPI' },
    { crane:'JSW-GLT-07', reg:'Factories Act §29 · Annual Load Test',   due:'2027-03-10', days_left:177, agency:'Prime Cert TPI' }
  ];

  const fleetInspections = [
    { id:'insp_9101', crane_id:'crn_101', asset:'JSW-EOT-14', checklist:'Monthly PM Checklist v3', technician:'Sanjay Iyer',   scheduled_date:'2026-09-08', completed_date:'2026-09-08', status:'completed', result:'pass',                findings_count:0, severity:'ok' },
    { id:'insp_9021', crane_id:'crn_103', asset:'JSW-EOT-22', checklist:'Monthly PM Checklist v3', technician:'Vikram Rao',    scheduled_date:'2026-09-10', completed_date:'2026-09-10', status:'completed', result:'pass_with_findings',  findings_count:3, severity:'major' },
    { id:'insp_9018', crane_id:'crn_103', asset:'JSW-EOT-22', checklist:'Weekly Safety Walk',      technician:'Anjali Kumar',  scheduled_date:'2026-09-03', completed_date:'2026-09-03', status:'completed', result:'pass',                findings_count:1, severity:'minor' },
    { id:'insp_9012', crane_id:'crn_103', asset:'JSW-EOT-22', checklist:'Quarterly Structural',    technician:'D. Menon (TPI)',scheduled_date:'2026-08-28', completed_date:'2026-08-28', status:'completed', result:'pass_with_findings',  findings_count:2, severity:'major' },
    { id:'insp_9110', crane_id:'crn_107', asset:'JSW-EOT-05', checklist:'Emergency Inspection',    technician:'Ravi Shankar',  scheduled_date:'2026-09-01', completed_date:'2026-09-01', status:'completed', result:'fail',                findings_count:6, severity:'critical' },
    { id:'insp_9026', crane_id:'crn_103', asset:'JSW-EOT-22', checklist:'Daily Pre-Use',           technician:'Ravi Shankar',  scheduled_date:'2026-09-14', completed_date:null,         status:'pending',   result:null,                  findings_count:0, severity:null },
    { id:'insp_9027', crane_id:'crn_103', asset:'JSW-EOT-22', checklist:'Annual Load Test',        technician:'To be assigned',scheduled_date:'2026-10-05', completed_date:null,         status:'scheduled', result:null,                  findings_count:0, severity:null },
    { id:'insp_9112', crane_id:'crn_106', asset:'JSW-MR-02',  checklist:'Monthly PM Checklist v3', technician:'Anjali Kumar',  scheduled_date:'2026-09-18', completed_date:null,         status:'scheduled', result:null,                  findings_count:0, severity:null },
    { id:'insp_9115', crane_id:'crn_102', asset:'JSW-GLT-07', checklist:'Quarterly Structural',    technician:'D. Menon (TPI)',scheduled_date:'2026-09-25', completed_date:null,         status:'scheduled', result:null,                  findings_count:0, severity:null },
    { id:'insp_9118', crane_id:'crn_108', asset:'JSW-EOT-19', checklist:'Weekly Safety Walk',      technician:'Vikram Rao',    scheduled_date:'2026-09-12', completed_date:'2026-09-12', status:'completed', result:'pass_with_findings',  findings_count:1, severity:'minor' },
    { id:'insp_9120', crane_id:'crn_105', asset:'JSW-SG-11',  checklist:'Monthly PM Checklist v3', technician:'Sanjay Iyer',   scheduled_date:'2026-09-11', completed_date:'2026-09-11', status:'completed', result:'pass',                findings_count:0, severity:'ok' },
    { id:'insp_9122', crane_id:'crn_104', asset:'JSW-JIB-03', checklist:'Daily Pre-Use',           technician:'Ravi Shankar',  scheduled_date:'2026-09-13', completed_date:'2026-09-13', status:'completed', result:'pass',                findings_count:0, severity:'ok' },
    { id:'insp_9124', crane_id:'crn_107', asset:'JSW-EOT-05', checklist:'Monthly PM Checklist v3', technician:'Sanjay Iyer',   scheduled_date:'2026-09-15', completed_date:null,         status:'overdue',   result:null,                  findings_count:0, severity:null },
    { id:'insp_9128', crane_id:'crn_101', asset:'JSW-EOT-14', checklist:'Annual Load Test',        technician:'D. Menon (TPI)',scheduled_date:'2026-09-24', completed_date:null,         status:'scheduled', result:null,                  findings_count:0, severity:null }
  ];

  const fleetPmTasks = [
    { id:'pm_601', crane_id:'crn_103', asset:'JSW-EOT-22', title:'Brake system inspection & adjustment',        component:'Hoist / Brake assembly', frequency:'Monthly',   duty_multiplier:1.3, due_date:'2026-09-05', status:'overdue',  tech:'Vikram Rao'      },
    { id:'pm_602', crane_id:'crn_107', asset:'JSW-EOT-05', title:'Girder deflection survey',                    component:'Bridge / Girder',        frequency:'Quarterly', duty_multiplier:1.6, due_date:'2026-09-07', status:'overdue',  tech:'D. Menon (TPI)'  },
    { id:'pm_603', crane_id:'crn_106', asset:'JSW-MR-02',  title:'Runway alignment verification',               component:'Runway rails',           frequency:'Bi-annual', duty_multiplier:1.0, due_date:'2026-09-13', status:'due',      tech:'Anjali Kumar'    },
    { id:'pm_604', crane_id:'crn_103', asset:'JSW-EOT-22', title:'Wire rope lubrication & inspection',          component:'Hoist / Wire rope',      frequency:'Weekly',    duty_multiplier:1.0, due_date:'2026-09-15', status:'due',      tech:'Anjali Kumar'    },
    { id:'pm_605', crane_id:'crn_101', asset:'JSW-EOT-14', title:'Main hoist motor thermal imaging',             component:'Hoist / Main motor',     frequency:'Quarterly', duty_multiplier:1.3, due_date:'2026-09-18', status:'upcoming', tech:'Sanjay Iyer'     },
    { id:'pm_606', crane_id:'crn_108', asset:'JSW-EOT-19', title:'Gearbox oil sample & analysis',                component:'Hoist / Gearbox',        frequency:'Quarterly', duty_multiplier:1.3, due_date:'2026-09-20', status:'upcoming', tech:'Vikram Rao'      },
    { id:'pm_607', crane_id:'crn_103', asset:'JSW-EOT-22', title:'End truck wheel gauge check',                  component:'Trolley / End truck',    frequency:'Quarterly', duty_multiplier:1.0, due_date:'2026-09-22', status:'upcoming', tech:'D. Menon'        },
    { id:'pm_608', crane_id:'crn_105', asset:'JSW-SG-11',  title:'Long travel brake test',                       component:'Long travel',            frequency:'Monthly',   duty_multiplier:1.3, due_date:'2026-09-24', status:'upcoming', tech:'Sanjay Iyer'     },
    { id:'pm_609', crane_id:'crn_102', asset:'JSW-GLT-07', title:'Auxiliary hoist inspection',                   component:'Auxiliary hoist',        frequency:'Monthly',   duty_multiplier:1.3, due_date:'2026-09-26', status:'upcoming', tech:'Vikram Rao'      },
    { id:'pm_610', crane_id:'crn_103', asset:'JSW-EOT-22', title:'Statutory annual load test coordination',      component:'Crane / Whole unit',     frequency:'Annual',    duty_multiplier:1.0, due_date:'2026-10-05', status:'upcoming', tech:'TPI: Prime Cert' },
    { id:'pm_611', crane_id:'crn_104', asset:'JSW-JIB-03', title:'Slew ring lubrication',                        component:'Slew ring',              frequency:'Quarterly', duty_multiplier:1.0, due_date:'2026-10-08', status:'upcoming', tech:'Anjali Kumar'    },
    { id:'pm_612', crane_id:'crn_106', asset:'JSW-MR-02',  title:'Monorail wheel inspection',                    component:'Trolley',                frequency:'Monthly',   duty_multiplier:1.0, due_date:'2026-08-22', status:'done',     tech:'Ravi Shankar'    },
    { id:'pm_613', crane_id:'crn_107', asset:'JSW-EOT-05', title:'Rolling mill EOT limit switch functional test',component:'Trolley / Long travel',  frequency:'Monthly',   duty_multiplier:1.6, due_date:'2026-08-20', status:'done',     tech:'Sanjay Iyer'     },
    { id:'pm_614', crane_id:'crn_103', asset:'JSW-EOT-22', title:'Runway rail alignment survey',                 component:'Runway',                 frequency:'Bi-annual', duty_multiplier:1.0, due_date:'2026-08-10', status:'done',     tech:'D. Menon'        }
  ];

  const fleetBreakdowns = [
    { id:'brk_311', crane_id:'crn_103', asset:'JSW-EOT-22', datetime_reported:'2026-09-08T14:22:00', symptom:'Hoist brake slipped during load descent', failure_type:'mechanical', component:'Brake coil',          downtime_min:220, impact_inr:280000, root_cause:'Brake lining worn beyond threshold', root_cause_method:'5-why',   status:'closed'      },
    { id:'brk_312', crane_id:'crn_107', asset:'JSW-EOT-05', datetime_reported:'2026-09-06T10:11:00', symptom:'Main hoist motor overheated, VFD trip',   failure_type:'electrical', component:'Main motor',          downtime_min:410, impact_inr:640000, root_cause:'Bearing failure (under investigation)', root_cause_method:'fishbone',status:'investigating'},
    { id:'brk_313', crane_id:'crn_106', asset:'JSW-MR-02',  datetime_reported:'2026-09-04T08:44:00', symptom:'Monorail track jam mid-travel',           failure_type:'structural', component:'Trolley wheel',       downtime_min:160, impact_inr:180000, root_cause:'Track alignment drift · under review', root_cause_method:'fault-tree',status:'open'    },
    { id:'brk_294', crane_id:'crn_103', asset:'JSW-EOT-22', datetime_reported:'2026-07-18T09:12:00', symptom:'Hoist brake overheated after continuous cycles', failure_type:'mechanical', component:'Brake coil',     downtime_min:90,  impact_inr:120000, root_cause:'Brake coil resistance high', root_cause_method:'5-why',      status:'closed'      },
    { id:'brk_268', crane_id:'crn_103', asset:'JSW-EOT-22', datetime_reported:'2026-05-22T16:40:00', symptom:'Brake noise reported by operator',        failure_type:'mechanical', component:'Brake coil',          downtime_min:40,  impact_inr:50000,  root_cause:'Loose brake pad retainer', root_cause_method:'5-why',   status:'closed'      },
    { id:'brk_205', crane_id:'crn_108', asset:'JSW-EOT-19', datetime_reported:'2026-09-13T11:30:00', symptom:'Hoist limit switch failure',              failure_type:'electrical', component:'Limit switch',        downtime_min:180, impact_inr:220000, root_cause:'Contact bounce · replaced', root_cause_method:'5-why',   status:'closed'      },
    { id:'brk_182', crane_id:'crn_107', asset:'JSW-EOT-05', datetime_reported:'2026-08-14T13:15:00', symptom:'Girder deflection sensor alarm',          failure_type:'structural', component:'Bridge / Girder',     downtime_min:520, impact_inr:820000, root_cause:'Overload event during coil transfer', root_cause_method:'fault-tree', status:'closed'  },
    { id:'brk_170', crane_id:'crn_106', asset:'JSW-MR-02',  datetime_reported:'2026-07-30T09:05:00', symptom:'Hoist chain skip',                        failure_type:'mechanical', component:'Chain hoist',         downtime_min:75,  impact_inr:95000,  root_cause:'Wear beyond specification', root_cause_method:'5-why',   status:'closed'      }
  ];

  const fleetRepeatFlags = [
    { id:'rf_71', crane_id:'crn_103', asset:'JSW-EOT-22', component:'Brake coil',        failures_120d:3, total_downtime_min:350, est_loss_inr:420000, first_seen:'2026-05-22', flagged_at:'2026-09-09', assigned_to:'Reliability Manager', sla_hrs:48, status:'investigating', criticality:'A',
      timeline:[
        { d:'2026-05-22', evt:'Brake noise · loose retainer',       downtime:40  },
        { d:'2026-07-18', evt:'Brake overheat · coil resistance',   downtime:90  },
        { d:'2026-09-08', evt:'Brake slip · lining wear',           downtime:220 }
      ],
      five_why:[
        { q:'Why did the brake slip on 08-Sep?', a:'Brake lining worn below 5 mm threshold.' },
        { q:'Why did the lining wear so fast?',  a:'Actuation frequency 32% above rated cycles.' },
        { q:'Why is actuation above rated?',      a:'Slab handling pattern changed after mill retooling in Q2.' },
        { q:'Why was the pattern change missed?', a:'PM interval not recalculated after utilization increase.' },
        { q:'Why not recalculated?',              a:'Manual step; not tied to duty-multiplier trigger. FIX: automation.' }
      ]
    },
    { id:'rf_72', crane_id:'crn_107', asset:'JSW-EOT-05', component:'Main motor bearing', failures_120d:2, total_downtime_min:930, est_loss_inr:1460000, first_seen:'2026-08-14', flagged_at:'2026-09-07', assigned_to:'Plant Engineer',       sla_hrs:48, status:'open',          criticality:'A',
      timeline:[
        { d:'2026-08-14', evt:'Girder overload event',            downtime:520 },
        { d:'2026-09-06', evt:'Motor overheat + VFD trip',        downtime:410 }
      ], five_why:[]
    },
    { id:'rf_73', crane_id:'crn_106', asset:'JSW-MR-02',  component:'Track alignment',    failures_120d:2, total_downtime_min:235, est_loss_inr:275000, first_seen:'2026-07-30', flagged_at:'2026-09-05', assigned_to:'Maintenance Supervisor', sla_hrs:72, status:'open',       criticality:'B',
      timeline:[
        { d:'2026-07-30', evt:'Chain hoist skip',                 downtime:75  },
        { d:'2026-09-04', evt:'Track jam mid-travel',             downtime:160 }
      ], five_why:[]
    },
    { id:'rf_74', crane_id:'crn_108', asset:'JSW-EOT-19', component:'Limit switch',       failures_120d:2, total_downtime_min:245, est_loss_inr:290000, first_seen:'2026-06-11', flagged_at:'2026-09-13', assigned_to:'Plant Engineer',       sla_hrs:72, status:'closed',        criticality:'B',
      timeline:[
        { d:'2026-06-11', evt:'Contact intermittent',             downtime:65  },
        { d:'2026-09-13', evt:'Full contact failure',             downtime:180 }
      ], five_why:[]
    }
  ];

  const fleetDocuments = [
    { id:'doc_401', crane_id:'crn_101', asset:'JSW-EOT-14', doc_type:'Load test certificate',  doc_number:'PC-LT-2025-0421', revision:'Rev-04', issue_date:'2025-09-24', expiry_date:'2026-09-24', status:'expiring' },
    { id:'doc_402', crane_id:'crn_102', asset:'JSW-GLT-07', doc_type:'Load test certificate',  doc_number:'PC-LT-2026-0181', revision:'Rev-03', issue_date:'2026-03-10', expiry_date:'2027-03-10', status:'valid'    },
    { id:'doc_403', crane_id:'crn_103', asset:'JSW-EOT-22', doc_type:'Load test certificate',  doc_number:'PC-LT-2025-0522', revision:'Rev-04', issue_date:'2025-10-05', expiry_date:'2026-10-05', status:'expiring' },
    { id:'doc_404', crane_id:'crn_107', asset:'JSW-EOT-05', doc_type:'Structural recert',       doc_number:'PC-SR-2025-0612', revision:'Rev-02', issue_date:'2025-10-18', expiry_date:'2026-10-18', status:'expiring' },
    { id:'doc_405', crane_id:'crn_105', asset:'JSW-SG-11',  doc_type:'Commissioning report',   doc_number:'CR-2019-0044',     revision:'Rev-01', issue_date:'2019-06-14', expiry_date:null,          status:'perpetual'},
    { id:'doc_406', crane_id:'crn_103', asset:'JSW-EOT-22', doc_type:'Wire rope manual',       doc_number:'MAN-EM-0202',      revision:'Rev-02', issue_date:'2023-06-11', expiry_date:null,          status:'perpetual'},
    { id:'doc_407', crane_id:'crn_108', asset:'JSW-EOT-19', doc_type:'Insurance policy',       doc_number:'INS-KN-2025-114',  revision:'Rev-01', issue_date:'2025-04-01', expiry_date:'2026-04-01', status:'expired'  },
    { id:'doc_408', crane_id:'crn_106', asset:'JSW-MR-02',  doc_type:'Load test certificate',  doc_number:'PC-LT-2025-0910', revision:'Rev-04', issue_date:'2025-12-14', expiry_date:'2026-12-14', status:'valid'    },
    { id:'doc_409', crane_id:'crn_104', asset:'JSW-JIB-03', doc_type:'Commissioning report',   doc_number:'CR-2020-0088',     revision:'Rev-01', issue_date:'2020-11-02', expiry_date:null,          status:'perpetual'},
    { id:'doc_410', crane_id:'crn_101', asset:'JSW-EOT-14', doc_type:'Operator training',      doc_number:'TR-2026-014',      revision:'Rev-02', issue_date:'2026-02-18', expiry_date:'2027-02-18', status:'valid'    }
  ];

  const fleetStatutory = [
    { id:'st_501', crane_id:'crn_101', asset:'JSW-EOT-14', jurisdiction_state:'JH', regulation:'Factories Act §29 · Annual Load Test',    reference:'IS 3177 §7.4', tpi_agency:'Prime Cert TPI',   scheduled_date:'2026-09-24', days_left:10,  status:'due'      },
    { id:'st_502', crane_id:'crn_107', asset:'JSW-EOT-05', jurisdiction_state:'JH', regulation:'IS 807 · Structural Recertification',      reference:'IS 807 §12',    tpi_agency:'Prime Cert TPI',   scheduled_date:'2026-10-18', days_left:34,  status:'upcoming' },
    { id:'st_503', crane_id:'crn_103', asset:'JSW-EOT-22', jurisdiction_state:'JH', regulation:'Factories Act §29 · Annual Load Test',    reference:'IS 3177 §7.4', tpi_agency:'Prime Cert TPI',   scheduled_date:'2026-10-05', days_left:21,  status:'due'      },
    { id:'st_504', crane_id:'crn_102', asset:'JSW-GLT-07', jurisdiction_state:'JH', regulation:'Factories Act §29 · Annual Load Test',    reference:'IS 3177 §7.4', tpi_agency:'Prime Cert TPI',   scheduled_date:'2027-03-10', days_left:177, status:'valid'    },
    { id:'st_505', crane_id:'crn_106', asset:'JSW-MR-02',  jurisdiction_state:'JH', regulation:'Safety appliance test',                    reference:'Factories Act §29(1)(b)', tpi_agency:'Prime Cert TPI', scheduled_date:'2026-11-28', days_left:75, status:'upcoming' },
    { id:'st_506', crane_id:'crn_108', asset:'JSW-EOT-19', jurisdiction_state:'JH', regulation:'Insurance renewal · statutory cover',     reference:'IR §Sched-A',   tpi_agency:'—',                scheduled_date:'2026-04-01', days_left:-166, status:'overdue' },
    { id:'st_507', crane_id:'crn_105', asset:'JSW-SG-11',  jurisdiction_state:'JH', regulation:'IS 807 · Structural Recertification',      reference:'IS 807 §12',    tpi_agency:'Prime Cert TPI',   scheduled_date:'2027-04-14', days_left:212, status:'valid'    },
    { id:'st_508', crane_id:'crn_104', asset:'JSW-JIB-03', jurisdiction_state:'JH', regulation:'Bi-annual operator competency',            reference:'Factories §29(4)', tpi_agency:'Prime Cert TPI',scheduled_date:'2026-12-08', days_left:85,  status:'upcoming' }
  ];

  const spares = [
    { id:'sp_701', part_number:'BR-COIL-EM40',   name:'Brake coil · EM-CC40',    manufacturer:'ElectroMech',    uom:'each', min_stock:2, on_hand:0, consumed_30d:3, status:'low',      linked_components:['Brake coil'],        applies_to:['JSW-EOT-22'] },
    { id:'sp_702', part_number:'WR-6X36-16MM',   name:'Wire rope · 6×36 · 16 mm',manufacturer:'Usha Martin',    uom:'meter',min_stock:120,on_hand:180,consumed_30d:48,status:'ok',       linked_components:['Wire rope'],         applies_to:['JSW-EOT-14','JSW-EOT-22','JSW-EOT-19'] },
    { id:'sp_703', part_number:'HK-BLK-40T',     name:'Hook block · 40 t',       manufacturer:'ElectroMech',    uom:'each', min_stock:1, on_hand:1, consumed_30d:0, status:'ok',       linked_components:['Hook block'],        applies_to:['JSW-EOT-22'] },
    { id:'sp_704', part_number:'GRB-XN500-OIL',  name:'Gearbox oil ISO 320',     manufacturer:'Servo (IOCL)',   uom:'litre',min_stock:80,on_hand:40, consumed_30d:60,status:'low',      linked_components:['Gearbox'],           applies_to:['JSW-EOT-14','JSW-EOT-19'] },
    { id:'sp_705', part_number:'BR-PAD-XN800',   name:'Brake pad · XN800',       manufacturer:'Kone OEM',       uom:'each', min_stock:4, on_hand:6, consumed_30d:2, status:'ok',       linked_components:['Brake assembly'],    applies_to:['JSW-EOT-05'] },
    { id:'sp_706', part_number:'MTR-BRG-6314',   name:'Motor bearing · 6314',    manufacturer:'SKF',            uom:'each', min_stock:6, on_hand:2, consumed_30d:5, status:'critical', linked_components:['Main motor'],        applies_to:['JSW-EOT-05','JSW-EOT-14','JSW-EOT-19'] },
    { id:'sp_707', part_number:'LS-SWITCH-4P',   name:'Limit switch · 4-pole',   manufacturer:'Schneider',      uom:'each', min_stock:4, on_hand:5, consumed_30d:2, status:'ok',       linked_components:['Limit switch'],      applies_to:['JSW-EOT-19','JSW-EOT-22'] },
    { id:'sp_708', part_number:'END-WHL-CD90',   name:'End truck wheel · CD90',  manufacturer:'ElectroMech',    uom:'each', min_stock:2, on_hand:1, consumed_30d:1, status:'low',      linked_components:['End truck wheels'],  applies_to:['JSW-EOT-22','JSW-SG-11'] },
    { id:'sp_709', part_number:'VFD-P560',       name:'VFD drive · P560',        manufacturer:'ABB',            uom:'each', min_stock:1, on_hand:1, consumed_30d:0, status:'ok',       linked_components:['Electrical panel'],  applies_to:['JSW-EOT-05'] },
    { id:'sp_710', part_number:'CHAIN-MR20',     name:'Chain hoist · MR20 links',manufacturer:'Stahl',          uom:'link', min_stock:60,on_hand:80, consumed_30d:12,status:'ok',       linked_components:['Chain hoist'],       applies_to:['JSW-MR-02'] }
  ];

  const eventTypes = [
    { code:'PM_OVERDUE',       label:'PM overdue',                          default_channels:['inapp','email'] },
    { code:'PM_DUE',           label:'PM due within 3 days',                default_channels:['inapp'] },
    { code:'INSP_FAIL',        label:'Inspection fail (severity ≥ major)',  default_channels:['inapp','email','push'] },
    { code:'BREAKDOWN',        label:'Breakdown reported',                  default_channels:['inapp','email','push'] },
    { code:'REPEAT_FLAG',      label:'Repeat-failure flag raised',          default_channels:['inapp','email','push'] },
    { code:'CERT_EXPIRING',    label:'Certificate expiring < 30d',          default_channels:['inapp','email'] },
    { code:'STAT_DUE',         label:'Statutory inspection due',            default_channels:['inapp','email'] },
    { code:'SPARE_LOW',        label:'Critical spare below min',            default_channels:['inapp','email'] },
    { code:'ACTION_OVERDUE',   label:'Corrective action overdue',           default_channels:['inapp'] }
  ];

  const notifications = [
    { id:'nt_1001', ts:'2026-09-14T08:14:00', type:'REPEAT_FLAG',   title:'Repeat-failure flag raised: Brake coil (JSW-EOT-22)', body:'3 failures in 120 days · ₹4.2L est. loss · investigation SLA 48 hrs', tone:'danger', read:false },
    { id:'nt_1002', ts:'2026-09-14T07:42:00', type:'PM_OVERDUE',    title:'PM task overdue: Brake system inspection (JSW-EOT-22)', body:'9 days overdue · assigned to Vikram Rao',                            tone:'warn',   read:false },
    { id:'nt_1003', ts:'2026-09-13T18:03:00', type:'BREAKDOWN',     title:'Breakdown reported: Hoist limit switch (JSW-EOT-19)',   body:'3 hrs downtime · investigation opened',                              tone:'danger', read:false },
    { id:'nt_1004', ts:'2026-09-13T11:15:00', type:'INSP_FAIL',     title:'Inspection fail: Rolling mill EOT #5 (JSW-EOT-05)',      body:'6 findings · critical severity · Ravi Shankar',                     tone:'danger', read:true  },
    { id:'nt_1005', ts:'2026-09-12T09:44:00', type:'CERT_EXPIRING', title:'Load test certificate expiring: JSW-EOT-14',              body:'10 days remaining · Prime Cert TPI · schedule renewal',              tone:'warn',   read:true  },
    { id:'nt_1006', ts:'2026-09-11T15:20:00', type:'SPARE_LOW',     title:'Critical spare below minimum: Motor bearing 6314',        body:'On-hand 2 · min 6 · consumed 5 in 30d · reorder immediately',        tone:'warn',   read:true  },
    { id:'nt_1007', ts:'2026-09-10T14:00:00', type:'STAT_DUE',      title:'Statutory inspection due: Load test (JSW-EOT-14)',        body:'Factories Act §29 · Prime Cert TPI · 10 days',                       tone:'info',   read:true  },
    { id:'nt_1008', ts:'2026-09-10T10:18:00', type:'INSP_FAIL',     title:'Inspection findings: Quarterly Structural (JSW-EOT-22)', body:'2 findings · major severity · action opened',                        tone:'warn',   read:true  }
  ];

  const users = [
    { id:'usr_1', name:'Ravi Mehta',     email:'ravi@rig.co.in',      role:'Reliability Manager',     scope:'Organization',      status:'active',   mfa:true,  last_active:'2 min ago',  avatar_initials:'RM' },
    { id:'usr_2', name:'Priya Nair',     email:'priya@rig.co.in',     role:'Organization Admin',      scope:'Organization',      status:'active',   mfa:true,  last_active:'1 hr ago',   avatar_initials:'PN' },
    { id:'usr_3', name:'Sanjay Iyer',    email:'sanjay@rig.co.in',    role:'Plant Manager',           scope:'Jamshedpur SW',     status:'active',   mfa:true,  last_active:'20 min ago', avatar_initials:'SI' },
    { id:'usr_4', name:'Vikram Rao',     email:'vikram@rig.co.in',    role:'Plant Engineer',          scope:'Jamshedpur SW',     status:'active',   mfa:false, last_active:'6 hr ago',   avatar_initials:'VR' },
    { id:'usr_5', name:'Anjali Kumar',   email:'anjali@rig.co.in',    role:'Maintenance Supervisor',  scope:'Jamshedpur SW · Cranes 101-108', status:'active', mfa:true,  last_active:'yesterday', avatar_initials:'AK' },
    { id:'usr_6', name:'Ravi Shankar',   email:'ravi.s@rig.co.in',    role:'Technician',              scope:'Cranes 103, 107',   status:'active',   mfa:false, last_active:'3 hr ago',   avatar_initials:'RS' },
    { id:'usr_7', name:'Deepa Menon',    email:'d.menon@primecert.in',role:'TPI Auditor',             scope:'Read-only · statutory only', status:'active', mfa:true, last_active:'2 days ago', avatar_initials:'DM' },
    { id:'usr_8', name:'Arjun Verma',    email:'arjun@rig.co.in',     role:'Plant Engineer',          scope:'Pune Fabrication',  status:'invited',  mfa:false, last_active:'—',          avatar_initials:'AV' }
  ];

  const roleMatrix = [
    { role:'Super Admin (Pari)',           v_assets:true,        perform_inspection:true,  report_breakdown:true, close_action:true,  edit_duty:true,  manage_users:true,  view_compliance:true,  delete_records:true  },
    { role:'Organization Admin',           v_assets:true,        perform_inspection:true,  report_breakdown:true, close_action:true,  edit_duty:false, manage_users:true,  view_compliance:true,  delete_records:false },
    { role:'Plant Manager',                v_assets:'plant',     perform_inspection:false, report_breakdown:true, close_action:true,  edit_duty:false, manage_users:false, view_compliance:true,  delete_records:false },
    { role:'Reliability Manager',          v_assets:true,        perform_inspection:false, report_breakdown:true, close_action:true,  edit_duty:false, manage_users:false, view_compliance:true,  delete_records:false },
    { role:'Plant Engineer',               v_assets:true,        perform_inspection:true,  report_breakdown:true, close_action:true,  edit_duty:false, manage_users:false, view_compliance:true,  delete_records:false },
    { role:'Maintenance Supervisor',       v_assets:'assigned',  perform_inspection:true,  report_breakdown:true, close_action:true,  edit_duty:false, manage_users:false, view_compliance:false, delete_records:false },
    { role:'Technician',                   v_assets:'assigned',  perform_inspection:true,  report_breakdown:true, close_action:false, edit_duty:false, manage_users:false, view_compliance:false, delete_records:false }
  ];

  window.PARI = {
    org, plants, currentPlant, kpis, breakdownTrend, pmTrend,
    cranes, inspections, pmTasks, breakdowns, repeatFlags, activity, statutoryAlerts,
    fleetInspections, fleetPmTasks, fleetBreakdowns, fleetRepeatFlags, fleetDocuments, fleetStatutory,
    spares, eventTypes, notifications, users, roleMatrix
  };
})();
