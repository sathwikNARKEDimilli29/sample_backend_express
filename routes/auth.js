const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fetchUser = require("../middleware/fetchUser");
var jwt = require("jsonwebtoken");

// JWT secret for signing the token
const JWT_SECRET = "Sathwik143";

var token = jwt.sign({ foo: "bar" }, JWT_SECRET);
const { body, validationResult } = require("express-validator");

// consists of all the endpoints realated to authentication.

// Route 1: Create a User using: POST "/api/auth/createuser". Doesn't require Auth
router.post(
  "/createuser",
  // Defing the validation parameters
  [
    body("name", "Enter a Valid name").isLength({ min: 3 }),
    body("email", "Enter a Valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // checking if the email pertaining to a user exists.
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: "Email already Exists" });
      }

      let salt = await bcrypt.genSalt(10);
      let secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      // id is the fastest way that one can retrieve a document from the database
      const data = {
        user: {
          id: user.id,
        },
      };
      //signing the jwt token
      const authToken = jwt.sign(data, JWT_SECRET);
      const success = true;
      res.json({ authToken, success });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Error occured");
    }
    // .then((user) => {
    //   res.json(user);
    //   console.log(user);
    // })
    // .catch((err) => {
    //   console.error(err.message);
    //   res.status(400).send("Enter a unique entry");
    // });
  }
);

// Route 2: Authenticating a User using: POST "/api/auth/login". Doesn't require Auth
router.post(
  "/login",
  // Defing the validation parameters
  [
    body("email", "Password cannot be blank").isEmail(),
    body("password", "Enter a valid password").exists(),
  ],
  async (req, res) => {
    //displaying errors pertaing to the validation.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // throw an error if the user doesnot exist.
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          error: "Please try to login with correct credentials alpha",
        });
      }

      //comparing the password
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials beta" });
      }

      //sending jwt token
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      const success = true;
      res.json({ authtoken, success });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 3: Get loggedin user details: POST "/api/auth/getuser". login is required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
