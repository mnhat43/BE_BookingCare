import nodemailer from "nodemailer";

require('dotenv').config();

let sendSimpleEmail = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: '"DAO MINH NHAT" <mnhnhat0403@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: getBodyHTMLEmail(dataSend), // html body
    });
}


let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result = `
        <h3> Xin chào ${dataSend.patientName} </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên DoctorCare</p>
        <p>Thông tin đặt lịch khám bệnh: </p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b> </div>
        <p>Nếu các thông tin trên là đúng sự thật, vui lòng nhấn vào đường link bên dưới để hoàn tất thủ tục đặt lịch khám bệnh. </p>
        <div><a href=${dataSend.redirectLink}>Ấn vào đây</a></div>
        <div>Xin chân thành cảm ơn</div>
    `
    }
    if (dataSend.language === 'en') {
        result = `
        <h3> Dear ${dataSend.patientName} </h3>
         <p>You received this email because you made an online medical appointment on DoctorCare</p>
         <p>Information for scheduling medical examination: </p>
         <div><b>Time: ${dataSend.time}</b></div>
         <div><b>Doctor: ${dataSend.doctorName}</b> </div>
         <p>If the above information is true, please click on the link below to complete the procedure for scheduling a medical examination. </p>
         <div><a href=${dataSend.redirectLink}>Click here</a></div>
         <div>Thank you very much</div>
    `
    }
    return result;
}

let getBodyHTMLEmailRemedy = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result = `
        <h3> Xin chào ${dataSend.patientName} </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên DoctorCare thành công</p>
        <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm. </p>
        <div>Xin chân thành cảm ơn</div>
    `
    }
    if (dataSend.language === 'en') {
        result = `
        <h3> Dear ${dataSend.patientName} </h3>
         <p>You received this email because you made an online medical appointment on DoctorCare SUCCESS</p>
         <p>Prescription/invoice information is sent in the attached file.</p>
         <div>Thank you very much</div>
    `
    }
    return result;
}

let sendAttachment = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: '"DAO MINH NHAT" <mnhnhat0403@gmail.com>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Kết quả đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmailRemedy(dataSend), // html body
        attachments: [
            {
                filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
                content: dataSend.imgBase64.split("base64,")[1],
                encoding: 'base64'
            }
        ]
    });
}

module.exports = {
    sendSimpleEmail,
    sendAttachment
}
