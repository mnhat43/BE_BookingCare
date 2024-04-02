import e, { response } from 'express';
import db from '../models/index';
import _ from 'lodash';
import emailService from '../services/emailService';


require('dotenv').config();
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHomeService = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limit,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    {
                        model: db.Allcode,
                        as: 'positionData',
                        attributes: ['valueEn', 'valueVi']
                    },
                    {
                        model: db.Allcode,
                        as: 'genderData',
                        attributes: ['valueEn', 'valueVi']
                    }
                ],
                raw: true,
                nest: true

            })

            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e)
        }
    })
}

let getAllDoctorsService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' }
            })

            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (error) {
            reject(error);
        }
    })
}

let checkRequiredFields = (inputData) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action',
        'selectedPrice', 'selectedPayment', 'selectedProvince', 'nameClinic',
        'addressClinic', 'note', 'specialtyId'];

    let isValid = true;
    let element = '';
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }

    return {
        isValid,
        element
    }
}

let postInforDoctorsService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("input>>:", inputData);
            let checkObj = checkRequiredFields(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter1:  ${checkObj.element} `,
                })
            } else {
                //UPSERT to Markdown
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create(
                        {
                            contentHTML: inputData.contentHTML,
                            contentMarkdown: inputData.contentMarkdown,
                            description: inputData.description,
                            doctorId: inputData.doctorId,
                        })
                } else if (inputData.action === 'EDIT') {
                    let doctors = await db.Markdown.findOne(
                        {
                            where: { doctorId: inputData.doctorId },
                            raw: false
                        })

                    if (doctors) {
                        doctors.contentHTML = inputData.contentHTML;
                        doctors.contentMarkdown = inputData.contentMarkdown;
                        doctors.description = inputData.description;
                        // doctors.updateAt = new Date();
                        await doctors.save();
                    }
                }

                // UPSERT to Doctor_infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false
                })
                if (doctorInfor) {
                    //update
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;

                    await doctorInfor.save();

                } else {
                    //create
                    await db.Doctor_Infor.create(
                        {
                            doctorId: inputData.doctorId,
                            priceId: inputData.selectedPrice,
                            paymentId: inputData.selectedPayment,
                            provinceId: inputData.selectedProvince,
                            nameClinic: inputData.nameClinic,
                            addressClinic: inputData.addressClinic,
                            note: inputData.note,
                            specialtyId: inputData.specialtyId,
                            clinicId: inputData.clinicId,
                        }
                    );
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor succeed!'
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

let getDetailDoctorByIdService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: id
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        {
                            model: db.Allcode,
                            as: 'positionData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                {
                                    model: db.Allcode,
                                    as: 'priceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },
                                {
                                    model: db.Allcode,
                                    as: 'provinceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },
                                {
                                    model: db.Allcode,
                                    as: 'paymentTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

let bulkCreateScheduleService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                //get all existing data
                let existing = await db.Schedule.findAll(
                    {
                        where: { doctorId: data.doctorId, date: data.date },
                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true,
                    }
                )
                // //convert date
                // if (existing && existing.length > 0) {
                //     existing = existing.map(item => {
                //         item.date = new Date(item.date).getTime();
                //         return item;
                //     })
                // }

                //compare diffrent
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });

                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK"
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

let getScheduleByDateService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing require parameter'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: 'timeTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.User,
                            as: 'doctorData',
                            attributes: ['firstName', 'lastName']
                        },
                    ],
                    nest: true,
                    raw: false
                });

                if (!dataSchedule) dataSchedule = [];

                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

let getExtraInforDoctorByIdService = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing require parameter'
                })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: doctorId,
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: 'priceTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Allcode,
                            as: 'provinceTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Allcode,
                            as: 'paymentTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },
                    ],
                    nest: true,
                    raw: false
                });

                if (!data) data = {}
                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

let getProfileDoctorByIdIdService = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing require parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: doctorId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        {
                            model: db.Allcode,
                            as: 'positionData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                {
                                    model: db.Allcode,
                                    as: 'priceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },
                                {
                                    model: db.Allcode,
                                    as: 'provinceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },
                                {
                                    model: db.Allcode,
                                    as: 'paymentTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

let getListPatientForDoctorIdService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing require parameter'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                        statusId: 'S2'
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender'],
                            include: [
                                {
                                    model: db.Allcode,
                                    as: 'genderData',
                                    attributes: ['valueEn', 'valueVi'],
                                },
                            ],
                        },
                        {
                            model: db.Allcode,
                            as: 'timeTypeDataPatient',
                            attributes: ['valueEn', 'valueVi'],
                        },

                    ],
                    nest: true,
                    raw: false
                });
                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}


let sendRemedyService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing require parameter'
                })
            } else {
                //update patient status
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })

                if (appointment) {
                    appointment.statusId = 'S3';
                    await appointment.save();
                }

                //email send remedy
                await emailService.sendAttachment(data);

                resolve({
                    errCode: 0,
                    errMessage: 'Send Remedy Succeed!'

                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    getTopDoctorHomeService: getTopDoctorHomeService,
    getAllDoctorsService: getAllDoctorsService,
    postInforDoctorsService: postInforDoctorsService,
    getDetailDoctorByIdService: getDetailDoctorByIdService,
    bulkCreateScheduleService,
    getScheduleByDateService,
    getExtraInforDoctorByIdService,
    getProfileDoctorByIdIdService, getListPatientForDoctorIdService,
    sendRemedyService
}