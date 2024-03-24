import db from '../models/index'
import CRUDService from '../services/CRUDServices'

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        // console.log(data);
        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        })
    } catch (error) {
        console.log(error)
    }
}

let getCRUD = async (req, res) => {
    try {
        return res.render('crud.ejs')
    } catch (error) {
        console.log(error)
    }
}

let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUsers(req.body);
    console.log(req.body);
    return res.send("post crud");
}

let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    return res.render('displayCRUD', {
        dataTable: data
    });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;

    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('editCRUD', {
            user: userData
        })
    }
    else {
        return res.send("User not found !");

    }
}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUser = await CRUDService.updateUserData(data);
    return res.render('displayCRUD', {
        dataTable: allUser
    });
}

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (id) {
        // let allUser = 
        await CRUDService.deleteUserById(id);
        // return res.render('displayCRUD', {
        //     dataTable: allUser
        // });
        return res.send("Delete succeed");

    } else {
        return res.send("NOT FOUND !");
    }

}


module.exports = {
    getHomePage,
    getCRUD,
    postCRUD,
    displayGetCRUD,
    getEditCRUD,
    putCRUD,
    deleteCRUD
}