import { response } from "express";
import doctorService from "../services/doctorService"

let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) limit = 10;

    try {
        let response = await doctorService.getTopDoctorHomeService(+limit);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctorsService();
        return res.status(200).json(doctors);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let postInforDoctors = async (req, res) => {
    try {
        let response = await doctorService.postInforDoctorsService(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getDetailDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getDetailDoctorByIdService(req.query.id);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let bulkCreateSchedule = async (req, res) => {
    try {
        let infor = await doctorService.bulkCreateScheduleService(req.body);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getScheduleByDate = async (req, res) => {
    try {
        let infor = await doctorService.getScheduleByDateService(req.query.doctorId, req.query.date);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getExtraInforDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getExtraInforDoctorByIdService(req.query.doctorId);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getProfileDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getProfileDoctorByIdIdService(req.query.doctorId);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getListPatientForDoctor = async (req, res) => {
    try {
        let infor = await doctorService.getListPatientForDoctorIdService(req.query.doctorId, req.query.date);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let sendRemedy = async (req, res) => {
    try {
        let infor = await doctorService.sendRemedyService(req.body);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    postInforDoctors: postInforDoctors,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule,
    getScheduleByDate,
    getExtraInforDoctorById,
    getProfileDoctorById, getListPatientForDoctor, sendRemedy

}