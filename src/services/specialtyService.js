import db from '../models/index';
require('dotenv').config();

let createNewSpecialtyService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!',
                });
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                })

                resolve({
                    errCode: 0,
                    errMessage: "Save specialty succeed! "
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getAllSpecialtyService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll();

            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            if (!data) data = {};

            resolve({
                errCode: 0,
                errMessage: "Get All Specialty succeed! ",
                data
            })
        }
        catch (e) {
            reject(e)
        }
    })
}

let getDetailSpecialtyByIdService = (id, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!',
                });
            } else {
                let data = await db.Specialty.findOne({
                    where: {
                        id: id
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name'],
                })

                if (data) {
                    let doctorSpecialty = []
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: { specialtyId: id },
                            attributes: ['doctorId', 'provinceId'],

                        })
                    } else {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                specialtyId: id,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId'],
                        })
                    }

                    data.doctorSpecialty = doctorSpecialty;
                } else data = {}

                resolve({
                    errCode: 0,
                    errMessage: "Get Detail Specialty By Id succeed! ",
                    data
                })

            }
        }
        catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createNewSpecialtyService,
    getAllSpecialtyService,
    getDetailSpecialtyByIdService
}