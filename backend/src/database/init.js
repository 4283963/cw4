const { v4: uuidv4 } = require('uuid');
const {
  sequelize,
  Drug,
  Prescription,
  PrescriptionItem,
  DrugConflict,
  ReviewRecord,
  User
} = require('../models');
const { PRESCRIPTION_STATUS, CONFLICT_SEVERITY, USER_ROLE } = require('../config');

const generatePrescriptionNo = () => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RX${dateStr}${random}`;
};

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');

    await sequelize.sync({ force: true });
    console.log('✓ 数据库表重建完成');

    const userData = [
      {
        id: uuidv4(),
        username: 'admin',
        password: '123456',
        realName: '系统管理员',
        role: USER_ROLE.ADMIN,
        department: '信息科',
        title: '系统管理员',
        phone: '13800000000',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: 'doctor_wang',
        password: '123456',
        realName: '王医生',
        role: USER_ROLE.DOCTOR,
        department: '内科',
        title: '主治医师',
        phone: '13800000001',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: 'pharmacist_chen',
        password: '123456',
        realName: '陈药师',
        role: USER_ROLE.PHARMACIST,
        department: '药学部',
        title: '药师',
        phone: '13800000002',
        status: 'active'
      },
      {
        id: uuidv4(),
        username: 'senior_li',
        password: '123456',
        realName: '李主管药师',
        role: USER_ROLE.SENIOR_PHARMACIST,
        department: '药学部',
        title: '主管药师',
        phone: '13800000003',
        status: 'active'
      }
    ];

    const createdUsers = await User.bulkCreate(userData);
    console.log(`✓ 插入用户数据: ${createdUsers.length} 条`);

    const drugData = [
      {
        id: uuidv4(),
        name: '阿莫西林胶囊',
        code: 'DRG001',
        category: '抗生素',
        specification: '0.25g*24粒',
        manufacturer: '华北制药',
        unit: '盒',
        dosage: '口服，一次0.5g，每6-8小时1次',
        contraindications: '青霉素过敏者禁用',
        sideEffects: '恶心、呕吐、腹泻等胃肠道反应'
      },
      {
        id: uuidv4(),
        name: '头孢克肟分散片',
        code: 'DRG002',
        category: '抗生素',
        specification: '0.1g*6片',
        manufacturer: '石药集团',
        unit: '盒',
        dosage: '口服，一次0.1g，一日2次',
        contraindications: '头孢类过敏者禁用',
        sideEffects: '皮疹、瘙痒、腹泻等'
      },
      {
        id: uuidv4(),
        name: '布洛芬缓释胶囊',
        code: 'DRG003',
        category: '解热镇痛药',
        specification: '0.3g*20粒',
        manufacturer: '中美史克',
        unit: '盒',
        dosage: '口服，一次0.3g，每12小时1次',
        contraindications: '胃溃疡、严重肝肾功能不全者禁用',
        sideEffects: '胃肠道不适、头晕等'
      },
      {
        id: uuidv4(),
        name: '阿司匹林肠溶片',
        code: 'DRG004',
        category: '解热镇痛药',
        specification: '0.1g*30片',
        manufacturer: '拜耳医药',
        unit: '盒',
        dosage: '口服，一次0.1g，一日1次',
        contraindications: '活动性消化道溃疡、出血倾向者禁用',
        sideEffects: '胃肠道出血、过敏反应等'
      },
      {
        id: uuidv4(),
        name: '奥美拉唑肠溶胶囊',
        code: 'DRG005',
        category: '消化系统用药',
        specification: '20mg*14粒',
        manufacturer: '阿斯利康',
        unit: '盒',
        dosage: '口服，一次20mg，一日1次，晨起吞服',
        contraindications: '对本品过敏者禁用',
        sideEffects: '头痛、腹泻、恶心等'
      },
      {
        id: uuidv4(),
        name: '氯雷他定片',
        code: 'DRG006',
        category: '抗组胺药',
        specification: '10mg*6片',
        manufacturer: '扬子江药业',
        unit: '盒',
        dosage: '口服，一次10mg，一日1次',
        contraindications: '对本品过敏者禁用',
        sideEffects: '嗜睡、口干等'
      },
      {
        id: uuidv4(),
        name: '盐酸二甲双胍缓释片',
        code: 'DRG007',
        category: '降糖药',
        specification: '0.5g*30片',
        manufacturer: '中美上海施贵宝',
        unit: '盒',
        dosage: '口服，一次0.5g，一日2次，随餐服用',
        contraindications: '肾功能不全、酮症酸中毒者禁用',
        sideEffects: '恶心、呕吐、腹泻等胃肠道反应'
      },
      {
        id: uuidv4(),
        name: '硝苯地平控释片',
        code: 'DRG008',
        category: '降压药',
        specification: '30mg*7片',
        manufacturer: '拜耳医药',
        unit: '盒',
        dosage: '口服，一次30mg，一日1次',
        contraindications: '心源性休克、低血压者禁用',
        sideEffects: '头痛、面部潮红、踝部水肿等'
      }
    ];

    const createdDrugs = await Drug.bulkCreate(drugData);
    console.log(`✓ 插入药品数据: ${createdDrugs.length} 条`);

    const drugMap = {};
    createdDrugs.forEach(drug => {
      drugMap[drug.code] = drug;
    });

    const conflictData = [
      {
        drugAId: drugMap['DRG001'].id,
        drugAName: drugMap['DRG001'].name,
        drugBId: drugMap['DRG002'].id,
        drugBName: drugMap['DRG002'].name,
        conflictType: '重复用药',
        severity: CONFLICT_SEVERITY.WARNING,
        description: '阿莫西林和头孢克肟均为β-内酰胺类抗生素，作用机制相似，联用可能增加不良反应风险，且可能诱导细菌耐药性。',
        evidence: '《抗菌药物临床应用指导原则》2015版',
        suggestion: '建议根据药敏结果选择一种抗菌药物，避免不必要的联合用药。'
      },
      {
        drugAId: drugMap['DRG003'].id,
        drugAName: drugMap['DRG003'].name,
        drugBId: drugMap['DRG004'].id,
        drugBName: drugMap['DRG004'].name,
        conflictType: '配伍禁忌',
        severity: CONFLICT_SEVERITY.DANGER,
        description: '布洛芬与阿司匹林同属非甾体抗炎药(NSAIDs)，联用会显著增加胃肠道出血和溃疡的风险，同时可能影响肾功能。',
        evidence: 'FDA药品说明书、《马丁代尔药物大典》',
        suggestion: '严禁联用。如需镇痛退热，建议选择其中一种，并注意监测胃肠道反应。'
      },
      {
        drugAId: drugMap['DRG001'].id,
        drugAName: drugMap['DRG001'].name,
        drugBId: drugMap['DRG005'].id,
        drugBName: drugMap['DRG005'].name,
        conflictType: '药物相互作用',
        severity: CONFLICT_SEVERITY.WARNING,
        description: '奥美拉唑可升高胃内pH值，可能影响阿莫西林的吸收速率和生物利用度，降低抗菌效果。',
        evidence: '《临床药物治疗学》',
        suggestion: '如需联用，建议两药间隔2小时以上服用，或调整服药时间。'
      },
      {
        drugAId: drugMap['DRG003'].id,
        drugAName: drugMap['DRG003'].name,
        drugBId: drugMap['DRG008'].id,
        drugBName: drugMap['DRG008'].name,
        conflictType: '药物相互作用',
        severity: CONFLICT_SEVERITY.WARNING,
        description: '布洛芬可能通过抑制前列腺素合成降低硝苯地平的降压效果，同时增加水钠潴留风险。',
        evidence: '《药物相互作用分析手册》',
        suggestion: '联用期间需密切监测血压，必要时调整降压药物剂量。'
      },
      {
        drugAId: drugMap['DRG007'].id,
        drugAName: drugMap['DRG007'].name,
        drugBId: drugMap['DRG003'].id,
        drugBName: drugMap['DRG003'].name,
        conflictType: '药物相互作用',
        severity: CONFLICT_SEVERITY.WARNING,
        description: '布洛芬可能减弱二甲双胍的降糖效果，且NSAIDs可增加乳酸酸中毒的风险。',
        evidence: '药品说明书及临床研究数据',
        suggestion: '联用期间需密切监测血糖和肾功能，避免长期大量使用布洛芬。'
      }
    ];

    const createdConflicts = await DrugConflict.bulkCreate(conflictData);
    console.log(`✓ 插入配伍禁忌数据: ${createdConflicts.length} 条`);

    const prescriptionList = [
      {
        patientName: '张三',
        patientGender: 'male',
        patientAge: 45,
        patientIdCard: '110101197901011234',
        department: '内科',
        diagnosis: '上呼吸道感染、发热',
        doctorId: uuidv4(),
        doctorName: '王医生',
        status: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW,
        items: [
          { drugCode: 'DRG001', dosage: '口服，一次0.5g，每8小时1次', frequency: '3次/日', quantity: 2, daysSupply: 7, price: 28.50 },
          { drugCode: 'DRG003', dosage: '口服，一次0.3g，发热时服用', frequency: '必要时', quantity: 1, daysSupply: 3, price: 32.00 }
        ]
      },
      {
        patientName: '李四',
        patientGender: 'female',
        patientAge: 68,
        patientIdCard: '110101195705054321',
        department: '心血管内科',
        diagnosis: '高血压、2型糖尿病',
        doctorId: uuidv4(),
        doctorName: '赵医生',
        status: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW,
        items: [
          { drugCode: 'DRG008', dosage: '口服，一次30mg，一日1次', frequency: '1次/日', quantity: 4, daysSupply: 28, price: 38.00 },
          { drugCode: 'DRG007', dosage: '口服，一次0.5g，一日2次', frequency: '2次/日', quantity: 2, daysSupply: 30, price: 26.80 },
          { drugCode: 'DRG003', dosage: '口服，一次0.3g，每12小时1次', frequency: '2次/日', quantity: 1, daysSupply: 10, price: 32.00 }
        ]
      },
      {
        patientName: '王五',
        patientGender: 'male',
        patientAge: 32,
        patientIdCard: '110101199210101234',
        department: '皮肤科',
        diagnosis: '急性荨麻疹',
        doctorId: uuidv4(),
        doctorName: '刘医生',
        status: PRESCRIPTION_STATUS.FIRST_REVIEW_PASSED,
        items: [
          { drugCode: 'DRG006', dosage: '口服，一次10mg，一日1次', frequency: '1次/日', quantity: 2, daysSupply: 12, price: 18.50 },
          { drugCode: 'DRG005', dosage: '口服，一次20mg，一日1次', frequency: '1次/日', quantity: 1, daysSupply: 14, price: 56.00 }
        ],
        firstReviewerId: uuidv4(),
        firstReviewerName: '陈药师',
        firstReviewTime: new Date(),
        firstReviewComment: '用药合理，审核通过'
      },
      {
        patientName: '赵六',
        patientGender: 'male',
        patientAge: 55,
        patientIdCard: '110101197003035678',
        department: '消化内科',
        diagnosis: '胃溃疡、幽门螺杆菌感染',
        doctorId: uuidv4(),
        doctorName: '孙医生',
        status: PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW,
        items: [
          { drugCode: 'DRG001', dosage: '口服，一次1.0g，每12小时1次', frequency: '2次/日', quantity: 3, daysSupply: 14, price: 28.50 },
          { drugCode: 'DRG005', dosage: '口服，一次20mg，一日2次', frequency: '2次/日', quantity: 2, daysSupply: 14, price: 56.00 }
        ],
        firstReviewerId: uuidv4(),
        firstReviewerName: '陈药师',
        firstReviewTime: new Date(),
        firstReviewComment: '注意药物相互作用，阿莫西林间隔2小时服用，建议二审确认'
      },
      {
        patientName: '钱七',
        patientGender: 'female',
        patientAge: 60,
        patientIdCard: '110101196506068765',
        department: '骨科',
        diagnosis: '类风湿性关节炎、高血压',
        doctorId: uuidv4(),
        doctorName: '周医生',
        status: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW,
        items: [
          { drugCode: 'DRG003', dosage: '口服，一次0.3g，每12小时1次', frequency: '2次/日', quantity: 2, daysSupply: 20, price: 32.00 },
          { drugCode: 'DRG004', dosage: '口服，一次0.1g，一日1次', frequency: '1次/日', quantity: 1, daysSupply: 30, price: 16.80 },
          { drugCode: 'DRG008', dosage: '口服，一次30mg，一日1次', frequency: '1次/日', quantity: 4, daysSupply: 28, price: 38.00 }
        ]
      }
    ];

    for (const rx of prescriptionList) {
      const prescription = await Prescription.create({
        id: uuidv4(),
        prescriptionNo: generatePrescriptionNo(),
        patientName: rx.patientName,
        patientGender: rx.patientGender,
        patientAge: rx.patientAge,
        patientIdCard: rx.patientIdCard,
        department: rx.department,
        diagnosis: rx.diagnosis,
        doctorId: rx.doctorId,
        doctorName: rx.doctorName,
        status: rx.status,
        firstReviewerId: rx.firstReviewerId || null,
        firstReviewerName: rx.firstReviewerName || null,
        firstReviewTime: rx.firstReviewTime || null,
        firstReviewComment: rx.firstReviewComment || null,
        remark: rx.remark || ''
      });

      let sortOrder = 1;
      for (const item of rx.items) {
        const drug = drugMap[item.drugCode];
        await PrescriptionItem.create({
          id: uuidv4(),
          prescriptionId: prescription.id,
          drugId: drug.id,
          drugName: drug.name,
          drugCode: drug.code,
          specification: drug.specification,
          dosage: item.dosage,
          frequency: item.frequency,
          quantity: item.quantity,
          unit: drug.unit,
          daysSupply: item.daysSupply,
          price: item.price,
          subtotal: (item.quantity * item.price).toFixed(2),
          sortOrder: sortOrder++
        });
      }
    }
    console.log(`✓ 插入处方数据: ${prescriptionList.length} 条`);

    console.log('\n========== 数据初始化完成 ==========');
    console.log('用户数据:', createdUsers.length, '条');
    console.log('药品数据:', createdDrugs.length, '条');
    console.log('配伍禁忌数据:', createdConflicts.length, '条');
    console.log('处方数据:', prescriptionList.length, '条');
    console.log('\n========== 测试账号（密码均为 123456） ==========');
    console.log('• 管理员: admin / 123456');
    console.log('• 医生: doctor_wang / 123456');
    console.log('• 药师(一审): pharmacist_chen / 123456');
    console.log('• 主管药师(二审): senior_li / 123456');
    console.log('\n✓ 危险配伍示例: 布洛芬 + 阿司匹林 (已录入)');
    console.log('✓ 警告配伍示例: 阿莫西林 + 头孢克肟 (已录入)');

    process.exit(0);
  } catch (error) {
    console.error('✗ 数据初始化失败:', error);
    process.exit(1);
  }
};

seedData();
