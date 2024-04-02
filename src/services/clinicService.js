
import db from '../models/index';
require('dotenv').config();

let createNewClinicService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown || !data.address) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!',
                });
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                })

                resolve({
                    errCode: 0,
                    errMessage: "Save clinic succeed! "
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getAllClinicService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll();

            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            if (!data) data = {};

            resolve({
                errCode: 0,
                errMessage: "Get All Clinic succeed! ",
                data
            })
        }
        catch (e) {
            reject(e)
        }
    })
}

let getDetailClinicByIdService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!',
                });
            } else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: id
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name', 'address', 'image'],
                })
                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (data) {
                    let doctorClinic = await db.Doctor_Infor.findAll({
                        where: { clinicId: id },
                        attributes: ['doctorId', 'provinceId'],
                    })

                    data.doctorClinic = doctorClinic;
                } else data = {}

                resolve({
                    errCode: 0,
                    errMessage: "Get Detail Clinic By Id succeed! ",
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
    createNewClinicService, getAllClinicService, getDetailClinicByIdService
}
