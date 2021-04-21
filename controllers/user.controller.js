const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.register = function (req, res) {
    User.findOne(
        {
            email: req.body.email
        },
        function (err, user) {
            if (err) {
                throw err;
            }

            const new_user = new User({
                fName: req.body.fName,
                lName: req.body.lName,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                userName: req.body.userName,
                password: req.body.password
            });

            if (user) {
                res.json({
                    success: false,
                    message: "User already exists."
                });
            } else {
                new_user.save(function (error, result) {
                    if (error) {
                        res.json({
                            success: false,
                            message: "User registration failed."
                        });
                    }
                    return res.json({
                        success: true,
                        message: "User registration successful."
                    });
                });
            }
        }
    );
};

exports.login = function (req, res) {
    User.findOne(
        {
            email: req.body.email
        },
        function (err, user) {
            if (err) {
                throw err;
            }

            if (user) {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (err) {
                        throw err;
                    }

                    if (isMatch) {
                        const payload = {
                            userid: user._id,
                            fName: user.fName,
                            lName: user.lName,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            userName: user.userName,
                        };

                        var token = jwt.sign(payload, "BMIEncrypt", {
                            expiresIn: 60 * 60 * 60 * 240
                        });

                        res.json({
                            success: true,
                            message: "Access token generation successfull.",
                            token: token,
                        });

                    } else {
                        res.json({
                            success: false,
                            message: "Authentication failed. Wrong password."
                        });
                    }
                });
            } else {
                res.json({
                    success: false,
                    message: "Authentication failed. User not found."
                });
            }
        }
    );
};

exports.updateUser = function (req, res) {
    User.findOne({ _id: req.body.userId })
        .then(async user => {
            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: "We were unable to find a user for this user."
                });
            }
            if (req.body.fName) {
                user.fName = req.body.fName;
            }
            if (req.body.lName) {
                user.lName = req.body.lName;
            }
            if (req.body.phoneNumber) {
                user.phoneNumber = req.body.phoneNumber;
            }
            if (req.body.height) {
                user.height = req.body.height;
            }
            if (req.body.weight) {
                user.weight = req.body.weight;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            if(user.height && user.weight){
                let height = user.height;
                let weight = user.weight;
                let bmi = (weight / ((height * height)
                    / 10000)).toFixed(2);
                let bmiResult = "normal";
                if (bmi < 18.6) {
                    bmiResult = "under-weight";
                }
                else if (bmi >= 18.6 && bmi < 24.9) {
                    bmiResult = "normal";
                } else {
                    bmiResult = "over-weight";
                }

                if(user.bmi != bmi){
                    user.bmi = bmi;
                    var email = "saich7070@gmail.com";
                    var password = "July@123";
                    var transporter = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user: email,
                        pass: password
                      }
                    });
              
                    console.log("transporter")
              
                    let unHealthyCodeDataToSend=`Here are some healthy ways to gain weight when you're ${bmiResult}: 
                    <br/>
                    <br/>
                    Eat more frequently. When you're underweight, you may feel full faster. Eat five to six smaller meals during the day rather than two or three large meals.
                    <br/>
                    <br/>
                    Choose nutrient-rich foods. As part of an overall healthy diet, choose whole-grain breads, pastas and cereals; fruits and vegetables; dairy products; lean protein sources; and nuts and seeds.
                    <br/>
                    <br/>
                    Try smoothies and shakes. Don't fill up on diet soda, coffee and other drinks with few calories and little nutritional value. Instead, drink smoothies or healthy shakes made with milk and fresh or frozen fruit, and sprinkle in some ground flaxseed. In some cases, a liquid meal replacement may be recommended.
                    <br/>
                    <br/>
                    Watch when you drink. Some people find that drinking fluids before meals blunts their appetite. In that case, it may be better to sip higher calorie beverages along with a meal or snack. For others, drinking 30 minutes after a meal, not with it, may work.
                    `
            
                    let healthyText = `you're healthy keep it up`
                    user.result = bmiResult;
                    var mailOptions = {
                      from: email,
                      to: user.email,
                      subject: "BMI Report",
                      html: `<html><body>${bmiResult == "normal"?healthyText:unHealthyCodeDataToSend}</body></html>`
                    };
                    await new Promise((resolve,reject)=>{
                        transporter
                          .sendMail(mailOptions)
                          .then(response => {
                            resolve()
                          })
                          .catch(error => {
                            reject()
                          });
                    });
                }
            }
            user
                    .save()
                    .then(result => {
                        return res.json({
                            success: true,
                            message: "Updated successfully",
                        });
                    })
                    .catch(error => {
                        return res
                            .status(500)
                            .json({ success: false, message: error.message });
                    });
        })
        .catch(error => {
            return res.status(500).json({ success: false, message: error.message });
        });
};
