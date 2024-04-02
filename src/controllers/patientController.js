import { response } from "express";
import patientService from "../services/patientService"

let postBookAppoiment = async (req, res) => {
    try {
        let data = await patientService.postBookAppoimentService(req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let postVerifyBookAppoiment = async (req, res) => {
    try {
        let data = await patientService.postVerifyBookAppoimentService(req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

module.exports = {
    postBookAppoiment,
    postVerifyBookAppoiment
}