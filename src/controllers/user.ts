import { NextFunction, Request, Response } from "express";
import { NewUserType } from "../types/types";
import { User } from "../models/user";

export async function createUser(
    req: Request<{}, {}, NewUserType>,
    res: Response,
) {
    const { _id, name, email, photo, gender, dob } = req.body;


    console.log(req.body)
    let user = await User.findById(_id);

    if (user) {
        return res.status(400).json({
            success: false,
            message: "User already exist",
        });
    }

    if (!_id || !name || !gender || !photo || !email || !dob) {
        // create error handler
        return res.status(400).json({
            success: false,
            message: "Please enter all fields",
        });
    }

    user = await User.create({
        _id,
        name,
        email,
        photo,
        gender,
        dob,
    })

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
    })
}

export async function getUsers(req, res) {
    const users = await User.find();

    if (!users) {
        return res.status(400).json({
            success: false,
            message: "No user found"
        });
    }
    return res.status(400).json({
        success: true,
        data: users
    });
}

export async function getUser(req, res) {
    const id = req.params.id;

    console.log(req.query);

    const user = await User.findById(id);

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: user
    });
}
export async function deleteUser(req, res) {
    const id = req.params.id;

    const user = await User.findById(id);
    console.log(user)
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        });
    }

    await user.deleteOne();

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
}